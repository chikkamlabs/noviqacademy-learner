import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder, getCashfreeConfig } from '@/lib/cashfree';
import { supabase } from '@/lib/supabase';

function generateRegistrationId(): string {
  const random5 = Math.floor(10000 + Math.random() * 90000);
  return `REG-${random5}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      course_id,
      batch_id,
      amount,
      currency = 'INR',
      customer_details,
      coupon_code,
    } = body;

    if (!course_id || !batch_id || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: course_id, batch_id, or amount' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${proto}://${host}`;

    // Unique order ID acceptable by Cashfree (alphanumeric and _ - only, max 45 chars)
    const timestampStr = Date.now().toString(36);
    const randStr = Math.random().toString(36).substring(2, 7);
    const orderId = `cf_${timestampStr}_${randStr}`;

    const registrationId = generateRegistrationId();
    const learnerId = customer_details?.customer_id || 'guest_learner';

    // Best-effort: Create pending registration in database
    let createdRecordId: string | null = null;
    try {
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .insert([
          {
            registration_id: registrationId,
            course_id: course_id,
            batch_id: batch_id,
            learner_id: learnerId,
            amount: amount,
            currency: currency,
            status: 'pending',
          },
        ])
        .select('id')
        .single();

      if (!regError && regData) {
        createdRecordId = regData.id;
        // Insert pending payment record
        await supabase.from('payments').insert([
          {
            registration_id: regData.id,
            provider: 'cashfree',
            provider_order_id: orderId,
            amount: amount,
            currency: currency,
            status: 'pending',
          },
        ]);
      }
    } catch (dbErr) {
      console.warn('[Cashfree create_order] Database record insert skipped or failed:', dbErr);
    }

    const returnUrl = `${origin}/cashfree/success?order_id={order_id}`;
    const notifyUrl = `${origin}/api/payments/cashfree/webhook`;

    const config = getCashfreeConfig();

    const orderResponse = await createCashfreeOrder({
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: learnerId,
        customer_name: customer_details?.customer_name || 'Learner',
        customer_email: customer_details?.customer_email || 'learner@noviqacademy.com',
        customer_phone: customer_details?.customer_phone || '9999999999',
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
        payment_methods: 'cc,dc,upi,nb',
      },
      order_note: `Registration ${registrationId} - Batch: ${batch_id}`,
      order_tags: {
        registration_id: registrationId,
        course_id: String(course_id),
        batch_id: String(batch_id),
        ...(coupon_code ? { coupon_code: String(coupon_code) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      order_id: orderId,
      cf_order_id: orderResponse.cf_order_id,
      payment_session_id: orderResponse.payment_session_id,
      registration_id: registrationId,
      record_id: createdRecordId,
      amount,
      currency,
      mode: config.env,
      is_mock: !config.hasCredentials,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create Cashfree order';
    console.error('[Cashfree create_order route error]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
