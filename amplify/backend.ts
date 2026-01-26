import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/get-subscription-status/resource";
import { createBillingPortal } from "./functions/create-billing-portal/resource";
import { stripeWebhook } from "./functions/stripe-webhook/resource";
import { cognitoPostConfirmation } from "./functions/cognito-post-confirmation/resource";
import { getSubscriptionPlans } from "./functions/get-subscription-plans/resource";
import { createCheckoutSession } from "./functions/create-checkout-session/resource";
import { PolicyStatement, AnyPrincipal } from "aws-cdk-lib/aws-iam";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";

// ============================================
// Backend Definition
// ============================================
const backend = defineBackend({
  auth,
  data,
  cognitoPostConfirmation,
  getSubscriptionStatus,
  createBillingPortal,
  stripeWebhook,
  getSubscriptionPlans,
  createCheckoutSession,
});

// ============================================
// Configuration Functions
// ============================================

/**
 * Configure DynamoDB access policies for Lambda functions
 */
function configureDynamoDbAccess() {
  const region = process.env.AWS_REGION || "us-east-1";
  const accountId = process.env.AWS_ACCOUNT_ID || "*";

  // Policy 1: PutItem with restricted resource
  backend.cognitoPostConfirmation.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ["dynamodb:PutItem"],
      resources: [
        `arn:aws:dynamodb:${region}:${accountId}:table/UserStripeMapping-*`,
      ],
    })
  );

  // Policy 2: ListTables (AWS requires "*" for this action)
  backend.cognitoPostConfirmation.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ["dynamodb:ListTables"],
      resources: ["*"],
    })
  );
  // For other functions: direct table reference (no circular dependency)
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
  backend.getSubscriptionStatus.resources.lambda.addToRolePolicy(
    dynamoDbPolicy
  );
  backend.createBillingPortal.resources.lambda.addToRolePolicy(dynamoDbPolicy);
}

/**
 * Configure environment variables for Lambda functions
 */
function configureEnvironmentVariables() {
  const userMappingTableName =
    backend.data.resources.tables["UserStripeMapping"].tableName;
  const subscriptionCacheTableName =
    backend.data.resources.tables["SubscriptionCache"].tableName;

  // Cognito Post-Confirmation: DO NOT reference data tables to avoid circular dependency
  // Table name will be resolved at runtime from environment
  addEnvVar(
    backend.cognitoPostConfirmation,
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY
  );
  // Don't add USER_STRIPE_MAPPING_TABLE here - let it fail at runtime if needed,
  // or we'll set it using a different approach

  // Stripe Webhook
  addEnvVar(
    backend.stripeWebhook,
    "USER_STRIPE_MAPPING_TABLE",
    userMappingTableName
  );
  addEnvVar(
    backend.stripeWebhook,
    "SUBSCRIPTION_CACHE_TABLE",
    subscriptionCacheTableName
  );

  addEnvVar(
    backend.stripeWebhook,
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY
  );

  addEnvVar(
    backend.stripeWebhook,
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET
  );

  // Get Subscription Status
  addEnvVar(
    backend.getSubscriptionStatus,
    "USER_STRIPE_MAPPING_TABLE",
    userMappingTableName
  );
  addEnvVar(
    backend.getSubscriptionStatus,
    "SUBSCRIPTION_CACHE_TABLE",
    subscriptionCacheTableName
  );

  // Create Billing Portal
  addEnvVar(
    backend.createBillingPortal,
    "USER_STRIPE_MAPPING_TABLE",
    userMappingTableName
  );
}

/**
 * Helper function to add environment variable to Lambda
 */
function addEnvVar(
  lambdaFunction: any,
  key: string,
  value: string | undefined
) {
  lambdaFunction.resources.cfnResources.cfnFunction.addPropertyOverride(
    `Environment.Variables.${key}`,
    value
  );
}

/**
 * Configure Lambda invoke permissions for authenticated users
 */
function configureLambdaInvokePermissions() {
  const region = process.env.AWS_REGION || "us-east-1";
  const accountId = process.env.AWS_ACCOUNT_ID || "*";
  backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: [
        `arn:aws:lambda:${region}:${accountId}:function:*subscriptionstatus*`,
        // Pattern matches: createBillingPortal Lambda
        `arn:aws:lambda:${region}:${accountId}:function:*billingportal*`,
        `arn:aws:lambda:${region}:${accountId}:function:*subscriptionplans*`,
        `arn:aws:lambda:${region}:${accountId}:function:*checkoutsession*`,
      ],
    })
  );
}

/**
 * Configure Stripe webhook with public Function URL
 */
function configureStripeWebhook() {
  const webhookFunctionUrl =
    backend.stripeWebhook.resources.lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

  // Grant public access
  backend.stripeWebhook.resources.lambda.addPermission("PublicInvoke", {
    principal: new AnyPrincipal(),
    action: "lambda:InvokeFunctionUrl",
    functionUrlAuthType: FunctionUrlAuthType.NONE,
  });

  return webhookFunctionUrl.url;
}

/**
 * Add custom outputs for Lambda functions
 */
function addOutputs(stripeWebhookUrl: string) {
  backend.addOutput({
    custom: {
      lambdaFunctions: {
        getSubscriptionStatus:
          backend.getSubscriptionStatus.resources.lambda.functionArn,
        createBillingPortal:
          backend.createBillingPortal.resources.lambda.functionArn,
        stripeWebhook: backend.stripeWebhook.resources.lambda.functionArn,
        stripeWebhookUrl: stripeWebhookUrl,
      },
    },
  });
}

// ============================================
// Execute Configuration
// ============================================
configureDynamoDbAccess();
configureEnvironmentVariables();
configureLambdaInvokePermissions();
const stripeWebhookUrl = configureStripeWebhook();
addOutputs(stripeWebhookUrl);
