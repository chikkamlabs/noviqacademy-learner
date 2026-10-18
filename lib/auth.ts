import { supabase } from './supabase';

export interface SignUpLearnerParams {
  name: string;
  mobile: string;
  region: string;
  email: string;
  password: string;
}

export interface SignInLearnerParams {
  email: string;
  password: string;
}

/**
 * Sign up a new user with default role 'learner'
 */
export async function signUpLearner({
  name,
  mobile,
  region,
  email,
  password,
}: SignUpLearnerParams) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
          mobile,
          region,
          role: 'learner',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, error: null, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred during signup';
    return { success: false, error: message, data: null };
  }
}

/**
 * Sign in existing learner with email and password
 */
export async function signInLearner({ email, password }: SignInLearnerParams) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, error: null, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred during login';
    return { success: false, error: message, data: null };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Sign out learner
 */
export async function signOutLearner() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
