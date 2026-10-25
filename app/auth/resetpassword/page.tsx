'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { updateLearnerPassword, onAuthStateChange } from '@/lib/auth';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state change specifically for PASSWORD_RECOVERY
    const { data: authListener } = onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setError(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!newPassword && !confirmPassword) {
      setError('Please fill in both New password and Confirm password.');
      return;
    }
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (!confirmPassword) {
      setError('Confirm password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and Confirm password do not match.');
      return;
    }

    setLoading(true);
    const result = await updateLearnerPassword(newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to update password. Please try again.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-between">
      {/* Header at Top */}
      <Header />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-dark-black/70">
            Please enter your new password below.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-pure-white py-8 px-6 shadow-sm rounded-lg sm:px-10 border border-dark-black/10">
            {success ? (
              <div className="text-center space-y-5">
                <div className="p-4 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
                  Your password has been updated successfully!
                </div>
                <div>
                  <Link
                    href="/login"
                    className="inline-block w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors text-center"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdate} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-dark-black"
                    >
                      New password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter new password"
                      className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-dark-black"
                    >
                      Confirm password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Confirm new password"
                      className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="text-xs sm:text-sm font-medium text-dark-black/70 hover:text-primary-orange transition-colors"
                    >
                      Return to Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer at Bottom */}
      <Footer />
    </div>
  );
}
