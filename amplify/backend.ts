import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/get-subscription-status/resource";
import { createBillingPortal } from "./functions/create-billing-portal/resource";
import { stripeWebhook } from "./functions/stripe-webhook/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";

const backend = defineBackend({
  auth,
  data,
  getSubscriptionStatus,
  createBillingPortal,
  stripeWebhook,
});

// DynamoDB access policy
const dynamoDbPolicy = new PolicyStatement({
  actions: [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query",
    "dynamodb:Scan",
  ],
  resources: [
    backend.data.resources.tables["UserStripeMapping"].tableArn,
    backend.data.resources.tables["SubscriptionCache"].tableArn,
  ],
});

backend.stripeWebhook.resources.lambda.addToRolePolicy(dynamoDbPolicy);
backend.getSubscriptionStatus.resources.lambda.addToRolePolicy(dynamoDbPolicy);

// Add table names to Lambda environment
backend.stripeWebhook.resources.cfnResources.cfnFunction.addPropertyOverride(
  "Environment.Variables.USER_STRIPE_MAPPING_TABLE",
  backend.data.resources.tables["UserStripeMapping"].tableName
);
backend.stripeWebhook.resources.cfnResources.cfnFunction.addPropertyOverride(
  "Environment.Variables.SUBSCRIPTION_CACHE_TABLE",
  backend.data.resources.tables["SubscriptionCache"].tableName
);

backend.getSubscriptionStatus.resources.cfnResources.cfnFunction.addPropertyOverride(
  "Environment.Variables.USER_STRIPE_MAPPING_TABLE",
  backend.data.resources.tables["UserStripeMapping"].tableName
);
backend.getSubscriptionStatus.resources.cfnResources.cfnFunction.addPropertyOverride(
  "Environment.Variables.SUBSCRIPTION_CACHE_TABLE",
  backend.data.resources.tables["SubscriptionCache"].tableName
);

// Lambda invoke permissions - using wildcard to avoid circular dependency
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["lambda:InvokeFunction"],
    resources: ["*"],
  })
);

const webhookFunctionUrl =
  backend.stripeWebhook.resources.lambda.addFunctionUrl({
    authType: FunctionUrlAuthType.NONE,
  });
// Output function ARNs
backend.addOutput({
  custom: {
    lambdaFunctions: {
      getSubscriptionStatus:
        backend.getSubscriptionStatus.resources.lambda.functionArn,
      createBillingPortal:
        backend.createBillingPortal.resources.lambda.functionArn,
      stripeWebhook: backend.stripeWebhook.resources.lambda.functionArn,
      stripeWebhookUrl: webhookFunctionUrl.url,
    },
  },
});
