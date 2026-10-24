'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';

interface VerificationResult {
  success: boolean;
  order_id: string;
  registration_id?: string;
  course_id?: string;
  batch_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  message?: string;
}

function CashfreeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id') || searchParams.get('cf_id') || '';

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId) {
        setLoading(false);
        setErrorMsg('No order ID provided in return URL.');
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');

        const res = await fetch(`/api/payments/cashfree/verify?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success && ['PAID', 'SUCCESS'].includes(
  String(data.status || '').toUpperCase()
)) {
  setResult(data);
} else {
  const status = String(data.status || '').toUpperCase();

  if (['FAILED', 'USER_DROPPED', 'CANCELLED', 'EXPIRED'].includes(status)) {
    router.replace(
      `/cashfree/failed?order_id=${encodeURIComponent(orderId)}`
    );
    return;
  }

  setErrorMsg(
    data.error || data.message || 'Payment status is still being confirmed.'
  );
}
      } catch (err: unknown) {
        console.error('Error verifying Cashfree order:', err);
        const msg = err instanceof Error ? err.message : 'Failed to communicate with payment verification service.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId]);

  const copyRegistrationId = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currencySymbol = result?.currency === 'GBP' ? '£' : '₹';

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream text-dark-black">
      <LearnerHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-28">
        {loading ? (
          <div className="bg-pure-white rounded-3xl border border-dark-black/10 p-8 sm:p-12 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-dark-black">
              Verifying Cashfree Payment...
            </h2>
            <p className="text-xs sm:text-sm text-dark-black/70 max-w-md mx-auto">
              Please wait while we confirm your transaction and activate your course registration.
            </p>
          </div>
        ) : errorMsg ? (
          <div className="bg-pure-white rounded-3xl border border-red-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-dark-black">
                Verification Incomplete
              </h2>
              <p className="text-xs sm:text-sm text-dark-black/70 max-w-md mx-auto">
                {errorMsg}
              </p>
            </div>

            {orderId && (
              <div className="p-3 bg-soft-cream/60 rounded-xl max-w-xs mx-auto text-xs font-mono text-dark-black/70">
                Order ID: {orderId}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Retry Verification
              </button>
              <Link
                href={`/cashfree/failed?order_id=${encodeURIComponent(orderId)}`}
                className="w-full sm:w-auto px-6 py-2.5 bg-soft-cream hover:bg-soft-cream/80 text-dark-black font-bold rounded-xl text-sm border border-dark-black/10 transition-colors text-center"
              >
                View Failure Details
              </Link>
            </div>
          </div>
        ) : result ? (
          <div className="bg-pure-white rounded-3xl border-2 border-green-500/30 p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cashfree Payment Verified &amp; Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-dark-black tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-xs sm:text-sm text-dark-black/70 max-w-lg mx-auto">
                Congratulations! Your payment has been processed successfully. You are now enrolled in your program at Noviq Academy.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-5 sm:p-6 bg-soft-cream/60 rounded-2xl border border-soft-orange/30 max-w-md mx-auto text-left space-y-3">
              {result.registration_id && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-dark-black/70">Registration ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-primary-orange text-sm sm:text-base">
                      {result.registration_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRegistrationId(result.registration_id!)}
                      title="Copy Registration ID"
                      className="p-1 text-dark-black/50 hover:text-dark-black transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-dark-black/70">Order ID:</span>
                <span className="font-mono text-xs text-dark-black/80 font-medium">
                  {result.order_id}
                </span>
              </div>

              {result.amount !== undefined && (
                <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-dark-black/10">
                  <span className="text-dark-black/70">Amount Paid:</span>
                  <span className="font-black text-dark-black text-base">
                    {currencySymbol}
                    {result.amount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-dark-black/70">Enrollment Status:</span>
                <span className="font-bold text-green-700 capitalize">
                  {result.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/learner/courses/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-bold rounded-xl text-sm transition-all shadow-xs inline-flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Go to My Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {result.registration_id && (
                <Link
                  href={`/learner/openregistration?registration_id=${result.registration_id}`}
                  className="w-full sm:w-auto px-6 py-3 bg-pure-white hover:bg-soft-cream text-dark-black font-bold rounded-xl text-sm border border-dark-black/15 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Registration Details</span>
                </Link>
              )}

              <Link
                href="/learner/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-soft-cream hover:bg-soft-cream/80 text-dark-black/80 font-bold rounded-xl text-sm transition-colors text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <LearnerBottomNavigation />
    </div>
  );
}

export default function CashfreeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-dark-black">Verifying payment...</p>
          </div>
        </div>
      }
    >
      <CashfreeSuccessContent />
    </Suspense>
  );
}
