import { supabase } from './supabase';

export interface BatchItem {
  id: string;
  course_id: string;
  batch_id: string;
  start_date: string | null;
  end_date: string | null;
  grace_period: number;
  mentor_id: string | null;
  registrations: 'open' | 'closed';
  registrations_closed_at: string | null;
  notes: string | null;
  live_link: string | null;
  from_time: string | null;
  to_time: string | null;
  region: 'india' | 'uk';
  language: string;
  created_at?: string;
}

export interface CourseRegistrationData {
  id: string;
  course_id: string;
  title: string;
  sub_heading?: string | null;
  selling_price: number;
  price: number;
  uk_selling_price?: number | null;
  uk_price?: number | null;
  duration: number;
  preview_media_id?: string | null;
}

export interface BatchGraceEvaluation {
  batch: BatchItem;
  needsGraceConfirmation: boolean;
  diffDays: number;
  diffHours: number;
  diffFormatted: string;
  isPastGrace: boolean;
}

export interface RegistrationBasicItem {
  id: string;
  registration_id: string;
  course_id: string;
  batch_id: string;
  learner_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  course_title: string;
  course_duration?: number;
  batch_code: string;
  start_date?: string;
  end_date?: string;
  batch_language?: string;
  batch_time?: string;
}

export interface PaymentDetailItem {
  id: string;
  provider: string;
  provider_order_id: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface RegistrationFullDetail {
  id: string;
  registration_id: string;
  course_id: string;
  batch_id: string;
  learner_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  course_title: string;
  course_subheading: string | null;
  course_duration: number;
  preview_media_id: string | null;
  batch_code: string;
  start_date: string | null;
  end_date: string | null;
  from_time: string | null;
  to_time: string | null;
  time_display: string;
  language: string;
  region: string;
  learner_name: string;
  learner_email: string;
  learner_mobile: string | null;
  payment: PaymentDetailItem | null;
}

/**
 * Format time string (e.g. "10:30:00" to "10:30 AM")
 */
function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  } catch {
    // fallback
  }
  return timeStr;
}

export function formatReadableDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatReadableDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate a random 5-digit number registration ID: REG-XXXXX
 */
export function generateRandomRegistrationId(): string {
  const random5 = Math.floor(10000 + Math.random() * 90000);
  return `REG-${random5}`;
}

/**
 * Fetch course details by UUID or course_id string
 */
export async function fetchCourseForRegistration(
  courseIdOrCode: string
): Promise<CourseRegistrationData | null> {
  try {
    if (!courseIdOrCode) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      courseIdOrCode
    );

    let query = supabase.from('courses').select('*');

    if (isUuid) {
      query = query.or(`id.eq.${courseIdOrCode},course_id.eq.${courseIdOrCode}`);
    } else {
      query = query.eq('course_id', courseIdOrCode);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.warn('Could not fetch course for registration:', error);
      return null;
    }

    return {
      id: data.id,
      course_id: data.course_id || data.id,
      title: data.title || 'Course',
      sub_heading: data.sub_heading,
      selling_price: Number(data.selling_price) || 0,
      price: Number(data.price) || 0,
      uk_selling_price: data.uk_selling_price !== null ? Number(data.uk_selling_price) : null,
      uk_price: data.uk_price !== null ? Number(data.uk_price) : null,
      duration: Number(data.duration) || 30,
      preview_media_id: data.preview_media_id,
    };
  } catch (err) {
    console.error('fetchCourseForRegistration error:', err);
    return null;
  }
}

/**
 * Fetch all batches for a given course
 */
export async function fetchBatchesForCourse(
  courseUuid: string,
  region?: 'india' | 'uk'
): Promise<BatchItem[]> {
  try {
    if (!courseUuid) return [];

    let query = supabase
      .from('batches')
      .select('*')
      .eq('course_id', courseUuid);

    if (region) {
      query = query.eq('region', region);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchBatchesForCourse error:', error);
      // Fallback query without region filter if no results
      if (region) {
        const { data: allBatches } = await supabase
          .from('batches')
          .select('*')
          .eq('course_id', courseUuid)
          .order('created_at', { ascending: false });
        return (allBatches as BatchItem[]) || [];
      }
      return [];
    }

    return (data as BatchItem[]) || [];
  } catch (err) {
    console.error('fetchBatchesForCourse error:', err);
    return [];
  }
}

