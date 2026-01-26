import { defineFunction } from "@aws-amplify/backend";
import "../shared/load-env.js";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}
export const getSubscriptionPlans = defineFunction({
  name: "get-subscription-plans",
  entry: "./handler.ts",
  environment: {
    STRIPE_SECRET_KEY: stripeSecretKey,
  },
});
