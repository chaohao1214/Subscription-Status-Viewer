import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/get-subscription-status/resource";
import { createBillingPortal } from "./functions/create-billing-portal/resource";
import { stripeWebhook } from "./functions/stripe-webhook/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  getSubscriptionStatus,
  createBillingPortal,
  stripeWebhook,
});

// Grant authenticated users permission to invoke functions
backend.getSubscriptionStatus.resources.lambda.grantInvoke(
  backend.auth.resources.authenticatedUserIamRole
);

backend.createBillingPortal.resources.lambda.grantInvoke(
  backend.auth.resources.authenticatedUserIamRole
);

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["lambda:InvokeFunction"],
    resources: [
      backend.getSubscriptionStatus.resources.lambda.functionArn,
      backend.createBillingPortal.resources.lambda.functionArn,
    ],
  })
);

backend.addOutput({
  custom: {
    lambdaFunctions: {
      getSubscriptionStatus:
        backend.getSubscriptionStatus.resources.lambda.functionArn,
      createBillingPortal:
        backend.createBillingPortal.resources.lambda.functionArn,
    },
  },
});
