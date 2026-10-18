import { supabase } from './supabase';

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
  // Course details
  course_title: string;
  course_subheading: string | null;
  course_duration: number;
  preview_media_id: string | null;
  // Batch details
  batch_code: string;
  start_date: string | null;
  end_date: string | null;
  from_time: string | null;
  to_time: string | null;
  time_display: string;
  language: string;
  region: string;
  // Learner details
  learner_name: string;
  learner_email: string;
  learner_mobile: string | null;
  // Payment details
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
 * Fetch registrations for the logged-in learner (registrations.learner_id is this learner id)
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
 * Fetch full registration details and payment details by registration_id or UUID id
 * (View only)
 */
export async function getRegistrationDetails(
  registrationIdOrId: string
): Promise<RegistrationFullDetail | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      registrationIdOrId
    );

    let regQuery = supabase
      .from('registrations')
      .select('*');

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

    // 4. Fetch Payment details for this registration
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
      // Default payment summary if payment row was created alongside registration
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
