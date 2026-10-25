'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setError(null);
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

    // Frontend validation: if misses anything raise error
    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required.');
      return;
    }
    const cleanedMobile = formData.mobile.replace(/[^0-9]/g, '');
    if (cleanedMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!formData.password) {
      setError('Password is required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const randomReferralCode = generateReferralCode();

    const result = await signUpLearner({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      region: formData.region,
      email: formData.email.trim(),
      password: formData.password,
      referral_code: randomReferralCode,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to create account. Please try again.');
      return;
    }

    

    // On successful insertion, 
    setSuccess('Congratulations! Your account has been created successfully. Redirecting to login in 5 seconds...');

    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col justify-between">
      {/* Header at Top */}
      <Header />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black">
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
              <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
            {success && (
  <div
    role="status"
    className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 text-sm text-green-700"
  >
    <p className="font-bold text-base">Congratulations! 🎉</p>
    <p className="mt-1">
      Your account has been created successfully.
    </p>
    <p className="mt-2">
      Redirecting you to the login page in 3 seconds...
    </p>
  </div>
)}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-dark-black"
                >
                  Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
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
                  Mobile <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
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
                  Region <span className="text-red-500 font-bold">*</span>
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
                  Email <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
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
                  Password <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="block w-full px-3 py-2 pr-10 border border-dark-black/20 rounded-md shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-black/50 hover:text-dark-black transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
  type="submit"
  disabled={loading || !!success}
  className="w-full py-2.5 px-4 font-semibold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
>
  {loading ? 'Creating...' : success ? 'Account Created!' : 'Create'}
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
