import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/get-subscription-status/resource";
import { createBillingPortal } from "./functions/create-billing-portal/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  getSubscriptionStatus,
  createBillingPortal,
});

// Grant authenticated users permission to invoke functions
backend.getSubscriptionStatus.resources.lambda.grantInvoke(
  backend.auth.resources.authenticatedUserIamRole
);

backend.createBillingPortal.resources.lambda.grantInvoke(
  backend.auth.resources.authenticatedUserIamRole
);
