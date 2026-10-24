import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // Verify Cashfree webhook signature if provided
    if (signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('[Cashfree Webhook] Webhook signature verification failed');
        return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: 'Malformed JSON payload' }, { status: 400 });
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
        payment_currency?: string;
        payment_completion_time?: string;
      };
    }

    const data = (payload?.data || {}) as WebhookData;
    const orderId = data?.order?.order_id || '';
    const paymentStatus = data?.payment?.payment_status || '';
    const paymentId = data?.payment?.cf_payment_id ? String(data.payment.cf_payment_id) : '';
    const paymentAmount = data?.payment?.payment_amount ?? data?.order?.order_amount;
    const paymentCurrency = data?.payment?.payment_currency ?? data?.order?.order_currency ?? 'INR';
    const completionTime = data?.payment?.payment_completion_time || new Date().toISOString();

    console.log(
      `[Cashfree Webhook] Event: ${eventType}, Order: ${orderId}, Status: ${paymentStatus}, PaymentID: ${paymentId}`
    );

    if (!orderId) {
      return NextResponse.json({ message: 'Missing order_id in webhook data' }, { status: 400 });
    }

    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'ORDER_PAID_WEBHOOK' ||
      paymentStatus === 'SUCCESS';

    const isFailure =
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ||
      paymentStatus === 'FAILED' ||
      paymentStatus === 'USER_DROPPED';

    // Query payment record using supabaseAdmin (service role key)
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payments')
      .select('id, registration_id, registrations(id, registration_id, course_id, batch_id, learner_id)')
      .eq('provider_order_id', orderId)
      .maybeSingle();

    if (findError) {
      console.error('[Cashfree Webhook] Error querying database for order:', findError);
      return NextResponse.json(
        { message: `Database error querying payment: ${findError.message}` },
        { status: 500 }
      );
    }

    if (!paymentRecord) {
      console.warn(`[Cashfree Webhook] No payment record found for order ${orderId}`);
      return NextResponse.json(
        { message: `Payment record for order ${orderId} not found` },
        { status: 404 }
      );
    }

    const reg = Array.isArray(paymentRecord.registrations)
      ? paymentRecord.registrations[0]
      : paymentRecord.registrations;

    if (isSuccess && reg) {
      // 1. Update payments table with Cashfree return data
      const { error: payUpdateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'success',
          provider_payment_id: paymentId || `cf_pay_${orderId}`,
          amount: paymentAmount,
          currency: paymentCurrency,
          paid_at: completionTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);

      if (payUpdateError) {
        console.error('[Cashfree Webhook] Failed to update payments table:', payUpdateError);
        return NextResponse.json(
          { message: `Failed to update payment record: ${payUpdateError.message}` },
          { status: 500 }
        );
      }

      // 2. Update registrations table with status 'active' and final amount
      const { error: regUpdateError } = await supabaseAdmin
        .from('registrations')
        .update({
          status: 'active',
          amount: paymentAmount,
          currency: paymentCurrency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reg.id);

      if (regUpdateError) {
        console.error('[Cashfree Webhook] Failed to update registrations table:', regUpdateError);
        return NextResponse.json(
          { message: `Failed to update registration record: ${regUpdateError.message}` },
          { status: 500 }
        );
      }

      // 3. Enroll learner into batch_learners
      if (reg.learner_id && reg.batch_id && reg.course_id) {
        const { error: blError } = await supabaseAdmin
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

        if (blError) {
          console.error('[Cashfree Webhook] Failed to upsert batch_learners:', blError);
          return NextResponse.json(
            { message: `Failed to enroll learner in batch: ${blError.message}` },
            { status: 500 }
          );
        }
      }
    } else if (isFailure) {
      const { error: payFailError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'failed',
          provider_payment_id: paymentId || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);

      

      if (payFailError) {
        console.error('[Cashfree Webhook] Failed to mark payment as failed:', payFailError);
        return NextResponse.json(
          { message: `Failed to update payment status: ${payFailError.message}` },
          { status: 500 }
        );
      }

      // Cancel the associated registration after confirmed payment failure
if (reg) {
  const { error: regCancelError } = await supabaseAdmin
    .from('registrations')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reg.id);

  if (regCancelError) {
    console.error(
      '[Cashfree Webhook] Failed to cancel registration:',
      regCancelError
    );

    return NextResponse.json(
      {
        message: `Failed to cancel registration: ${regCancelError.message}`,
      },
      { status: 500 }
    );
  }
}
    }

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown webhook error';
    console.error('[Cashfree Webhook error]:', errorMsg);
    return NextResponse.json({ status: 'error', message: errorMsg }, { status: 500 });
  }
}
