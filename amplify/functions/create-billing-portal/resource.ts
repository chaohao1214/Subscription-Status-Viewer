import { defineFunction } from "@aws-amplify/backend";
import "../shared/load-env.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeCustomerId = process.env.STRIPE_TEST_CUSTOMER_ID;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

if (!stripeCustomerId) {
  throw new Error("STRIPE_TEST_CUSTOMER_ID environment variable is required");
}

export const createBillingPortal = defineFunction({
  name: "create-billing-portal",
  entry: "./handler.ts",
  environment: {
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_TEST_CUSTOMER_ID: stripeCustomerId,
  },
});
