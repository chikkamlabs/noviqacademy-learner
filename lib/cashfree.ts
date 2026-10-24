import crypto from 'crypto';

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CashfreeOrderMeta {
  return_url?: string;
  notify_url?: string;
  payment_methods?: string;
}

export interface CashfreeCreateOrderPayload {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: CashfreeCustomerDetails;
  order_meta?: CashfreeOrderMeta;
  order_note?: string;
  order_tags?: Record<string, string>;
}

export interface CashfreeOrderResponse {
  cf_order_id?: string | number;
  order_id: string;
  entity?: string;
  order_currency: string;
  order_amount: number;
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED';
  payment_session_id?: string;
  order_token?: string;
  order_expiry_time?: string;
  order_note?: string;
  customer_details?: CashfreeCustomerDetails;
  order_tags?: Record<string, string>;
  payments?: {
    url?: string;
  };
  settlements?: {
    url?: string;
  };
  refunds?: {
    url?: string;
  };
  message?: string;
  code?: string;
  type?: string;
}

export interface CashfreePaymentItem {
  cf_payment_id: number | string;
  order_id: string;
  payment_status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED' | 'CANCELLED';
  payment_amount: number;
  payment_currency: string;
  payment_message?: string;
  payment_time?: string;
  payment_completion_time?: string;
  payment_group?: string;
  payment_method?: Record<string, unknown>;
}

/**
 * Cashfree Client Configuration Helper
 */
export function getCashfreeConfig() {
  const appId =
    process.env.CASHFREE_APP_ID ||
    process.env.CASHFREE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_CASHFREE_APP_ID ||
    '';

  const secretKey =
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET ||
    '';

  const env = (
    process.env.CASHFREE_ENV ||
    process.env.NEXT_PUBLIC_CASHFREE_MODE ||
    'sandbox'
  ).toLowerCase();

  const isProduction = env === 'production' || env === 'prod';
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';

  const baseUrl = isProduction
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return {
    appId,
    secretKey,
    env: isProduction ? 'production' : 'sandbox',
    baseUrl,
    apiVersion,
  };
}

/**
 * Creates an order on Cashfree PG.
 * Validates real customer data and raises error if anything fails.
 */
export async function createCashfreeOrder(
  payload: CashfreeCreateOrderPayload
): Promise<CashfreeOrderResponse> {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error(
      'Cashfree credentials missing: CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set in environment variables.'
    );
  }

  if (!payload.order_id) {
    throw new Error('Cashfree order creation failed: order_id is required.');
  }

  if (!payload.order_amount || payload.order_amount <= 0) {
    throw new Error('Cashfree order creation failed: Valid positive order_amount is required.');
  }

  if (!payload.customer_details) {
    throw new Error('Cashfree order creation failed: customer_details is required.');
  }

  const { customer_id, customer_email, customer_phone, customer_name } = payload.customer_details;

  if (!customer_id || !customer_id.trim()) {
    throw new Error('Cashfree order creation failed: customer_id is required.');
  }

  if (!customer_email || !customer_email.trim()) {
    throw new Error('Cashfree order creation failed: customer_email is required.');
  }

  const cleanedPhone = (customer_phone || '').replace(/[^0-9]/g, '');
  if (!cleanedPhone || cleanedPhone.length < 10) {
    throw new Error(
      'Cashfree order creation failed: A valid 10-digit customer phone number is required.'
    );
  }

  const requestBody = {
    order_id: payload.order_id,
    order_amount: Math.round(payload.order_amount * 100) / 100,
    order_currency: payload.order_currency || 'INR',
    customer_details: {
      customer_id: customer_id.trim().slice(0, 50),
      customer_name: customer_name ? customer_name.trim().slice(0, 100) : 'Learner',
      customer_email: customer_email.trim(),
      customer_phone: cleanedPhone.slice(-10),
    },
    order_meta: payload.order_meta || {},
    order_note: payload.order_note || 'Noviq Academy Registration',
    ...(payload.order_tags ? { order_tags: payload.order_tags } : {}),
  };

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      data?.message || data?.description || data?.sub_code || JSON.stringify(data);
    console.error('[Cashfree Client] create order error:', data);
    throw new Error(`Cashfree order creation error (${response.status}): ${errorMsg}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches order details from Cashfree.
 * Raises error if failed.
 */
export async function getCashfreeOrder(
  orderId: string
): Promise<CashfreeOrderResponse> {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error(
      'Cashfree credentials missing: CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set in environment variables.'
    );
  }

  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || data?.description || JSON.stringify(data);
    throw new Error(`Failed to fetch Cashfree order (${response.status}): ${errorMsg}`);
  }

  return data as CashfreeOrderResponse;
}

/**
 * Fetches payments/transactions for a specific order from Cashfree.
 * Raises error if failed.
 */
export async function getCashfreeOrderPayments(
  orderId: string
): Promise<CashfreePaymentItem[]> {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error(
      'Cashfree credentials missing: CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set in environment variables.'
    );
  }

  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: 'GET',
    headers: {
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || data?.description || JSON.stringify(data);
    throw new Error(`Failed to fetch Cashfree payments (${response.status}): ${errorMsg}`);
  }

  return Array.isArray(data) ? (data as CashfreePaymentItem[]) : [];
}

/**
 * Verifies webhook signature sent by Cashfree using HMAC-SHA256
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const config = getCashfreeConfig();
  if (!config.secretKey) {
    return false;
  }

  try {
    const bodyToSign = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(bodyToSign)
      .digest('base64');

    return expectedSignature === signature;
  } catch (err) {
    console.error('[Cashfree Client] Webhook signature verification error:', err);
    return false;
  }
}
