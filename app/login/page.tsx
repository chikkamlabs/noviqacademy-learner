'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInLearner, sendPasswordResetEmail } from '@/lib/auth';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation: if misses anything raise error
    const trimmedEmail = email.trim();
    if (!trimmedEmail && !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    const result = await signInLearner({ email: trimmedEmail, password });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    // Redirect to /learner/dashboard
    router.push('/learner/dashboard');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError('Please enter your registered email.');
      return;
    }

    setForgotLoading(true);
    const res = await sendPasswordResetEmail(trimmed);
    setForgotLoading(false);

    if (!res.success) {
      setForgotError(res.error || 'Failed to send reset email. Please try again.');
      return;
    }

    setForgotSuccess('Password reset link sent! Please check your email inbox.');
  };

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-between">
      {/* Header at Top */}
      <Header />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black">
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
              <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-black"
                >
                  Email <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-dark-black"
                >
                  Password <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs sm:text-sm font-medium text-primary-orange hover:text-dark-black hover:underline cursor-pointer"
                >
                  forgot password! click here.
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Forgot Password Overscreen Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-black/50 p-4">
          <div className="bg-pure-white rounded-lg shadow-xl border border-dark-black/10 max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-dark-black/60 hover:text-dark-black text-xl leading-none cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-dark-black mb-1">
              Forgot Password
            </h3>
            <p className="text-xs sm:text-sm text-dark-black/70 mb-4">
              Enter your registered email to receive a password reset link.
            </p>

            <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-dark-black"
                >
                  Registered Email <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError(null);
                  }}
                  placeholder="Enter your registered email"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black text-sm"
                />
              </div>

              {forgotError && (
                <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 font-medium">
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="p-2.5 rounded-md bg-green-50 border border-green-200 text-xs sm:text-sm text-green-700 font-medium">
                  {forgotSuccess}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 px-3 border border-dark-black/20 rounded-md text-sm font-medium text-dark-black hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 px-3 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white rounded-md text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer at Bottom */}
      <Footer />
    </div>
  );
}
