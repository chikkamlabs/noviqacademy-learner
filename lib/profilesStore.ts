import { supabase } from './supabase';

export interface LearnerProfileData {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  region: 'india' | 'uk';
  referral_code?: string | null;
  created_at?: string;
}

export interface LearnerRegistrationItem {
  id: string;
  registration_id: string;
  course_id: string;
  batch_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  course_title?: string;
  course_duration?: number;
  course_image?: string;
  batch_code?: string;
  batch_region?: string;
  batch_language?: string;
  start_date?: string;
}

/**
 * Fetch current logged-in learner's profile
 */
export async function getLearnerProfile(): Promise<LearnerProfileData | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Try fetching from public.users & public.learner_profile
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, mobile, role')
      .eq('id', user.id)
      .single();

    const { data: profileData } = await supabase
      .from('learner_profile')
      .select('region, referral_code')
      .eq('id', user.id)
      .maybeSingle();

    const region = (profileData?.region ||
      user.user_metadata?.region ||
      'india') as 'india' | 'uk';

    return {
      id: user.id,
      name: userData?.name || user.user_metadata?.name || user.user_metadata?.full_name || 'Learner',
      email: userData?.email || user.email || '',
      mobile: userData?.mobile || user.user_metadata?.mobile || '',
      role: userData?.role || 'learner',
      region: region === 'uk' ? 'uk' : 'india',
      referral_code: profileData?.referral_code || null,
    };
  } catch (err) {
    console.warn('Error fetching learner profile:', err);
    return null;
  }
}

/**
 * Fetch learner region only
 */
export async function getLearnerRegion(): Promise<'india' | 'uk'> {
  try {
    const profile = await getLearnerProfile();
    return profile?.region || 'india';
  } catch {
    return 'india';
  }
}

/**
 * Update learner profile data (name, mobile, region, email, password)
 */
export async function updateLearnerProfile(params: {
  name?: string;
  mobile?: string;
  region?: 'india' | 'uk';
  email?: string;
  password?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User is not authenticated' };
    }

    // 1. Update public.users
    const userUpdates: Record<string, string> = {};
    if (params.name !== undefined) userUpdates.name = params.name;
    if (params.mobile !== undefined) userUpdates.mobile = params.mobile;
    if (params.email !== undefined) userUpdates.email = params.email;

    if (Object.keys(userUpdates).length > 0) {
      const { error: updateUsersErr } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', user.id);

      if (updateUsersErr) {
        console.warn('Note: Could not update users table directly:', updateUsersErr.message);
      }
    }

    // 2. Update public.learner_profile
    if (params.region !== undefined) {
      const { error: profileErr } = await supabase
        .from('learner_profile')
        .upsert({
          id: user.id,
          region: params.region,
        });

      if (profileErr) {
        console.warn('Note: Could not update learner_profile table:', profileErr.message);
      }
    }

    // 3. Update Supabase Auth metadata / credentials
    const authUpdates: {
      email?: string;
      password?: string;
      data?: Record<string, unknown>;
    } = {};

    if (params.email && params.email !== user.email) {
      authUpdates.email = params.email;
    }
    if (params.password && params.password.trim().length > 0) {
      authUpdates.password = params.password;
    }

    authUpdates.data = {
      ...(user.user_metadata || {}),
      ...(params.name ? { name: params.name, full_name: params.name } : {}),
      ...(params.mobile ? { mobile: params.mobile } : {}),
      ...(params.region ? { region: params.region } : {}),
    };

    const { error: authErr } = await supabase.auth.updateUser(authUpdates);
    if (authErr) {
      return { success: false, error: authErr.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile';
    return { success: false, error: msg };
  }
}

/**
 * Fetch registrations for the logged-in learner
 */
export async function getLearnerRegistrations(): Promise<LearnerRegistrationItem[]> {
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
        amount,
        currency,
        status,
        created_at,
        courses (
          title,
          duration,
          preview_media_id
        ),
        batches (
          batch_id,
          start_date,
          end_date,
          language,
          region
        )
      `)
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    interface RawRegistrationRow {
      id: string;
      registration_id: string;
      course_id: string;
      batch_id: string;
      amount: number;
      currency: string;
      status: string;
      created_at: string;
      courses?: { title?: string; duration?: number; preview_media_id?: string } | null;
      batches?: {
        batch_id?: string;
        start_date?: string;
        end_date?: string;
        language?: string;
        region?: string;
      } | null;
    }

    return (data as RawRegistrationRow[]).map((reg) => ({
      id: reg.id,
      registration_id: reg.registration_id,
      course_id: reg.course_id,
      batch_id: reg.batch_id,
      amount: Number(reg.amount) || 0,
      currency: reg.currency || 'INR',
      status: reg.status || 'pending',
      created_at: reg.created_at,
      course_title: reg.courses?.title || 'Course',
      course_duration: reg.courses?.duration || 0,
      course_image: reg.courses?.preview_media_id || '',
      batch_code: reg.batches?.batch_id || '',
      batch_region: reg.batches?.region || 'india',
      batch_language: reg.batches?.language || 'english',
      start_date: reg.batches?.start_date,
    }));
  } catch (err) {
    console.warn('Error fetching learner registrations:', err);
    return [];
  }
}

/**
 * Logout current learner
 */
export async function logoutLearner() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
}
