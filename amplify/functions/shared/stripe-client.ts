import Stripe from "stripe";

/**
 * Initialize Stripe client with secret key from environment
 */
export const getStripeClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
  });
};

/**
 * Map Cognito user ID to Stripe customer ID
 *
 * UPDATED: Now supports multiple users through environment variables
 *
 * Mapping strategy:
 * 1. Try USER_STRIPE_CUSTOMER_<userId> (exact match)
 * 2. Fallback to USER_STRIPE_CUSTOMER_DEFAULT
 *
 * @param userId - Cognito user ID (from JWT token)
 * @returns Stripe customer ID
 * @throws Error if no mapping found
 */
export const getCustomerId = (userId: string): string => {
  // Sanitize userId for use in environment variable name
  // Replace hyphens with underscores for valid env var names
  const sanitizedUserId = userId.replace(/-/g, "_").toUpperCase();
  const userSpecificEnvVar = `USER_STRIPE_CUSTOMER_${sanitizedUserId}`;

  // Try user-specific mapping first
  let customerId = process.env[userSpecificEnvVar];

  if (customerId) {
    console.log(`Found user-specific mapping: ${userId} -> ${customerId}`);
    return customerId;
  }

  // Fallback to default customer
  customerId = process.env.USER_STRIPE_CUSTOMER_DEFAULT;

  if (customerId) {
    console.log(`Using default customer mapping: ${userId} -> ${customerId}`);
    return customerId;
  }

  // No mapping found - throw error
  throw new Error(
    `No Stripe customer mapping found for user: ${userId}. ` +
      `Please set ${userSpecificEnvVar} or USER_STRIPE_CUSTOMER_DEFAULT environment variable.`
  );
};
