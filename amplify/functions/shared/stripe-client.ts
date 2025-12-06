import Stripe from "stripe";

// Singleton pattern - only create Stripe instance once
let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeInstance;
}

// Helper to get customer ID for current user
export function getCustomerId(userId: string): string {
  // For MVP: hardcoded mapping
  // TODO: Replace with database lookup in production
  return process.env.STRIPE_TEST_CUSTOMER_ID!;
}
