import { defineFunction } from "@aws-amplify/backend";
import "../shared/load-env.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const getSubscriptionStatus = defineFunction({
  name: "get-subscription-status",
  entry: "./handler.ts",
  environment: {
    STRIPE_SECRET_KEY: stripeSecretKey,
    // USER_STRIPE_CUSTOMER_DEFAULT:
    //   process.env.USER_STRIPE_CUSTOMER_DEFAULT || "",

    // USER_STRIPE_CUSTOMER_A43824B8_1071_705B_8EEF_120AA7E641D6:
    //   process.env.USER_STRIPE_CUSTOMER_A43824B8_1071_705B_8EEF_120AA7E641D6 ||
    //   "",
  },
  resourceGroupName: "data",
});
