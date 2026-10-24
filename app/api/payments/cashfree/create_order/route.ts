import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder, getCashfreeConfig } from '@/lib/cashfree';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Strict validation - no dummy fallback
    if (!course_id) {
      return NextResponse.json(
        { success: false, error: 'Validation error: course_id is required' },
        { status: 400 }
      );
    }

    if (!batch_id) {
      return NextResponse.json(
        { success: false, error: 'Validation error: batch_id is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Validation error: valid numeric amount is required' },
        { status: 400 }
      );
    }

    if (!customer_details) {
      return NextResponse.json(
        { success: false, error: 'Validation error: customer_details is required' },
        { status: 400 }
      );
    }

    const { customer_id, customer_email, customer_phone, customer_name } = customer_details;

    if (!customer_id || typeof customer_id !== 'string' || !customer_id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Validation error: customer_id (learner ID) is required' },
        { status: 400 }
      );
    }

    if (!customer_email || typeof customer_email !== 'string' || !customer_email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Validation error: customer_email is required' },
        { status: 400 }
      );
    }

    const cleanedPhone = (customer_phone || '').toString().replace(/[^0-9]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Validation error: A valid 10-digit mobile number is required' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${proto}://${host}`;

    // Unique Cashfree order ID (alphanumeric and _ - characters only, max 45 chars)
    const timestampStr = Date.now().toString(36);
    const randStr = Math.random().toString(36).substring(2, 7);
    const orderId = `cf_${timestampStr}_${randStr}`;

    const registrationId = generateRegistrationId();

    // 1. Insert into registrations table using supabaseAdmin (service role key)
    const { data: regData, error: regError } = await supabaseAdmin
      .from('registrations')
      .insert([
        {
          registration_id: registrationId,
          course_id: course_id,
          batch_id: batch_id,
          learner_id: customer_id.trim(),
          amount: amount,
          currency: currency,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('id, registration_id')
      .single();

    if (regError || !regData) {
      console.error('[Cashfree create_order] Registration insertion error:', regError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to insert registration record in database: ${regError?.message || 'Unknown database error'}`,
        },
        { status: 500 }
      );
    }

    // 2. Insert into payments table using supabaseAdmin (service role key)
    const { data: payData, error: payError } = await supabaseAdmin
      .from('payments')
      .insert([
        {
          registration_id: regData.id,
          provider: 'cashfree',
          provider_order_id: orderId,
          amount: amount,
          currency: currency,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (payError || !payData) {
      console.error('[Cashfree create_order] Payment insertion error:', payError);
      // Rollback created registration record
      await supabaseAdmin.from('registrations').delete().eq('id', regData.id);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to insert payment record in database: ${payError?.message || 'Unknown database error'}`,
        },
        { status: 500 }
      );
    }

    const returnUrl = `${origin}/cashfree/success?order_id={order_id}`;
    const notifyUrl = `${origin}/api/payments/cashfree/webhook`;

    // 3. Create Cashfree Order via Cashfree PG API
    let orderResponse;
    try {
      orderResponse = await createCashfreeOrder({
        order_id: orderId,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: customer_id.trim(),
          customer_name: customer_name ? customer_name.trim() : 'Learner',
          customer_email: customer_email.trim(),
          customer_phone: cleanedPhone.slice(-10),
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
    } catch (cfErr: unknown) {
      console.error('[Cashfree create_order] Cashfree API error:', cfErr);
      // Rollback database records on Cashfree failure
      await supabaseAdmin.from('payments').delete().eq('id', payData.id);
      await supabaseAdmin.from('registrations').delete().eq('id', regData.id);

      const errorMsg = cfErr instanceof Error ? cfErr.message : 'Cashfree order creation failed';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
    console.log('[Cashfree order created]', {
  order_id: orderResponse.order_id,
  order_status: orderResponse.order_status,
  has_payment_session: Boolean(orderResponse.payment_session_id),
});

    const config = getCashfreeConfig();

    return NextResponse.json({
      success: true,
      order_id: orderId,
      cf_order_id: orderResponse.cf_order_id,
      payment_session_id: orderResponse.payment_session_id,
      registration_id: registrationId,
      record_id: regData.id,
      amount,
      currency,
      mode: config.env,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process order creation';
    console.error('[Cashfree create_order route unexpected error]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
