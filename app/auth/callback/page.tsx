'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace('/login?error=confirmation');
        return;
      }

      router.replace('/learner/dashboard');
    };

    finishAuth();
  }, [router]);

  return <p>Confirming your email, please wait...</p>;
}