'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import LearnerHeader from '@/components/learner/header';
import LearnerBottomNavigation from '@/components/learner/bottomnavigation';

function CashfreeFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('cf_id') || '';
  const reason = searchParams.get('reason') || searchParams.get('message') || '';

  return (
    <div className="min-h-screen flex flex-col bg-soft-cream text-dark-black">
      <LearnerHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-28">
        <div className="bg-pure-white rounded-3xl border border-red-200/80 p-6 sm:p-10 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Failed Icon */}
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-11 h-11" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Payment Not Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-dark-black tracking-tight">
              Payment Incomplete or Cancelled
            </h1>
            <p className="text-xs sm:text-sm text-dark-black/70 max-w-md mx-auto">
              We couldn&apos;t complete your payment with Cashfree. No worries—your course spot can still be reserved by trying again.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-4 sm:p-5 bg-soft-cream/60 rounded-2xl border border-dark-black/10 max-w-md mx-auto text-left space-y-2 text-xs sm:text-sm">
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-dark-black/70">Order Reference:</span>
                <span className="font-mono font-bold text-dark-black">{orderId}</span>
              </div>
            )}
            {reason && (
              <div className="flex justify-between items-center">
                <span className="text-dark-black/70">Reason:</span>
                <span className="font-medium text-red-600">{reason}</span>
              </div>
            )}
            <div className="pt-2 border-t border-dark-black/10 text-[11px] text-dark-black/60 leading-relaxed">
              If money was debited from your bank or UPI account, your bank will automatically reverse the transaction within 3–5 working days.
            </div>
          </div>

          {/* Suggested Steps */}
          <div className="text-left bg-pure-white p-4 rounded-xl border border-dark-black/10 max-w-md mx-auto space-y-2">
            <p className="text-xs font-bold text-dark-black flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary-orange" />
              <span>What can you do?</span>
            </p>
            <ul className="text-xs text-dark-black/70 space-y-1 list-disc list-inside">
              <li>Check your internet connection and payment app notification</li>
              <li>Verify daily UPI or card limits with your bank</li>
              <li>Retry with an alternative payment method (Card, Net Banking, or UPI)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 py-3 bg-primary-orange hover:bg-soft-orange hover:text-dark-black text-pure-white font-bold rounded-xl text-sm transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Payment</span>
            </button>

            <Link
              href="/learner/explorecourses"
              className="w-full sm:w-auto px-6 py-3 bg-pure-white hover:bg-soft-cream text-dark-black font-bold rounded-xl text-sm border border-dark-black/15 transition-colors inline-flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>

            <Link
              href="/learner/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-soft-cream hover:bg-soft-cream/80 text-dark-black/80 font-bold rounded-xl text-sm transition-colors text-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>

      <LearnerBottomNavigation />
    </div>
  );
}

export default function CashfreeFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <p className="text-sm font-semibold text-dark-black">Loading...</p>
        </div>
      }
    >
      <CashfreeFailedContent />
    </Suspense>
  );
}
