export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "none";

export interface SingleSubscription {
  id: string;
  status: SubscriptionStatus;
  planName: string;
  renewalDate: string;
  renewalPeriod: "month" | "year";
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string;
}
export interface SubscriptionData {
  status: SubscriptionStatus;
  subscriptions?: SingleSubscription[];
  fromCache?: boolean;
}

export interface BillingPortalResponse {
  url: string;
  sessionId: string;
}

// Stripe Product and Price types
export interface StripePrice {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  livemode: boolean;
  product: string;
  recurring: {
    interval: "month" | "year";
    interval_count: number;
    usage_type: string;
  };
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  created: number;
  default_price: StripePrice;
  description: string | null;
  name: string;
  type: string;
  updated: number;
}

export interface SubscriptionPlansResponse {
  products: StripeProduct[];
}

export interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}
