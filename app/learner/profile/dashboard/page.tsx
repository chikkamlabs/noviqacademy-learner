'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  ClipboardList,
  LogOut,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import {
  getLearnerProfile,
  logoutLearner,
  LearnerProfileData,
} from '@/lib/profilesStore';
import {
  getLearnerRegistrationsList,
  RegistrationBasicItem,
} from '@/lib/registrationsStore';

export default function LearnerProfileDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerProfileData | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationBasicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [profileData, regData] = await Promise.all([
        getLearnerProfile(),
        getLearnerRegistrationsList(),
      ]);
      setProfile(profileData);
      setRegistrations(regData);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutLearner();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      <LearnerHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {/* Profile Card Header */}
        <div className="bg-pure-white rounded-2xl p-6 sm:p-8 shadow-xs border border-soft-cream mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-orange/10 border-2 border-primary-orange flex items-center justify-center text-primary-orange">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-dark-black">
                  {loading ? 'Loading...' : profile?.name || 'Learner'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs sm:text-sm text-dark-black/70">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary-orange" />
                    {profile?.email || '—'}
                  </span>
                  {profile?.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary-orange" />
                      {profile.mobile}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-soft-cream border border-soft-orange/50 text-dark-black uppercase">
                <Globe className="w-3.5 h-3.5 text-primary-orange" />
                Region: {profile?.region === 'uk' ? 'UK' : 'India'}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation / Sections */}
        <div className="space-y-6">
          {/* 1. Profile Settings Link */}
          <Link
            href="/learner/profile/settings"
            className="flex items-center justify-between bg-pure-white p-5 rounded-xl border border-soft-cream hover:border-primary-orange shadow-xs transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-soft-cream flex items-center justify-center text-dark-black group-hover:text-primary-orange transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-dark-black group-hover:text-primary-orange transition-colors">
                  Profile Settings
                </h3>
                <p className="text-xs text-dark-black/70">
                  View and change your name, mobile, region, email, and password
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-dark-black/40 group-hover:text-primary-orange transition-colors" />
          </Link>

          {/* 2. Registrations Section */}
          <div className="bg-pure-white p-6 rounded-xl border border-soft-cream shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-soft-cream flex items-center justify-center text-dark-black">
                <ClipboardList className="w-5 h-5 text-primary-orange" />
              </div>
              <div>
                <h3 className="font-bold text-dark-black text-lg">Registrations</h3>
                <p className="text-xs text-dark-black/70">
                  Your registered courses, batches, and enrollment statuses
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-dark-black/60 py-4 text-center">Loading registrations...</p>
            ) : registrations.length === 0 ? (
              <div className="p-6 rounded-lg bg-soft-cream/40 border border-soft-cream text-center">
                <p className="text-sm text-dark-black/70 font-medium">
                  No active course registrations found.
                </p>
                <Link
                  href="/learner/explorecourses"
                  className="inline-block mt-3 px-4 py-2 text-xs font-bold text-pure-white bg-primary-orange hover:bg-soft-orange hover:text-dark-black rounded-lg transition-colors"
                >
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 rounded-lg bg-soft-cream/30 border border-soft-cream flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-dark-black text-sm sm:text-base">
                        {reg.course_title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-dark-black/70">
                        <span>Reg ID: {reg.registration_id}</span>
                        {reg.batch_code && <span>• Batch: {reg.batch_code}</span>}
                        {reg.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {reg.start_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <span className="font-bold text-dark-black text-sm block">
                          {reg.currency === 'GBP' ? '£' : '₹'}
                          {reg.amount.toLocaleString()}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full capitalize ${
                            reg.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>
                      {/* Open button linking to /learner/openregistration */}
                      <Link
                        href={`/learner/openregistration?registration_id=${encodeURIComponent(
                          reg.registration_id
                        )}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-primary-orange text-pure-white text-xs font-bold hover:bg-soft-orange hover:text-dark-black transition-colors shadow-2xs"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Logout Section */}
          <div className="bg-pure-white p-6 rounded-xl border border-soft-cream shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-dark-black">Log Out</h3>
                <p className="text-xs text-dark-black/70">
                  Safely sign out of your learner account on this device
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-pure-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <LearnerBottomNavigation />
    </div>
  );
}
