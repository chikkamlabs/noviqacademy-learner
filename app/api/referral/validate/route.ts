import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referral_code, current_user_id } = body;

    const cleanCode = (referral_code || '').toString().trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a referral code.' },
        { status: 400 }
      );
    }

    // 1. Query learner_profile using supabaseAdmin (bypasses RLS)
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('learner_profile')
      .select('id, referral_code')
      .ilike('referral_code', cleanCode)
      .maybeSingle();

    if (profileErr) {
      console.error('[API referral/validate] Error querying learner_profile:', profileErr);
      return NextResponse.json({
        valid: false,
        error: 'Invalid referral code. Please check and try again.',
      });
    }

    if (!profile) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid referral code. Please check and try again.',
      });
    }

    // Prevent using own referral code
    if (current_user_id && profile.id === current_user_id) {
      return NextResponse.json({
        valid: false,
        error: 'You cannot use your own referral code.',
      });
    }

    // 2. Fetch the referrer's name from users table
    const { data: userData, error: userErr } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', profile.id)
      .maybeSingle();

    if (userErr) {
      console.warn('[API referral/validate] Error fetching user name:', userErr);
    }

    const referralName = userData?.name || 'Learner';

    return NextResponse.json({
      valid: true,
      learnerId: profile.id,
      name: referralName,
    });
  } catch (err: unknown) {
    console.error('[API referral/validate] Unexpected error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to verify referral code.';
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}