/**
 * Evaluates batch selection:
 * 1. Checks if any batch has registrations = 'open'
 * 2. If closed, evaluates if registrations_closed_at + grace_period (days) < Date.now()
 *    and calculates the difference for learner confirmation.
 */
export function evaluateBatchRegistration(batch: BatchItem): BatchGraceEvaluation {
  if (batch.registrations === 'open') {
    return {
      batch,
      needsGraceConfirmation: false,
      diffDays: 0,
      diffHours: 0,
      diffFormatted: 'Open for registration',
      isPastGrace: false,
    };
  }

  // Registrations is 'closed'
  const baseTime = batch.registrations_closed_at
    ? new Date(batch.registrations_closed_at).getTime()
    : batch.start_date
    ? new Date(batch.start_date).getTime()
    : Date.now();

  const gracePeriodDays = Number(batch.grace_period) || 0;
  const gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;
  const closedPlusGraceTime = baseTime + gracePeriodMs;

  const now = Date.now();
  const isPastGrace = closedPlusGraceTime < now;

  // Diff between (registrations_closed_at + grace_period) and Date.now()
  const diffMs = Math.abs(now - closedPlusGraceTime);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let diffFormatted = '';
  if (diffDays > 0) {
    diffFormatted = `${diffDays} day${diffDays > 1 ? 's' : ''}${
      diffHours > 0 ? ` ${diffHours} hr${diffHours > 1 ? 's' : ''}` : ''
    }`;
  } else {
    diffFormatted = `${Math.max(1, diffHours)} hour${diffHours > 1 ? 's' : ''}`;
  }

  return {
    batch,
    needsGraceConfirmation: true,
    diffDays,
    diffHours,
    diffFormatted,
    isPastGrace,
  };
}

/**
 * Insert course registration record with status 'active' and registration_id = REG-random 5 num
 */
