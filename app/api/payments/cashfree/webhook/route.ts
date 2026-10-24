import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // Verify signature if provided
    if (signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('[Cashfree Webhook] Invalid signature received');
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
      }
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = String(payload?.type || '');
    interface WebhookData {
      order?: {
        order_id?: string;
        order_amount?: number;
        order_currency?: string;
        order_tags?: Record<string, string>;
      };
      payment?: {
        cf_payment_id?: string | number;
        payment_status?: string;
        payment_amount?: number;
        payment_completion_time?: string;
      };
    }

    const data = (payload?.data || {}) as WebhookData;
    const orderId = data?.order?.order_id || '';
    const paymentStatus = data?.payment?.payment_status || '';
    const paymentId = data?.payment?.cf_payment_id ? String(data.payment.cf_payment_id) : '';

    console.log(`[Cashfree Webhook] Event: ${eventType}, Order: ${orderId}, Status: ${paymentStatus}`);

    if (!orderId) {
      return NextResponse.json({ message: 'No order_id present in webhook' }, { status: 200 });
    }

    // Process payment success
    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'ORDER_PAID_WEBHOOK' ||
      paymentStatus === 'SUCCESS';

    const isFailure =
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ||
      paymentStatus === 'FAILED' ||
      paymentStatus === 'USER_DROPPED';

    try {
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('id, registration_id, registrations(id, registration_id, course_id, batch_id, learner_id)')
        .eq('provider_order_id', orderId)
        .maybeSingle();

      if (paymentRecord) {
        const reg = Array.isArray(paymentRecord.registrations)
          ? paymentRecord.registrations[0]
          : paymentRecord.registrations;

        if (isSuccess && reg) {
          // 1. Mark registration active
          await supabase
            .from('registrations')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', reg.id);

          // 2. Mark payment success
          await supabase
            .from('payments')
            .update({
              status: 'success',
              provider_payment_id: paymentId || `cf_pay_${orderId}`,
              paid_at: data?.payment?.payment_completion_time || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecord.id);

          // 3. Add to batch_learners
          if (reg.learner_id && reg.batch_id && reg.course_id) {
            try {
              await supabase
                .from('batch_learners')
                .upsert(
                  [
                    {
                      learner_id: reg.learner_id,
                      batch_id: reg.batch_id,
                      course_id: reg.course_id,
                      points: 0,
                      attendance: 0,
                    },
                  ],
                  { onConflict: 'batch_id,learner_id', ignoreDuplicates: true }
                );
            } catch (blErr) {
              console.warn('[Cashfree Webhook] batch_learners upsert error:', blErr);
            }
          }
        } else if (isFailure) {
          await supabase
            .from('payments')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecord.id);
        }
      }
    } catch (dbErr) {
      console.warn('[Cashfree Webhook] DB update error:', dbErr);
    }

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('[Cashfree Webhook error]:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
