import { defineFunction } from "@aws-amplify/backend";
import "../shared/load-env.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

if (!stripeWebhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
}

export const stripeWebhook = defineFunction({
  name: "stripe-webhook",
  entry: "./handler.ts",
  environment: {
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
  },
  timeoutSeconds: 30,
  resourceGroupName: "data",
});
