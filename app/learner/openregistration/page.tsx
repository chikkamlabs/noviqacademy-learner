'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  User,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import {
  getRegistrationDetails,
  RegistrationFullDetail,
  formatReadableDate,
  formatReadableDateTime,
} from '@/lib/registrationsStore';

function RegistrationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationIdParam =
    searchParams.get('registration_id') || searchParams.get('id') || '';

  const [detail, setDetail] = useState<RegistrationFullDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegistration() {
      if (!registrationIdParam) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await getRegistrationDetails(registrationIdParam);
      setDetail(data);
      setLoading(false);
    }
    loadRegistration();
  }, [registrationIdParam]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-2xl border border-soft-cream shadow-xs">
        Loading registration details...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-16 px-6 text-center bg-pure-white rounded-2xl border border-soft-cream shadow-xs max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-black">Registration Not Found</h3>
        <p className="text-xs sm:text-sm text-dark-black/70 mt-1.5">
          We could not find records for registration ID &quot;{registrationIdParam || '—'}&quot;.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary-orange text-pure-white rounded-lg hover:bg-soft-orange hover:text-dark-black text-sm font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>
      </div>
    );
  }

  const currencySymbol = detail.currency === 'GBP' ? '£' : '₹';
  const payment = detail.payment;

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Link & View Only Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-dark-black hover:text-primary-orange transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registrations</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Official Record (View Only)</span>
          </span>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-pure-white rounded-2xl p-6 sm:p-8 border-2 border-soft-cream shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-soft-cream">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-sm bg-soft-cream text-primary-orange border border-soft-orange/50">
                {detail.registration_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  detail.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {detail.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-black tracking-tight leading-snug">
              {detail.course_title}
            </h1>
            {detail.course_subheading && (
              <p className="text-xs sm:text-sm text-dark-black/70 max-w-2xl font-normal">
                {detail.course_subheading}
              </p>
            )}
          </div>

          {/* Amount Badge */}
          <div className="bg-soft-cream/60 border border-soft-orange/40 rounded-xl p-4 text-left md:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold text-dark-black/60 block">
              Enrollment Fee Paid
            </span>
            <span className="text-2xl sm:text-3xl font-black text-primary-orange block mt-0.5">
              {currencySymbol}
              {detail.amount.toLocaleString()}
            </span>
            <span className="text-[10px] text-dark-black/60 block mt-1">
              Registered on {formatReadableDate(detail.created_at)}
            </span>
          </div>
        </div>

        {/* Learner Info Snapshot */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-dark-black/60 block text-[10px]">Learner</span>
              <span className="font-bold text-dark-black">{detail.learner_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-dark-black/60 block text-[10px]">Email</span>
              <span className="font-bold text-dark-black truncate block">{detail.learner_email}</span>
            </div>
          </div>

          {detail.learner_mobile && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-soft-cream flex items-center justify-center text-primary-orange shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-dark-black/60 block text-[10px]">Mobile</span>
                <span className="font-bold text-dark-black">{detail.learner_mobile}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2 Columns: Registration Details (Left) & Payment Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: ALL REGISTRATION DETAILS (View Only) */}
        <div className="bg-pure-white rounded-2xl p-6 border border-soft-cream shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-soft-cream">
            <div className="w-9 h-9 rounded-lg bg-soft-cream flex items-center justify-center text-primary-orange">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-dark-black">
                Registration Details
              </h2>
              <p className="text-[11px] text-dark-black/60">
                Comprehensive course enrollment & batch parameters
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Registration ID</span>
              <span className="font-mono font-bold text-dark-black">{detail.registration_id}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Course Title</span>
              <span className="font-bold text-dark-black text-right max-w-xs">{detail.course_title}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Course Duration</span>
              <span className="font-bold text-dark-black">{detail.course_duration} Days</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Batch Code / ID</span>
              <span className="font-bold text-primary-orange font-mono">{detail.batch_code}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Batch Start Date</span>
              <span className="font-bold text-dark-black">{formatReadableDate(detail.start_date)}</span>
            </div>

            {detail.end_date && (
              <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
                <span className="text-dark-black/60 font-medium">Batch End Date</span>
                <span className="font-bold text-dark-black">{formatReadableDate(detail.end_date)}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Class Timing</span>
              <span className="font-bold text-dark-black">{detail.time_display}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Instruction Language</span>
              <span className="font-bold text-dark-black">{detail.language}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Assigned Region</span>
              <span className="font-bold text-dark-black">{detail.region}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Enrolled Timestamp</span>
              <span className="font-bold text-dark-black">{formatReadableDateTime(detail.created_at)}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-dark-black/60 font-medium">Enrollment Status</span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                  detail.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {detail.status}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: ALL PAYMENT DETAILS (View Only) */}
        <div className="bg-pure-white rounded-2xl p-6 border border-soft-cream shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-soft-cream">
            <div className="w-9 h-9 rounded-lg bg-soft-cream flex items-center justify-center text-primary-orange">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-dark-black">
                Payment Details
              </h2>
              <p className="text-[11px] text-dark-black/60">
                Transaction history and payment gateway confirmation
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Payment Status</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{payment?.status || 'Success'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Total Amount Paid</span>
              <span className="font-bold text-primary-orange text-base sm:text-lg">
                {currencySymbol}
                {payment?.amount.toLocaleString() || detail.amount.toLocaleString()} {detail.currency}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Payment Provider</span>
              <span className="font-bold text-dark-black uppercase font-mono tracking-wider">
                {payment?.provider || (detail.currency === 'GBP' ? 'Stripe' : 'Cashfree')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Gateway Order ID</span>
              <span className="font-mono text-dark-black font-semibold text-xs truncate max-w-[210px]">
                {payment?.provider_order_id || `ord_${detail.registration_id}`}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Transaction / Payment ID</span>
              <span className="font-mono text-dark-black font-semibold text-xs truncate max-w-[210px]">
                {payment?.provider_payment_id || `-`}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Payment Timestamp</span>
              <span className="font-bold text-dark-black">
                {formatReadableDateTime(payment?.paid_at || '-')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-soft-cream/60">
              <span className="text-dark-black/60 font-medium">Currency</span>
              <span className="font-bold text-dark-black">{detail.currency}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-dark-black/60 font-medium">Billing Mode</span>
              <span className="font-semibold text-dark-black">Full Pre-paid Enrollment</span>
            </div>
          </div>

          {/* Verification Box */}
          <div className="p-4 rounded-xl bg-soft-cream/50 border border-soft-orange/40 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-dark-black">
              <Sparkles className="w-3.5 h-3.5 text-primary-orange" />
              <span>Official Enrollment Confirmation</span>
            </div>
            <p className="text-dark-black/70 leading-relaxed text-[11px]">
              This is a read-only confirmation of your verified course registration and digital payment. A confirmation email and batch invitation have also been archived for your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnerOpenRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-soft-cream">
      {/* 1. Header Attached */}
      <LearnerHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <Suspense
          fallback={
            <div className="py-24 text-center text-sm text-dark-black/60 font-medium bg-pure-white rounded-2xl border border-soft-cream shadow-xs">
              Loading registration details...
            </div>
          }
        >
          <RegistrationDetailContent />
        </Suspense>
      </main>

      {/* 2. Bottom Navigation Attached */}
      <LearnerBottomNavigation />
    </div>
  );
}
