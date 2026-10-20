'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signUpLearner } from '@/lib/auth';
import Header from '@/components/landingpage/header';
import Footer from '@/components/landingpage/footer';

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    region: 'india',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Generate a random unique referral code: 3 alphabets + 4 numbers (e.g. NOV7492)
  const generateReferralCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const randomReferralCode = generateReferralCode();

    const result = await signUpLearner({
      name: formData.name,
      mobile: formData.mobile,
      region: formData.region,
      email: formData.email,
      password: formData.password,
      referral_code: randomReferralCode,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to create account. Please try again.');
      return;
    }

    // On successful insertion, redirect to /confirmemail
    router.push('/confirmemail');
  };

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-between">
      {/* Header at Top */}
      <Header />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-dark-black/70">
            Already a user?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary-orange hover:text-dark-black transition-colors underline"
            >
              Login
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
                  htmlFor="name"
                  className="block text-sm font-medium text-dark-black"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-dark-black"
                >
                  Mobile
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-dark-black"
                >
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black bg-pure-white"
                >
                  <option value="india">India</option>
                  <option value="uk">United Kingdom (UK)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-black"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="mt-1 block w-full px-3 py-2 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer at Bottom */}
      <Footer />
    </div>
  );
}
