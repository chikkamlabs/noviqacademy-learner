'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const user = await getCurrentUser();
      if (!isMounted) return;

      if (!user) {
        router.replace('/login');
      } else {
        setAuthorized(true);
      }
      setChecking(false);
    }

    checkAuth();

    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        setAuthorized(true);
        setChecking(false);
      } else {
        setAuthorized(false);
        router.replace('/login');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white text-dark-black">
        <p className="text-sm font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
