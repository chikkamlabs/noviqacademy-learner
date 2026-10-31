
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishAuth = async () => {
      try {
        // Get confirmation code from Supabase URL
        const code = new URLSearchParams(
          window.location.search
        ).get('code');

        // Exchange confirmation code for an authenticated session
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Confirmation error:', error.message);
            router.replace('/login?error=confirmation');
            return;
          }
        }

        // Verify authenticated session
        const { data, error } =
          await supabase.auth.getSession();

        if (error || !data.session) {
          console.error('Session error:', error?.message);
          router.replace('/login?error=confirmation');
          return;
        }

        // Redirect to learner dashboard
        router.replace('/learner/dashboard');

      } catch (error) {
        console.error('Auth callback failed:', error);
        router.replace('/login?error=confirmation');
      }
    };

    finishAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Confirming your email, please wait...</p>
    </div>
  );
}