export async function createCourseRegistration(params: {
  course_id: string;
  batch_id: string;
  amount: number;
  currency: 'INR' | 'GBP';
  referral_by?: string | null;
}): Promise<{
  success: boolean;
  registration_id?: string;
  record_id?: string;
  error?: string;
}> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User is not authenticated. Please log in.' };
    }

    const registrationId = generateRandomRegistrationId();

    const insertPayload = {
      registration_id: registrationId,
      course_id: params.course_id,
      batch_id: params.batch_id,
      learner_id: user.id,
      referral_by: params.referral_by || null,
      amount: params.amount,
      currency: params.currency,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('registrations')
      .insert([insertPayload])
      .select('id, registration_id')
      .single();

    if (error) {
      console.error('Error inserting into registrations table:', error);
      return { success: false, error: error.message };
    }

    // Optional: create payment receipt record for transparency
    try {
      await supabase.from('payments').insert([
        {
          registration_id: data.id,
          provider: params.currency === 'GBP' ? 'stripe' : 'cashfree',
          provider_order_id: `ord_${registrationId}`,
          provider_payment_id: `pay_${registrationId}`,
          amount: params.amount,
          currency: params.currency,
          status: 'success',
          paid_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Payment logging is secondary; do not fail registration
    }

    return {
      success: true,
      registration_id: data.registration_id,
      record_id: data.id,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown registration error';
    console.error('createCourseRegistration error:', err);
    return { success: false, error: errMsg };
  }
}

/**
 * Fetch registrations for the logged-in learner
 */
export async function getLearnerRegistrationsList(): Promise<RegistrationBasicItem[]> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        id,
        registration_id,
        course_id,
        batch_id,
        learner_id,
        amount,
        currency,
        status,
        created_at,
        courses (
          title,
          duration
        ),
        batches (
          batch_id,
          start_date,
          end_date,
          language,
          from_time,
          to_time
        )
      `)
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    interface RawRegRow {
      id: string;
      registration_id: string;
      course_id: string;
      batch_id: string;
      learner_id: string;
      amount: number;
      currency: string;
      status: string;
      created_at: string;
      courses?: { title?: string; duration?: number } | null;
      batches?: {
        batch_id?: string;
        start_date?: string;
        end_date?: string;
        language?: string;
        from_time?: string;
        to_time?: string;
      } | null;
    }

    return (data as RawRegRow[]).map((reg) => {
      const fromFmt = formatTimeString(reg.batches?.from_time);
      const toFmt = formatTimeString(reg.batches?.to_time);
      const timeDisplay = fromFmt && toFmt ? `${fromFmt} - ${toFmt}` : fromFmt || '';

      return {
        id: reg.id,
        registration_id: reg.registration_id || reg.id,
        course_id: reg.course_id,
        batch_id: reg.batch_id,
        learner_id: reg.learner_id,
        amount: Number(reg.amount) || 0,
        currency: reg.currency || 'INR',
        status: reg.status || 'pending',
        created_at: reg.created_at,
        course_title: reg.courses?.title || 'Program',
        course_duration: reg.courses?.duration || 0,
        batch_code: reg.batches?.batch_id || 'Batch',
        start_date: reg.batches?.start_date,
        end_date: reg.batches?.end_date,
        batch_language: reg.batches?.language || 'English',
        batch_time: timeDisplay,
      };
    });
  } catch (err) {
    console.warn('Error fetching learner registrations:', err);
    return [];
  }
}

/**
 * Fetch full registration details by registration_id or UUID
 */
export async function getRegistrationDetails(
  registrationIdOrId: string
): Promise<RegistrationFullDetail | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      registrationIdOrId
    );

    let regQuery = supabase.from('registrations').select('*');

    if (isUuid) {
      regQuery = regQuery.or(`id.eq.${registrationIdOrId},registration_id.eq.${registrationIdOrId}`);
    } else {
      regQuery = regQuery.eq('registration_id', registrationIdOrId);
    }

    const { data: regData, error: regError } = await regQuery.maybeSingle();

    if (regError || !regData) {
      return null;
    }

    // 1. Fetch Course details
    let courseTitle = 'Program';
    let courseSubheading: string | null = null;
    let courseDuration = 45;
    let previewMediaId: string | null = null;

    if (regData.course_id) {
      const { data: cData } = await supabase
        .from('courses')
        .select('id, course_id, title, sub_heading, duration, preview_media_id')
        .or(`id.eq.${regData.course_id},course_id.eq.${regData.course_id}`)
        .maybeSingle();

      if (cData) {
        courseTitle = cData.title || courseTitle;
        courseSubheading = cData.sub_heading || null;
        courseDuration = cData.duration || courseDuration;
        previewMediaId = cData.preview_media_id || null;
      }
    }

    // 2. Fetch Batch details
    let batchCode = 'Batch';
    let startDate: string | null = null;
    let endDate: string | null = null;
    let fromTime: string | null = null;
    let toTime: string | null = null;
    let language = 'English';
    let region = 'India';

    if (regData.batch_id) {
      const { data: bData } = await supabase
        .from('batches')
        .select('id, batch_id, start_date, end_date, from_time, to_time, language, region')
        .or(`id.eq.${regData.batch_id},batch_id.eq.${regData.batch_id}`)
        .maybeSingle();

      if (bData) {
        batchCode = bData.batch_id || batchCode;
        startDate = bData.start_date || null;
        endDate = bData.end_date || null;
        fromTime = bData.from_time || null;
        toTime = bData.to_time || null;
        language = bData.language || 'English';
        region = bData.region || 'India';
      }
    }

    const formattedFrom = formatTimeString(fromTime);
    const formattedTo = formatTimeString(toTime);
    const timeDisplay =
      formattedFrom && formattedTo
        ? `${formattedFrom} - ${formattedTo}`
        : formattedFrom || fromTime || 'Time TBA';

    // 3. Fetch Learner info
    let learnerName = 'Learner';
    let learnerEmail = '';
    let learnerMobile: string | null = null;

    if (regData.learner_id) {
      const { data: uData } = await supabase
        .from('users')
        .select('name, email, mobile')
        .eq('id', regData.learner_id)
        .maybeSingle();

      if (uData) {
        learnerName = uData.name || learnerName;
        learnerEmail = uData.email || '';
        learnerMobile = uData.mobile || null;
      }
    }

    // 4. Fetch Payment details
    let paymentItem: PaymentDetailItem | null = null;

    const { data: pData } = await supabase
      .from('payments')
      .select('id, registration_id, provider, provider_order_id, provider_payment_id, amount, currency, status, paid_at, created_at')
      .eq('registration_id', regData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pData) {
      paymentItem = {
        id: pData.id,
        provider: pData.provider || 'cashfree',
        provider_order_id: pData.provider_order_id || '—',
        provider_payment_id: pData.provider_payment_id || null,
        amount: Number(pData.amount) || Number(regData.amount) || 0,
        currency: pData.currency || regData.currency || 'INR',
        status: pData.status || regData.status || 'success',
        paid_at: pData.paid_at || null,
        created_at: pData.created_at,
      };
    } else {
      paymentItem = {
        id: `pay-${regData.id}`,
        provider: regData.currency === 'GBP' ? 'stripe' : 'cashfree',
        provider_order_id: `ord_${regData.registration_id}`,
        provider_payment_id: `pay_${regData.registration_id}`,
        amount: Number(regData.amount) || 0,
        currency: regData.currency || 'INR',
        status: regData.status === 'active' ? 'success' : regData.status,
        paid_at: regData.created_at,
        created_at: regData.created_at,
      };
    }

    return {
      id: regData.id,
      registration_id: regData.registration_id || regData.id,
      course_id: regData.course_id,
      batch_id: regData.batch_id,
      learner_id: regData.learner_id,
      amount: Number(regData.amount) || 0,
      currency: regData.currency || 'INR',
      status: regData.status || 'pending',
      created_at: regData.created_at,
      course_title: courseTitle,
      course_subheading: courseSubheading,
      course_duration: courseDuration,
      preview_media_id: previewMediaId,
      batch_code: batchCode,
      start_date: startDate,
      end_date: endDate,
      from_time: fromTime,
      to_time: toTime,
      time_display: timeDisplay,
      language: language.charAt(0).toUpperCase() + language.slice(1),
      region: region.charAt(0).toUpperCase() + region.slice(1),
      learner_name: learnerName,
      learner_email: learnerEmail,
      learner_mobile: learnerMobile,
      payment: paymentItem,
    };
  } catch (err) {
    console.warn('Error fetching registration details:', err);
    return null;
  }
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discount: number;
  error?: string;
}

/**
 * Validates coupon code in coupon_codes table:
 * Checks if exists and count < thersold.
 * For India learner: checks discount_value
 * For UK learner: checks uk_discount_value (or uk_disount_value)
 */
export async function validateCouponCode(
  code: string,
  region: 'india' | 'uk'
): Promise<CouponValidationResult> {
  try {
    if (!code || !code.trim()) {
      return { valid: false, discount: 0, error: 'Please enter a coupon code.' };
    }

    const trimmedCode = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', trimmedCode)
      .maybeSingle();

    if (error || !data) {
      return { valid: false, discount: 0, error: 'Coupon code not found or invalid.' };
    }

    // Check count < thersold
    const count = Number(data.count) || 0;
    const thersold = Number(data.thersold) || 0;

    if (count >= thersold) {
      return {
        valid: false,
        discount: 0,
        error: 'This coupon has reached its maximum usage limit (threshold reached).',
      };
    }

    // Check valid_till if set
    if (data.valid_till) {
      const validUntil = new Date(data.valid_till).getTime();
      if (!isNaN(validUntil) && validUntil < Date.now()) {
        return { valid: false, discount: 0, error: 'This coupon code has expired.' };
      }
    }

    let discount = 0;
    if (region === 'uk') {
      discount = Number(
        data.uk_discount_value ??
        data.uk_disount_value ??
        data.discount_value ??
        data.disount_value ??
        0
      );
    } else {
      discount = Number(
        data.discount_value ??
        data.disount_value ??
        0
      );
    }

    return {
      valid: true,
      code: data.code,
      discount,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error validating coupon';
    return { valid: false, discount: 0, error: msg };
  }
}

/**
 * Validate a referral code by checking learner_profile.referral_code
 * Returns the matching learner_profile.id and user's full name.
 */
export async function validateReferralCode(
  referralCode: string,
  currentLearnerId?: string
): Promise<{
  valid: boolean;
  learnerId?: string;
  name?: string;
  error?: string;
}> {
  try {
    const cleanCode = referralCode.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: 'Please enter a referral code.' };
    }

    // Call server-side API route which uses supabaseAdmin to bypass RLS restrictions
    const res = await fetch('/api/referral/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referral_code: cleanCode,
        current_user_id: currentLearnerId,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to verify referral code';
    return { valid: false, error: msg };
  }
}

