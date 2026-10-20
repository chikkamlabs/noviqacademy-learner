'use client';

import React, { Suspense, useEffect, useState } from 'react';
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
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';
import { getLearnerProfile, LearnerProfileData } from '@/lib/profilesStore';
import {
  fetchCourseForRegistration,
  fetchBatchesForCourse,
  createCourseRegistration,
  validateCouponCode,
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

function CourseRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseParam = searchParams.get('course_id') || searchParams.get('id') || '';

  const [learner, setLearner] = useState<LearnerProfileData | null>(null);
  const [course, setCourse] = useState<CourseRegistrationData | null>(null);
  const [, setOpenBatches] = useState<BatchItem[]>([]);
  const [eligibleBatchInfo, setEligibleBatchInfo] = useState<EligibleBatchInfo | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [hasConfirmedContinue, setHasConfirmedContinue] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

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

      // 3. Fetch batches for this course
      const allBatches = await fetchBatchesForCourse(courseData.id, learnerRegion);

      // Rule 1: If batch "registrations" column is closed don't show that batch at all.
      const onlyOpenBatches = allBatches.filter((b) => b.registrations === 'open');
      setOpenBatches(onlyOpenBatches);

      // Rule 2: If batch "registrations" is opened and start_date + grace period (days) > date.now
      // Then ask the learner to Continue with this course.
      const now = Date.now();
      let foundEligible: EligibleBatchInfo | null = null;

      for (const batch of onlyOpenBatches) {
        const startDateMs = batch.start_date
          ? new Date(batch.start_date).getTime()
          : now;
        const graceDays = Number(batch.grace_period) || 0;
        const deadlineMs = startDateMs + graceDays * 24 * 60 * 60 * 1000;

        if (deadlineMs > now) {
          const diffFromStartMs = now - startDateMs;
          const daysCompleted = Math.max(
            0,
            Math.floor(diffFromStartMs / (1000 * 60 * 60 * 24))
          );

          foundEligible = {
            batch,
            isEligible: true,
            deadlineDate: formatReadableDate(new Date(deadlineMs).toISOString()),
            startDateFormatted: formatReadableDate(batch.start_date),
            gracePeriodDays: graceDays,
            daysCompleted,
          };
          break;
        }
      }

      setEligibleBatchInfo(foundEligible);
      setHasConfirmedContinue(false);
      setSelectedBatch(null);

      setLoading(false);
    }

    loadRegistrationData();
  }, [courseParam]);

  // Pricing & Currency calculations
  const isUk = learner?.region === 'uk';
  const currency: 'INR' | 'GBP' = isUk ? 'GBP' : 'INR';
  const currencySymbol = isUk ? '£' : '₹';

  const baseAmount = isUk
    ? course?.uk_selling_price || course?.uk_price || course?.selling_price || 0
    : course?.selling_price || course?.price || 0;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPayable = Math.max(0, baseAmount - couponDiscount);

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

  // Handle learner clicking "Continue with this course"
  const handleContinueWithCourse = () => {
    if (eligibleBatchInfo?.batch) {
      setSelectedBatch(eligibleBatchInfo.batch);
      setHasConfirmedContinue(true);
      setErrorMsg('');
    }
  };

  // Handle Pay Now click
  const handlePayNow = async () => {
    if (!course) {
      setErrorMsg('Course information is missing.');
      return;
    }

    if (!selectedBatch || !hasConfirmedContinue) {
      setErrorMsg('Please confirm to continue with this course before paying.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const res = await createCourseRegistration({
      course_id: course.id,
      batch_id: selectedBatch.id,
      amount: totalPayable,
      currency,
    });

    if (res.success && res.registration_id) {
      setSuccessResult({
        registrationId: res.registration_id,
        courseTitle: course.title,
        batchCode: selectedBatch.batch_id,
        finalAmount: totalPayable,
      });
    } else {
      setErrorMsg(res.error || 'Failed to complete registration. Please try again.');
    }

    setSubmitting(false);
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
            <div className="bg-pure-white rounded-2xl border border-dark-black/10 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-dark-black flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-orange" />
                <span>Batch Status</span>
              </h3>

              {/* When an open batch with start_date + grace_period > Date.now() exists */}
              {eligibleBatchInfo ? (
                <div className="space-y-4">
                  {!hasConfirmedContinue ? (
                    /* Ask learner to Continue with this course */
                    <div className="p-5 rounded-2xl bg-soft-cream/60 border-2 border-primary-orange/50 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide">
                            Registrations Open
                          </span>
                          <strong className="text-base text-dark-black font-mono">
                            {eligibleBatchInfo.batch.batch_id}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-dark-black/80">
                        <div>
                          Start Date:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.startDateFormatted}
                          </strong>
                        </div>
                        <div>
                          Language:{' '}
                          <strong className="text-dark-black capitalize">
                            {eligibleBatchInfo.batch.language || 'English'}
                          </strong>
                        </div>
                        <div>
                          Grace Period:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.gracePeriodDays} Days
                          </strong>
                        </div>
                        <div>
                          Days Completed:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.daysCompleted}{' '}
                            {eligibleBatchInfo.daysCompleted === 1 ? 'Day' : 'Days'}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dark-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm font-semibold text-dark-black">
                          Registrations are currently open for this batch. Continue with this course?
                        </p>
                        <button
                          type="button"
                          onClick={handleContinueWithCourse}
                          className="px-6 py-2.5 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
                        >
                          <span>Continue with this course</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Confirmed state */
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide">
                            Registrations Open
                          </span>
                          <strong className="text-sm sm:text-base text-dark-black font-mono">
                            {eligibleBatchInfo.batch.batch_id}
                          </strong>
                        </div>
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Confirmed to Continue
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-dark-black/80">
                        <div>
                          Start Date:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.startDateFormatted}
                          </strong>
                        </div>
                        <div>
                          Language:{' '}
                          <strong className="text-dark-black capitalize">
                            {eligibleBatchInfo.batch.language || 'English'}
                          </strong>
                        </div>
                        <div>
                          Grace Period:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.gracePeriodDays} Days
                          </strong>
                        </div>
                        <div>
                          Days Completed:{' '}
                          <strong className="text-dark-black">
                            {eligibleBatchInfo.daysCompleted}{' '}
                            {eligibleBatchInfo.daysCompleted === 1 ? 'Day' : 'Days'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* When no open batch with valid grace period exists */
                <div className="p-5 rounded-xl bg-soft-cream/40 border border-soft-cream text-xs sm:text-sm text-dark-black/70 space-y-2">
                  <p className="font-semibold text-dark-black">
                    No open batches currently available for this course.
                  </p>
                  <p>
                    Registrations for existing batches may have concluded. Please check back soon or explore our other available programs.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/learner/explorecourses"
                      className="inline-flex items-center gap-1.5 text-primary-orange font-bold hover:underline"
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

              {/* Fee Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm divide-y divide-soft-cream">
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
                    {selectedBatch?.batch_id ||
                      (eligibleBatchInfo ? 'Awaiting Confirmation' : 'None Available')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 pt-3">
                  <span className="text-dark-black/70">Platform &amp; Lab Access</span>
                  <span className="text-green-700 font-bold">Included Free</span>
                </div>

                <div className="flex justify-between items-center py-2 pt-3 text-sm sm:text-base font-extrabold">
                  <span className="text-dark-black">Total Payable</span>
                  <span className="text-primary-orange text-lg sm:text-xl">
                    {currencySymbol}
                    {totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedBatch || !hasConfirmedContinue || submitting}
                  onClick={handlePayNow}
                  className="w-full py-4 px-6 flex items-center justify-center gap-2 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-extrabold text-base rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Registration...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        Pay Now ({currencySymbol}
                        {totalPayable.toLocaleString()})
                      </span>
                    </>
                  )}
                </button>

                {!hasConfirmedContinue && eligibleBatchInfo && (
                  <p className="text-[11px] text-primary-orange text-center font-medium mt-2">
                    Please click &quot;Continue with this course&quot; above to enable Pay Now.
                  </p>
                )}

                <p className="text-[11px] text-center text-dark-black/50 mt-2">
                  Instant activation with status: <strong>active</strong>. Registration ID
                  formatted as REG-XXXXX.
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
