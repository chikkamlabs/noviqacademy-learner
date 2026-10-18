import { supabase } from './supabase';

export interface CouponCode {
  id: string;
  code: string;
  discount_value: number;
  valid_till: string | null;
  count: number;
  thersold: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fallback coupons matching the schema when Supabase data is not yet populated
const FALLBACK_COUPONS: CouponCode[] = [
  {
    id: 'f1-coupon-1',
    code: 'NOVIQ50',
    discount_value: 50,
    valid_till: '2026-12-31T23:59:59Z',
    count: 14,
    thersold: 500,
    is_public: true,
  },
  {
    id: 'f2-coupon-2',
    code: 'LEARN30',
    discount_value: 30,
    valid_till: '2026-11-30T23:59:59Z',
    count: 42,
    thersold: 300,
    is_public: true,
  },
  {
    id: 'f3-coupon-3',
    code: 'BUILD20',
    discount_value: 20,
    valid_till: '2026-12-15T23:59:59Z',
    count: 88,
    thersold: 1000,
    is_public: true,
  },
  {
    id: 'f4-coupon-4',
    code: 'MENTOR40',
    discount_value: 40,
    valid_till: '2026-10-31T23:59:59Z',
    count: 25,
    thersold: 100,
    is_public: true,
  },
];

/**
 * Fetch all active public coupons from the Supabase coupon_codes table
 */
export async function getActiveCoupons(): Promise<CouponCode[]> {
  try {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_COUPONS;
    }

    // Filter valid_till if exists
    const now = new Date().getTime();
    const validCoupons = (data as CouponCode[]).filter((c) => {
      if (!c.valid_till) return true;
      return new Date(c.valid_till).getTime() > now;
    });

    return validCoupons.length > 0 ? validCoupons : FALLBACK_COUPONS;
  } catch (err) {
    console.warn('Error fetching coupons from Supabase, using fallback data:', err);
    return FALLBACK_COUPONS;
  }
}

/**
 * Validate a specific coupon code by code string
 */
export async function getCouponByCode(code: string): Promise<CouponCode | null> {
  try {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (error || !data) {
      const fallback = FALLBACK_COUPONS.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase()
      );
      return fallback || null;
    }

    return data as CouponCode;
  } catch (err) {
    console.warn('Error fetching coupon by code:', err);
    return null;
  }
}
