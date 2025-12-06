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
  renewalPeriord?: "month" | "year";
}

export interface BillingPortalResponse {
  url: string;
  sessionId: string;
}
