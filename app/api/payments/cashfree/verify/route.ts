import { NextRequest, NextResponse } from 'next/server';
import {
  getCashfreeOrder,
  getCashfreeOrderPayments,
  getCashfreeConfig,
} from '@/lib/cashfree';
import { supabase } from '@/lib/supabase';

async function handleVerification(orderId: string) {
  if (!orderId) {
    return NextResponse.json(
      { success: false, error: 'Order ID is required' },
      { status: 400 }
    );
  }

  const config = getCashfreeConfig();

  let orderData;
  let paymentsData = [];

  try {
    orderData = await getCashfreeOrder(orderId);
    paymentsData = await getCashfreeOrderPayments(orderId);
  } catch (err: unknown) {
    console.error('[Cashfree verify] Error calling Cashfree API:', err);
    // If running in development/mock mode without keys
    if (!config.hasCredentials) {
      orderData = {
        order_id: orderId,
        order_status: 'PAID' as const,
        order_amount: 1000,
        order_currency: 'INR',
      };
      paymentsData = [
        {
          cf_payment_id: `mock_pay_${Date.now()}`,
          order_id: orderId,
          payment_status: 'SUCCESS' as const,
          payment_amount: 1000,
          payment_currency: 'INR',
          payment_time: new Date().toISOString(),
        },
      ];
    } else {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve order';
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
  }

  const isOrderPaid = orderData.order_status === 'PAID';
  const successfulPayment = paymentsData.find(
    (p) => p.payment_status === 'SUCCESS'
  );

  const isSuccessful = isOrderPaid || Boolean(successfulPayment);

  // Look up payment & registration in database
  let registrationInfo: {
    id?: string;
    registration_id?: string;
    course_id?: string;
    batch_id?: string;
    learner_id?: string;
    amount?: number;
    currency?: string;
  } | null = null;

  try {
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('id, registration_id, registrations(id, registration_id, course_id, batch_id, learner_id, amount, currency, status)')
      .eq('provider_order_id', orderId)
      .maybeSingle();

    if (paymentRecord) {
      const reg = Array.isArray(paymentRecord.registrations)
        ? paymentRecord.registrations[0]
        : paymentRecord.registrations;

      if (reg) {
        registrationInfo = reg;

        if (isSuccessful) {
          // 1. Mark registration as active
          await supabase
            .from('registrations')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', reg.id);

          // 2. Mark payment as success
          await supabase
            .from('payments')
            .update({
              status: 'success',
              provider_payment_id: successfulPayment?.cf_payment_id
                ? String(successfulPayment.cf_payment_id)
                : `cf_pay_${orderId}`,
              paid_at: successfulPayment?.payment_completion_time || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecord.id);

          // 3. Add to batch_learners if learner_id is valid uuid
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
              console.warn('[Cashfree verify] Upsert into batch_learners error:', blErr);
            }
          }
        } else if (
          orderData.order_status === 'EXPIRED' ||
          paymentsData.some((p) => p.payment_status === 'FAILED')
        ) {
          // Mark payment failed
          await supabase
            .from('payments')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecord.id);
        }
      }
    }
  } catch (dbErr) {
    console.warn('[Cashfree verify] Database lookup/update skipped or error:', dbErr);
  }

  if (isSuccessful) {
    return NextResponse.json({
      success: true,
      status: 'PAID',
      order_id: orderId,
      registration_id: registrationInfo?.registration_id || null,
      course_id: registrationInfo?.course_id || null,
      batch_id: registrationInfo?.batch_id || null,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      payment: successfulPayment || null,
    });
  }

  return NextResponse.json({
    success: false,
    status: orderData.order_status || 'PENDING',
    order_id: orderId,
    message: 'Payment has not been completed yet or was cancelled.',
    payments: paymentsData,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id') || '';
  return handleVerification(orderId);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.order_id || '';
    return handleVerification(orderId);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
