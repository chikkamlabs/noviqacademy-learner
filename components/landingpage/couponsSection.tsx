'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveCoupons, CouponCode } from '@/lib/couponsStore';

export default function CouponsSection() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      const active = await getActiveCoupons();
      setCoupons(active);
    }
    loadCoupons();
  }, []);

  // Auto-scroll one after another every 4 seconds
  useEffect(() => {
    if (coupons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coupons.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [coupons.length]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error('Failed to copy coupon code', e);
    }
  };

  const handlePrev = () => {
    if (coupons.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + coupons.length) % coupons.length);
  };

  const handleNext = () => {
    if (coupons.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % coupons.length);
  };

  const formatValidTill = (dateStr: string | null) => {
    if (!dateStr) return 'Limited period';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (coupons.length === 0) {
    return null;
  }

  const currentCoupon = coupons[currentIndex];

  return (
    <section id="coupons-section" className="sticky top-0 z-50 w-full bg-soft-cream text-dark-black border-b border-soft-orange/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-between text-xs sm:text-sm font-medium">
        {/* Navigation arrow left */}
        <button
          onClick={handlePrev}
          type="button"
          aria-label="Previous coupon"
          className="p-0.5 sm:p-1 rounded-sm text-dark-black hover:text-primary-orange transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Scrolling coupon text content - 2 rows on mobile, 1 row on desktop */}
        <div className="flex-1 overflow-hidden px-1 sm:px-2 text-center">
          <div
            key={currentCoupon.id || currentCoupon.code}
            className="flex flex-col sm:flex-row sm:items-center justify-center gap-y-0.5 sm:gap-x-2.5 transition-all duration-300"
          >
            {/* Row 1 on mobile: Discount value & validity */}
            <div className="inline-flex items-center justify-center gap-1.5 flex-wrap text-[10px] sm:text-xs md:text-sm leading-tight">
              <span>
                Get discount of{' '}
                <span className="font-bold text-dark-black">₹{currentCoupon.discount_value}</span> Or{' '}
                <span className="font-bold text-dark-black">
                  £{currentCoupon.uk_discount_value != null ? currentCoupon.uk_discount_value : currentCoupon.discount_value}
                </span>
              </span>
              <span className="opacity-50">•</span>
              <span>
                Valid till{' '}
                <span className="font-semibold">{formatValidTill(currentCoupon.valid_till)}</span>
              </span>
            </div>

            <span className="hidden sm:inline opacity-60">•</span>

            {/* Row 2 on mobile: Coupon code & Copy button */}
            <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs md:text-sm leading-tight">
              <span>Your code</span>
              <span className="text-primary-orange font-bold font-mono tracking-wider px-1.5 py-0.2 rounded-xs bg-pure-white border border-soft-orange/50 text-[10px] sm:text-xs">
                {currentCoupon.code}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentCoupon.code)}
                title="Copy coupon code"
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0.5 bg-primary-orange text-pure-white rounded-xs hover:bg-soft-orange hover:text-dark-black transition-colors"
              >
                {copiedCode === currentCoupon.code ? (
                  <>
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation arrow right */}
        <button
          onClick={handleNext}
          type="button"
          aria-label="Next coupon"
          className="p-0.5 sm:p-1 rounded-sm text-dark-black hover:text-primary-orange transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </section>
  );
}
