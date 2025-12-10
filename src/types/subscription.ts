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
