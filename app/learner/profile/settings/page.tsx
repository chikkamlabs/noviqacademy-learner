'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import { getLearnerProfile, updateLearnerProfile } from '@/lib/profilesStore';

export default function LearnerProfileSettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    region: 'india' as 'india' | 'uk',
    password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const profile = await getLearnerProfile();
      if (profile) {
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          mobile: profile.mobile || '',
          region: profile.region || 'india',
          password: '',
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const result = await updateLearnerProfile({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      region: formData.region,
      password: formData.password || undefined,
    });

    setSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile settings updated successfully!' });
      setFormData((prev) => ({ ...prev, password: '' }));
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      <LearnerHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <div className="mb-6">
          <Link
            href="/learner/profile/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-dark-black hover:text-primary-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight mt-2">
            Profile Settings
          </h2>
          <p className="text-sm text-dark-black/70 mt-1">
            View and update your personal details, regional preferences, and credentials.
          </p>
        </div>

        <div className="bg-pure-white rounded-2xl p-6 sm:p-8 shadow-xs border border-soft-cream">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-dark-black/60">
              Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-dark-black"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-dark-black/20 rounded-lg shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-dark-black"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-dark-black/20 rounded-lg shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-semibold text-dark-black"
                >
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-dark-black/20 rounded-lg shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
              </div>

              {/* Region */}
              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-semibold text-dark-black"
                >
                  Region Preference
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-dark-black/20 rounded-lg shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black bg-pure-white"
                >
                  <option value="india">India (Prices in INR ₹)</option>
                  <option value="uk">United Kingdom - UK (Prices in GBP £)</option>
                </select>
                <p className="text-xs text-dark-black/60 mt-1">
                  Courses and prices will automatically adjust to this region.
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-dark-black"
                >
                  New Password (Optional)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-dark-black/20 rounded-lg shadow-xs focus:outline-hidden focus:border-primary-orange focus:ring-1 focus:ring-primary-orange text-dark-black"
                />
                <p className="text-xs text-dark-black/60 mt-1">
                  Enter 6+ characters if you want to reset your password.
                </p>
              </div>

              <div className="pt-4 border-t border-soft-cream flex items-center justify-end gap-3">
                <Link
                  href="/learner/profile/dashboard"
                  className="px-4 py-2.5 text-sm font-semibold border border-dark-black/20 text-dark-black rounded-lg hover:bg-soft-cream transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <LearnerBottomNavigation />
    </div>
  );
}
