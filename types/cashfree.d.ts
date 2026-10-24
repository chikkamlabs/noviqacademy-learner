declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_modal';
    appearance?: {
      theme?: 'light' | 'dark';
      variables?: Record<string, string>;
    };
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<void>;
  }

  export function load(options: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;
}
