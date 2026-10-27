'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Check,
  ArrowRight,
  Tag,
  Users,
  Clock,
  Languages,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import { getLearnerProfile, LearnerProfileData } from '@/lib/profilesStore';
import {
  fetchCourseForRegistration,
  fetchBatchesForCourse,
  createCourseRegistration,
  validateCouponCode,
  validateReferralCode,
  formatReadableDate,
  BatchItem,
  CourseRegistrationData,
} from '@/lib/registrationStore';

interface EligibleBatchInfo {
  batch: BatchItem;
  isEligible: boolean;
  deadlineDate: string;
  startDateFormatted: string;
  gracePeriodDays: number;
  daysCompleted: number;
}

interface AppliedCouponInfo {
  code: string;
  discount: number;
}

interface AppliedReferralInfo {
  code: string;
  learnerId: string;
  name: string;
}

function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return '—';
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  } catch {
    // fallback
  }
  return timeStr;
}

function CourseRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseParam = searchParams.get('course_id') || searchParams.get('id') || '';

  const [learner, setLearner] = useState<LearnerProfileData | null>(null);
  const [course, setCourse] = useState<CourseRegistrationData | null>(null);
  const [allBatches, setAllBatches] = useState<BatchItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Telugu'>('English');
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [hasConfirmedContinue, setHasConfirmedContinue] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Referral state
  const [referralInput, setReferralInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferralInfo | null>(null);
  const [referralError, setReferralError] = useState('');
  const [validatingReferral, setValidatingReferral] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{
    registrationId: string;
    courseTitle: string;
    batchCode: string;
    finalAmount: number;
  } | null>(null);

  useEffect(() => {
    async function loadRegistrationData() {
      if (!courseParam) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      // 1. Fetch learner profile
      const userProfile = await getLearnerProfile();
      setLearner(userProfile);

      const learnerRegion = userProfile?.region === 'uk' ? 'uk' : 'india';

      // 2. Fetch course details
      const courseData = await fetchCourseForRegistration(courseParam);
      setCourse(courseData);

      if (!courseData) {
        setLoading(false);
        return;
      }

      // 3. Fetch batches for this course in learner region
      const batches = await fetchBatchesForCourse(courseData.id, learnerRegion);
      setAllBatches(batches);
      setCurrentTime(Date.now());
      setHasConfirmedContinue(false);
      setSelectedBatch(null);

      setLoading(false);
    }

    loadRegistrationData();
  }, [courseParam]);

  // Pricing & Currency calculations
  const isUk = learner?.region === 'uk';
  const [selectedCurrency, setSelectedCurrency] = useState<'GBP' | 'INR'>('GBP');
  const currency: 'INR' | 'GBP' = isUk ? 'GBP' : 'INR';
  const currencySymbol = isUk ? '£' : '₹';
  const learnerRegion = isUk ? 'uk' : 'india';

  // Compute all eligible batches with existing grace period condition and selected language for learner region
  const eligibleBatches: EligibleBatchInfo[] = useMemo(() => {
    if (!currentTime) return [];
    const targetRegion = learnerRegion.toLowerCase();
    const selLang = selectedLanguage.toLowerCase();

    return allBatches
      .filter((b) => b.registrations === 'open')
      .filter((b) => {
        const bRegion = (b.region || 'india').toLowerCase();
        return bRegion === targetRegion;
      })
      .filter((b) => {
        const bLang = (b.language || 'English').toLowerCase();
        return bLang === selLang;
      })
      .map((batch) => {
        const startDateMs = batch.start_date
          ? new Date(batch.start_date).getTime()
          : currentTime;
        const graceDays = Number(batch.grace_period) || 0;
        const deadlineMs = startDateMs + graceDays * 24 * 60 * 60 * 1000;
        const isEligible = deadlineMs > currentTime;
        const diffFromStartMs = currentTime - startDateMs;
        const daysCompleted = Math.max(
          0,
          Math.floor(diffFromStartMs / (1000 * 60 * 60 * 24))
        );

        return {
          batch,
          isEligible,
          deadlineDate: formatReadableDate(new Date(deadlineMs).toISOString()),
          startDateFormatted: formatReadableDate(batch.start_date),
          gracePeriodDays: graceDays,
          daysCompleted,
        };
      })
      .filter((info) => info.isEligible);
  }, [allBatches, currentTime, learnerRegion, selectedLanguage]);

  const isSelectedBatchEligible = selectedBatch
    ? eligibleBatches.some((info) => info.batch.id === selectedBatch.id)
    : false;
  const activeSelectedBatch = isSelectedBatchEligible ? selectedBatch : null;
  const isConfirmedForRegistration = isSelectedBatchEligible && hasConfirmedContinue;

  const baseAmount = isUk
    ? course?.uk_selling_price || course?.uk_price || course?.selling_price || 0
    : course?.selling_price || course?.price || 0;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPayable = Math.max(0, baseAmount - couponDiscount);

  // Conversion only on Total Payable for UK learner tapping INR
  const inrBasePrice = course?.selling_price || course?.price || 0;
  const ukBasePrice =
    course?.uk_selling_price || course?.uk_price || course?.selling_price || 1;
  const inrTotalPayable =
    ukBasePrice > 0
      ? Math.max(0, Math.round(totalPayable * 130))
      : inrBasePrice;

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await validateCouponCode(couponInput, isUk ? 'uk' : 'india');

    if (res.valid && res.code) {
      setAppliedCoupon({
        code: res.code,
        discount: res.discount,
      });
      setCouponSuccess(
        `Coupon "${res.code}" applied! Saved ${currencySymbol}${res.discount.toLocaleString()}`
      );
    } else {
      setCouponError(res.error || 'Invalid or expired coupon code.');
      setAppliedCoupon(null);
    }

    setValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Handle Referral Code Apply
  const handleApplyReferral = async () => {
    if (!referralInput.trim()) {
      setReferralError('Please enter a referral code.');
      return;
    }

    setValidatingReferral(true);
    setReferralError('');

    const res = await validateReferralCode(referralInput, learner?.id);

    if (res.valid && res.learnerId && res.name) {
      setAppliedReferral({
        code: referralInput.trim().toUpperCase(),
        learnerId: res.learnerId,
        name: res.name,
      });
    } else {
      setReferralError(res.error || 'Invalid referral code.');
      setAppliedReferral(null);
    }

    setValidatingReferral(false);
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput('');
    setReferralError('');
  };

  // Handle learner clicking "Continue with this course"
  const handleContinueWithCourse = (batchToConfirm?: BatchItem) => {
    const target = batchToConfirm || selectedBatch || eligibleBatches[0]?.batch;
    if (target) {
      setSelectedBatch(target);
      setHasConfirmedContinue(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Please select a batch to continue with this course.');
    }
  };

  // Handle Register & Pay Now click via Cashfree Payments
  const handlePayNow = async () => {
    if (!course) {
      setErrorMsg('Course information is missing.');
      return;
    }

    if (!activeSelectedBatch || !isConfirmedForRegistration) {
      setErrorMsg('Please confirm to continue with this course before paying.');
      return;
    }

    if (!learner?.id) {
      setErrorMsg('You must be logged in as a learner to proceed with registration.');
      return;
    }

    // If UK learner selected GBP: Redirect to WhatsApp (+91 81884871722) with details formatted message
    if (isUk && selectedCurrency === 'GBP') {
      const messageLines = [
        'Hello Noviq Academy! 👋',
        '',
        '*[Course Registration Request - UK (GBP)]*',
        `*Course:* ${course.title}`,
        `*Batch Code:* ${activeSelectedBatch.batch_id} (${activeSelectedBatch.language || selectedLanguage})`,
        activeSelectedBatch.start_date ? `*Start Date:* ${formatReadableDate(activeSelectedBatch.start_date)}` : '',
        (activeSelectedBatch.from_time || activeSelectedBatch.to_time)
          ? `*Timings:* ${formatTimeString(activeSelectedBatch.from_time)} - ${formatTimeString(activeSelectedBatch.to_time)}`
          : '',
        '',
        '*[Learner Details]*',
        `*Name:* ${learner.name || 'Learner'}`,
        learner.email ? `*Email:* ${learner.email}` : '',
        learner.mobile ? `*Phone:* ${learner.mobile}` : '',
        `*Region:* United Kingdom (UK)`,
        '',
        '*[Payment Summary]*',
        `*Course Tuition Fee:* £${baseAmount.toLocaleString()}`,
        appliedCoupon ? `*Coupon Discount (${appliedCoupon.code}):* -£${appliedCoupon.discount.toLocaleString()}` : '',
        appliedReferral ? `*Referral Code:* ${appliedReferral.code} (${appliedReferral.name})` : '',
        `*Total Payable:* £${totalPayable.toLocaleString()} GBP`,
        '',
        'I would like to complete my registration in GBP. Please guide me with payment details & next steps.',
        '',
        'Sent from Noviq Academy Course Registration',
      ].filter(Boolean);

      const formatted = messageLines.join('\n');
      const targetUrl = `https://wa.me/9181884871722?text=${encodeURIComponent(formatted)}`;
      window.location.href = targetUrl;
      return;
    }

    if (!learner?.email) {
      setErrorMsg('Learner email is required. Please ensure your email is updated on your profile.');
      return;
    }

    const cleanedPhone = (learner?.mobile || '').replace(/[^0-9]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setErrorMsg(
        'A valid 10-digit mobile number is required on your profile to initiate Cashfree payment. Please update your profile.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Amount to pay: if UK learner tapped INR, use inrTotalPayable; otherwise totalPayable (India learner)
      const payableAmount = isUk && selectedCurrency === 'INR' ? inrTotalPayable : totalPayable;

      // 1. Create order via Cashfree create_order API route with real authenticated data
      const response = await fetch('/api/payments/cashfree/create_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          batch_id: activeSelectedBatch.id,
          amount: payableAmount,
          currency: 'INR',
          coupon_code: appliedCoupon?.code,
          referral_by: appliedReferral?.learnerId || null,
          customer_details: {
            customer_id: learner.id,
            customer_name: learner.name || 'Learner',
            customer_email: learner.email,
            customer_phone: cleanedPhone.slice(-10),
          },
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Cashfree payment.');
      }

      if (!orderData.payment_session_id) {
        throw new Error('Cashfree did not return a valid payment_session_id.');
      }

      // 2. Launch Cashfree PG checkout using official SDK
      const { load } = await import('@cashfreepayments/cashfree-js');
      const cashfreeMode =
        orderData.mode === 'production' ? 'production' : 'sandbox';

      const cashfree = await load({ mode: cashfreeMode });

      await cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: '_self',
      });
    } catch (err: unknown) {
      console.error('[Cashfree initiation error]:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to initiate Cashfree payment. Please try again.';
      setErrorMsg(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-soft-cream">
        <LearnerHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-dark-black">
              Checking open batches &amp; registration availability...
            </p>
          </div>
        </main>
        <LearnerBottomNavigation />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-soft-cream">
        <LearnerHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-pure-white p-6 sm:p-8 rounded-2xl border border-dark-black/10 text-center space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-dark-black">Course Not Found</h2>
            <p className="text-xs sm:text-sm text-dark-black/70">
              The course requested could not be identified or is currently inactive.
            </p>
            <Link
              href="/learner/explorecourses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-orange text-pure-white font-bold rounded-xl text-xs sm:text-sm shadow-xs hover:bg-soft-orange hover:text-dark-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>
          </div>
        </main>
        <LearnerBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream text-dark-black">
      <LearnerHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-dark-black/70 hover:text-primary-orange transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </button>
        </div>

        {/* Success Screen */}
        {successResult ? (
          <div className="bg-pure-white rounded-2xl border-2 border-primary-orange/40 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                Status: Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-dark-black">
                Registration Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/70 max-w-md mx-auto">
                You are now officially enrolled in <strong>{successResult.courseTitle}</strong>.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-soft-cream/60 rounded-xl border border-soft-orange/30 max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-dark-black/70">Registration ID:</span>
                <span className="font-mono font-bold text-primary-orange text-sm sm:text-base">
                  {successResult.registrationId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-dark-black/70">Assigned Batch:</span>
                <span className="font-bold text-dark-black">{successResult.batchCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-dark-black/70">Amount Paid:</span>
                <span className="font-bold text-dark-black">
                  {currencySymbol}
                  {successResult.finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/app/learner/openregistration?registration_id=${successResult.registrationId}`}
                className="w-full sm:w-auto px-6 py-3 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-bold rounded-xl text-sm transition-colors shadow-xs text-center"
              >
                View Registration Details
              </Link>
              <Link
                href="/learner/courses/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-soft-cream hover:bg-soft-cream/80 text-dark-black font-bold rounded-xl text-sm border border-dark-black/10 transition-colors text-center"
              >
                Go to My Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-dark-black tracking-tight">
                Course Registration &amp; Checkout
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/70 mt-1">
                Review your course batch assignment, program fee, and activate your enrollment.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Course Summary Card */}
            <div className="bg-pure-white rounded-2xl border border-dark-black/10 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-soft-cream text-primary-orange text-xs font-bold border border-soft-orange/30">
                      <BookOpen className="w-3.5 h-3.5" />
                      Program
                    </span>
                    <span className="text-xs text-dark-black/60 font-medium">
                      Duration: {course.duration} Days
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-dark-black">{course.title}</h2>
                  {course.sub_heading && (
                    <p className="text-xs sm:text-sm text-dark-black/70">{course.sub_heading}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-dark-black">
                    {currencySymbol}
                    {baseAmount.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-dark-black/50 font-medium">
                    Region: {isUk ? 'United Kingdom (GBP)' : 'India (INR)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Open Batch Status & "Continue with this course" Selection */}
            <div className="bg-pure-white rounded-2xl border border-dark-black/10 p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-dark-black flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-orange" />
                <span>Batch Status</span>
              </h3>

              {/* 1. Language Selection First (English or Telugu) */}
              <div className="p-4 rounded-xl bg-soft-cream/40 border border-soft-orange/30 space-y-2">
                <label className="block text-xs font-bold text-dark-black uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-primary-orange" />
                  <span>Select Language</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('English');
                      if (selectedBatch && (selectedBatch.language || 'English').toLowerCase() !== 'english') {
                        setSelectedBatch(null);
                        setHasConfirmedContinue(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedLanguage === 'English'
                        ? 'bg-primary-orange text-pure-white shadow-xs'
                        : 'bg-pure-white border border-soft-orange/40 text-dark-black hover:border-primary-orange'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('Telugu');
                      if (selectedBatch && (selectedBatch.language || '').toLowerCase() !== 'telugu') {
                        setSelectedBatch(null);
                        setHasConfirmedContinue(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedLanguage === 'Telugu'
                        ? 'bg-primary-orange text-pure-white shadow-xs'
                        : 'bg-pure-white border border-soft-orange/40 text-dark-black hover:border-primary-orange'
                    }`}
                  >
                    Telugu
                  </button>
                </div>
              </div>

              {/* 2. Display all batches for this course in learner region with existing grace period & selected language */}
              {eligibleBatches.length > 0 ? (
                <div className="space-y-3.5">
                  <p className="text-xs sm:text-sm font-semibold text-dark-black/70">
                    Available open batches for <strong className="text-dark-black">{selectedLanguage}</strong> in your region ({isUk ? 'UK' : 'India'}):
                  </p>

                  <div className="space-y-3">
                    {eligibleBatches.map((info) => {
                      const isThisSelected = activeSelectedBatch?.id === info.batch.id;
                      const isConfirmed = isThisSelected && isConfirmedForRegistration;

                      return (
                        <div
                          key={info.batch.id}
                          onClick={() => {
                            setSelectedBatch(info.batch);
                            if (activeSelectedBatch?.id !== info.batch.id) {
                              setHasConfirmedContinue(false);
                            }
                          }}
                          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isConfirmed
                              ? 'bg-green-50/70 border-green-500 shadow-xs'
                              : isThisSelected
                              ? 'bg-soft-cream/80 border-primary-orange shadow-xs'
                              : 'bg-pure-white border-soft-cream hover:border-soft-orange/60 shadow-2xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-black/10">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="selectedBatch"
                                checked={isThisSelected}
                                onChange={() => {
                                  setSelectedBatch(info.batch);
                                  if (activeSelectedBatch?.id !== info.batch.id) {
                                    setHasConfirmedContinue(false);
                                  }
                                }}
                                className="w-4 h-4 text-primary-orange accent-primary-orange cursor-pointer"
                              />
                              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider">
                                Registrations Open
                              </span>
                              <strong className="text-sm sm:text-base text-dark-black font-mono">
                                {info.batch.batch_id}
                              </strong>
                            </div>

                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold shrink-0 self-start sm:self-auto">
                                <Check className="w-3.5 h-3.5" />
                                <span>Selected &amp; Confirmed</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContinueWithCourse(info.batch);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                              >
                                <span>Continue with this course</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Batch details grid: Start date, Language, from_time & to_time, Grace period, Days completed */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3 text-xs sm:text-sm text-dark-black/80">
                            <div>
                              <span className="text-dark-black/60">Start Date:</span>{' '}
                              <strong className="text-dark-black">{info.startDateFormatted}</strong>
                            </div>
                            <div>
                              <span className="text-dark-black/60">Language:</span>{' '}
                              <strong className="text-dark-black capitalize">{info.batch.language || 'English'}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                              <span className="text-dark-black/60">From Time:</span>{' '}
                              <strong className="text-dark-black">{formatTimeString(info.batch.from_time)}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary-orange shrink-0" />
                              <span className="text-dark-black/60">To Time:</span>{' '}
                              <strong className="text-dark-black">{formatTimeString(info.batch.to_time)}</strong>
                            </div>
                            <div>
                              <span className="text-dark-black/60">Grace Period:</span>{' '}
                              <strong className="text-dark-black">{info.gracePeriodDays} Days</strong>
                            </div>
                            <div>
                              <span className="text-dark-black/60">Days Completed:</span>{' '}
                              <strong className="text-dark-black">
                                {info.daysCompleted} {info.daysCompleted === 1 ? 'Day' : 'Days'}
                              </strong>
                            </div>
                          </div>

                          {isConfirmed && (
                            <div className="mt-3 pt-2.5 border-t border-green-200 flex items-center justify-between text-xs">
                              <span className="text-green-800 font-medium">
                                Batch <strong className="font-mono">{info.batch.batch_id}</strong> will be used for your enrollment.
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHasConfirmedContinue(false);
                                }}
                                className="text-primary-orange font-bold hover:underline cursor-pointer"
                              >
                                Change batch
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {activeSelectedBatch && !isConfirmedForRegistration && (
                    <div className="p-4 rounded-xl bg-primary-orange/10 border border-primary-orange/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm font-bold text-dark-black">
                        Selected Batch: <span className="font-mono text-primary-orange">{activeSelectedBatch.batch_id}</span>. Continue with this course?
                      </p>
                      <button
                        type="button"
                        onClick={() => handleContinueWithCourse(activeSelectedBatch)}
                        className="px-6 py-2.5 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
                      >
                        <span>Continue with this course</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No open batches for this language */
                <div className="p-5 rounded-xl bg-soft-cream/40 border border-soft-cream text-xs sm:text-sm text-dark-black/70 space-y-2">
                  <p className="font-semibold text-dark-black">
                    No open batches currently available in {selectedLanguage} for this course.
                  </p>
                  <p>
                    Registrations for existing {selectedLanguage} batches may have concluded or haven&apos;t opened yet.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(selectedLanguage === 'English' ? 'Telugu' : 'English');
                        setSelectedBatch(null);
                        setHasConfirmedContinue(false);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-soft-cream border border-soft-orange/40 text-xs font-bold text-primary-orange hover:bg-soft-orange/30 cursor-pointer"
                    >
                      Switch to {selectedLanguage === 'English' ? 'Telugu' : 'English'} batches
                    </button>
                    <Link
                      href="/learner/explorecourses"
                      className="inline-flex items-center gap-1.5 text-xs text-dark-black/70 font-bold hover:text-primary-orange"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Browse other open courses</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Summary & Payment Card */}
            <div className="bg-pure-white rounded-2xl border-2 border-soft-cream p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-dark-black flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-orange" />
                <span>Payment Summary</span>
              </h3>

              {/* Coupon Code Section */}
              <div className="p-4 rounded-xl bg-soft-cream/40 border border-soft-cream space-y-2.5">
                <label
                  htmlFor="coupon-code-input"
                  className="block text-xs font-bold text-dark-black flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-primary-orange" />
                  <span>Have a Coupon Code?</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="Enter code (e.g. NOVIQ50)"
                    disabled={!!appliedCoupon || validatingCoupon}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/20 focus:outline-hidden focus:border-primary-orange font-mono uppercase text-dark-black"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {validatingCoupon ? 'Verifying...' : 'Apply'}
                    </button>
                  )}
                </div>

                {couponError && (
                  <p className="text-xs text-red-600 font-semibold">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
              </div>

              {/* Referral Code Section */}
              <div className="p-4 rounded-xl bg-soft-cream/40 border border-soft-cream space-y-2.5">
                <label
                  htmlFor="referral-code-input"
                  className="block text-xs font-bold text-dark-black flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-primary-orange" />
                  <span>Have a Referral Code?</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="referral-code-input"
                    type="text"
                    value={referralInput}
                    onChange={(e) => {
                      setReferralInput(e.target.value.toUpperCase());
                      setReferralError('');
                    }}
                    placeholder="Enter referral code"
                    disabled={!!appliedReferral || validatingReferral}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-pure-white rounded-xl border border-dark-black/20 focus:outline-hidden focus:border-primary-orange font-mono uppercase text-dark-black"
                  />
                  {appliedReferral ? (
                    <button
                      type="button"
                      onClick={handleRemoveReferral}
                      className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      disabled={validatingReferral || !referralInput.trim()}
                      className="px-4 py-2 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {validatingReferral ? 'Verifying...' : 'Apply'}
                    </button>
                  )}
                </div>

                {referralError && (
                  <p className="text-xs text-red-600 font-semibold">{referralError}</p>
                )}
                {appliedReferral && (
                  <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      Referral name: <strong className="font-bold text-dark-black">{appliedReferral.name}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm divide-y divide-soft-cream">
                {/* For UK region learner: ask currency (INR or GBP) just above Course Tuition Fee */}
                {isUk && (
                  <div className="pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-dark-black">
                        Select Currency
                      </span>
                      <span className="text-[11px] text-dark-black/60 font-medium">
                        {selectedCurrency === 'INR' ? 'Paying in Indian Rupees (₹)' : 'Paying in British Pounds (£)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency('INR')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedCurrency === 'INR'
                            ? 'bg-primary-orange text-pure-white shadow-xs'
                            : 'bg-soft-cream/60 text-dark-black border border-dark-black/15 hover:border-primary-orange'
                        }`}
                      >
                        <span>INR (₹)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency('GBP')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedCurrency === 'GBP'
                            ? 'bg-primary-orange text-pure-white shadow-xs'
                            : 'bg-soft-cream/60 text-dark-black border border-dark-black/15 hover:border-primary-orange'
                        }`}
                      >
                        <span>GBP (£)</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-dark-black/70">Course Tuition Fee</span>
                  <span className="font-semibold text-dark-black">
                    {currencySymbol}
                    {baseAmount.toLocaleString()}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center py-1.5 pt-3 text-green-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Coupon Discount ({appliedCoupon.code})
                    </span>
                    <span>
                      -{currencySymbol}
                      {appliedCoupon.discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1.5 pt-3">
                  <span className="text-dark-black/70">Batch Code</span>
                  <span className="font-mono font-bold text-dark-black">
                    {activeSelectedBatch?.batch_id
                      ? `${activeSelectedBatch.batch_id} (${activeSelectedBatch.language || selectedLanguage})`
                      : (eligibleBatches.length > 0 ? 'Awaiting Confirmation' : 'None Available')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 pt-3">
                  <span className="text-dark-black/70">Platform &amp; Lab Access</span>
                  <span className="text-green-700 font-bold">Included Free</span>
                </div>

                <div className="flex justify-between items-center py-2 pt-3 text-sm sm:text-base font-extrabold">
                  <span className="text-dark-black">Total Payable</span>
                  <span className="text-primary-orange text-lg sm:text-xl">
                    {isUk && selectedCurrency === 'INR'
                      ? `₹${inrTotalPayable.toLocaleString()}`
                      : `${currencySymbol}${totalPayable.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Register & Pay Now Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!activeSelectedBatch || !isConfirmedForRegistration || submitting}
                  onClick={handlePayNow}
                  className="w-full py-4 px-6 flex items-center justify-center gap-2 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-base rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                      <span>Initiating Cashfree Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        Register &amp; Pay Now (
                        {isUk && selectedCurrency === 'INR'
                          ? `₹${inrTotalPayable.toLocaleString()}`
                          : `${currencySymbol}${totalPayable.toLocaleString()}`}
                        )
                      </span>
                    </>
                  )}
                </button>
                {!isConfirmedForRegistration && eligibleBatches.length > 0 && (
                  <p className="text-[11px] text-primary-orange text-center font-medium mt-2">
                    Please click &quot;Continue with this course&quot; above to select your batch and enable Register &amp; Pay Now.
                  </p>
                )}
                <p className="text-[11px] text-center text-dark-black/50 mt-2">
                  {isUk && selectedCurrency === 'GBP'
                    ? 'UK enrollment in GBP is completed via WhatsApp (+91 81884871722).'
                    : (
                      <>Secure checkout via Cashfree Payments. Instant activation with status: <strong>active</strong>.</>
                    )}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <LearnerBottomNavigation />
    </div>
  );
}

export default function CourseRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <p className="text-sm font-semibold text-dark-black">Loading registration...</p>
        </div>
      }
    >
      <CourseRegistrationContent />
    </Suspense>
  );
}
