import { supabase } from './supabase';

export interface CouponCode {
  id: string;
  code: string;
  discount_value: number;
  uk_discount_value?: number | null;
  valid_till: string | null;
  count: number;
  thersold: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

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
      return [];
    }

    // Filter valid_till if exists
    const now = new Date().getTime();
    const validCoupons = (data as CouponCode[]).filter((c) => {
      if (!c.valid_till) return true;
      return new Date(c.valid_till).getTime() > now;
    });

    return validCoupons;
  } catch (err) {
    console.warn('Error fetching coupons from Supabase:', err);
    return [];
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
      return null;
    }

    return data as CouponCode;
  } catch (err) {
    console.warn('Error fetching coupon by code:', err);
    return null;
  }
}
