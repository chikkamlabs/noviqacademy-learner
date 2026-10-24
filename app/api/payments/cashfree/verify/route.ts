import { NextRequest, NextResponse } from 'next/server';
import { getCashfreeOrder, getCashfreeOrderPayments } from '@/lib/cashfree';
import { supabaseAdmin } from '@/lib/supabase';

async function handleVerification(orderId: string) {
  if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
    return NextResponse.json(
      { success: false, error: 'Validation error: order_id is required' },
      { status: 400 }
    );
  }

  const cleanOrderId = orderId.trim();

  // 1. Fetch real order and payment details from Cashfree PG API (No dummy data)
  let orderData;
  let paymentsData = [];

  try {
    orderData = await getCashfreeOrder(cleanOrderId);
    paymentsData = await getCashfreeOrderPayments(cleanOrderId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve order from Cashfree';
    console.error('[Cashfree verify] Cashfree API error:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }

  // 2. Fetch payment and registration records from database using supabaseAdmin (service role key)
  const { data: paymentRecord, error: findError } = await supabaseAdmin
    .from('payments')
    .select(
      'id, registration_id, provider_order_id, provider_payment_id, amount, currency, status, registrations(id, registration_id, course_id, batch_id, learner_id, amount, currency, status)'
    )
    .eq('provider_order_id', cleanOrderId)
    .maybeSingle();

  if (findError) {
    console.error('[Cashfree verify] Database lookup error:', findError);
    return NextResponse.json(
      { success: false, error: `Database error querying payment: ${findError.message}` },
      { status: 500 }
    );
  }

  if (!paymentRecord) {
    return NextResponse.json(
      { success: false, error: `Payment record with order_id "${cleanOrderId}" does not exist in database.` },
      { status: 404 }
    );
  }

  const reg = Array.isArray(paymentRecord.registrations)
    ? paymentRecord.registrations[0]
    : paymentRecord.registrations;

  if (!reg) {
    return NextResponse.json(
      { success: false, error: `Associated registration record for order "${cleanOrderId}" does not exist in database.` },
      { status: 500 }
    );
  }

  // 3. Determine if payment succeeded
  const successfulPayment = paymentsData.find((p) => p.payment_status === 'SUCCESS');
  const isSuccessful = orderData.order_status === 'PAID' || Boolean(successfulPayment);

  if (isSuccessful) {
    const cfPaymentId = successfulPayment?.cf_payment_id
      ? String(successfulPayment.cf_payment_id)
      : String(orderData.cf_order_id || cleanOrderId);

    const paymentAmount = Number(successfulPayment?.payment_amount ?? orderData.order_amount);
    const paymentCurrency = successfulPayment?.payment_currency ?? orderData.order_currency ?? 'INR';
    const paidAt =
      successfulPayment?.payment_completion_time ||
      successfulPayment?.payment_time ||
      new Date().toISOString();

    // 4. Update payments table with Cashfree returned data
    const { error: payUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        provider_payment_id: cfPaymentId,
        amount: paymentAmount,
        currency: paymentCurrency,
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id);

    if (payUpdateError) {
      console.error('[Cashfree verify] Failed to update payments table:', payUpdateError);
      return NextResponse.json(
        { success: false, error: `Failed to update payments table: ${payUpdateError.message}` },
        { status: 500 }
      );
    }

    // 5. Update registrations table with status 'active' and verified amount
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
      console.error('[Cashfree verify] Failed to update registrations table:', regUpdateError);
      return NextResponse.json(
        { success: false, error: `Failed to update registrations table: ${regUpdateError.message}` },
        { status: 500 }
      );
    }

    // 6. Enroll learner into batch_learners table
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
        console.error('[Cashfree verify] Failed to upsert batch_learners:', blError);
        return NextResponse.json(
          { success: false, error: `Failed to update batch_learners table: ${blError.message}` },
          { status: 500 }
        );
      }
    }

    // 7. Increment coupon code count if applied
    const couponCode = orderData.order_tags?.coupon_code;
    if (couponCode) {
      const { data: couponData } = await supabaseAdmin
        .from('coupon_codes')
        .select('id, count')
        .eq('code', couponCode)
        .maybeSingle();

      if (couponData) {
        const currentCount = Number(couponData.count) || 0;
        await supabaseAdmin
          .from('coupon_codes')
          .update({
            count: currentCount + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', couponData.id);
      }
    }

    return NextResponse.json({
      success: true,
      status: 'PAID',
      order_id: cleanOrderId,
      registration_id: reg.registration_id,
      course_id: reg.course_id,
      batch_id: reg.batch_id,
      amount: paymentAmount,
      currency: paymentCurrency,
      cf_payment_id: cfPaymentId,
      paid_at: paidAt,
      payment: successfulPayment || null,
    });
  }

  // Payment is not successful (e.g. FAILED, EXPIRED, USER_DROPPED, CANCELLED)
  const failedPayment = paymentsData.find(
    (p) => p.payment_status === 'FAILED' || p.payment_status === 'USER_DROPPED'
  );

  const { error: payFailError } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'failed',
      provider_payment_id: failedPayment?.cf_payment_id ? String(failedPayment.cf_payment_id) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentRecord.id);

    // Cancel the associated registration after confirmed payment failure
const { error: regCancelError } = await supabaseAdmin
  .from('registrations')
  .update({
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  })
  .eq('id', reg.id);

if (regCancelError) {
  console.error(
    '[Cashfree verify] Failed to cancel registration:',
    regCancelError
  );

  return NextResponse.json(
    {
      success: false,
      error: `Failed to cancel registration: ${regCancelError.message}`,
    },
    { status: 500 }
  );
}

  if (payFailError) {
    console.error('[Cashfree verify] Failed to update payment to failed:', payFailError);
    return NextResponse.json(
      { success: false, error: `Failed to update payment status to failed: ${payFailError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: false,
    status: failedPayment?.payment_status || orderData.order_status,
    order_id: cleanOrderId,
    message: failedPayment?.payment_message || 'Payment has not been completed or was cancelled by user.',
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
