'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInLearner } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signInLearner({ email, password });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    // Redirect to /learner/dashboard
    router.push('/learner/dashboard');
  };

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-3 px-4 sm:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-dark-black/70 hover:text-primary-orange transition-colors"
        >
          &larr; landing page
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-soft-cream shadow-xs">
            <Image
              src="/noviqacademy_logo.png"
              alt="Noviq Academy Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-dark-black">
            Noviq Academy
          </span>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-dark-black">
          Log in to your account
        </h2>
        <p className="mt-2 text-sm text-dark-black/70">
          Didn&apos;t have account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-primary-orange hover:text-dark-black transition-colors underline"
          >
            Signup
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-pure-white py-8 px-6 shadow-sm rounded-lg sm:px-10 border border-dark-black/10">
          {error && (
            <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark-black"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dark-black"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
