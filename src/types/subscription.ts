export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "none";

export interface SubscriptionData {
  status: SubscriptionStatus;
  planName?: string;
  renewalDate?: string;
  renewalPeriod?: string;
  subscriptions?: Array<{
    id: string;
    status: string;
    planName: string;
    renewalDate: string;
    renewalPeriod: string;
  }>;
}

export interface BillingPortalResponse {
  url: string;
  sessionId: string;
}
