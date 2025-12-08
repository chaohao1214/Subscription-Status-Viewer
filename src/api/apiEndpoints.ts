import { fetchAuthSession } from "aws-amplify/auth";
import { Lambda, InvokeCommand } from "@aws-sdk/client-lambda";
import type {
  BillingPortalResponse,
  SubscriptionData,
} from "../types/subscription";
import outputs from "../../amplify_outputs.json";

const lambdaFunctions = outputs.custom?.lambdaFunctions;

if (!lambdaFunctions) {
  throw new Error("Lambda functions not configured in amplify_outputs.json");
}
/**
 * Lambda function name mappings
 * These are the suffix parts that get appended to the Amplify stack prefix
 */
const LAMBDA_ENDPOINTS = {
  getSubscription: lambdaFunctions.getSubscriptionStatus,
  createBillingPortal: lambdaFunctions.createBillingPortal,
} as const;

/**
 * Generic Lambda function invoker
 * Handles authentication, IAM signing, and response parsing
 *
 * @param functionName - Lambda function name suffix (from LAMBDA_ENDPOINTS)
 * @param payload - Additional event data to pass to the Lambda function
 * @returns Parsed response body with type T
 * @throws Error if authentication fails or Lambda returns non-200 status
 */
async function invokeLambda<T>(
  functionName: string,
  payload?: Record<string, any>
): Promise<T> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const client = new Lambda({
    region: outputs.auth.aws_region,
    credentials: session.credentials,
  });

  // Invoke the Lambda function
  // FunctionName format: amplify-{projectName}-{functionSuffix}-{randomId}
  const response = await client.send(
    new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({
        requestContext: {
          authorizer: {
            claims: {
              sub: session.tokens?.accessToken?.payload.sub,
            },
          },
        },
        ...payload,
      }),
    })
  );

  const result = JSON.parse(new TextDecoder().decode(response.Payload));

  if (result.statusCode !== 200) {
    const error = JSON.parse(result.body);
    throw new Error(error.message || "API request failed");
  }

  return JSON.parse(result.body);
}

/**
 * Fetch current user's subscription status from Stripe
 *
 * @returns Subscription data including status, plan name, renewal date, and billing period
 * @throws Error if user is not authenticated or API call fails
 *
 * @example
 * const subscription = await getSubscriptionStatus();
 * console.log(subscription.status); // 'active' | 'trialing' | 'past_due' | 'canceled' | 'none'
 */
export async function getSubscriptionStatus(): Promise<SubscriptionData> {
  return invokeLambda<SubscriptionData>(LAMBDA_ENDPOINTS.getSubscription);
}

/**
 * Create a Stripe Billing Portal session for subscription management
 * Redirects user to Stripe's hosted portal where they can update payment methods,
 * cancel subscriptions, or view billing history
 *
 * @param returnUrl - URL to redirect user back to after they finish in the billing portal
 * @returns Billing portal URL and session ID
 * @throws Error if user is not authenticated or API call fails
 *
 * @example
 * const portal = await createBillingPortalSession('http://localhost:5173/subscription');
 * window.location.href = portal.url; // Redirect to Stripe
 */
export async function createBillingPortalSession(
  returnUrl: string
): Promise<BillingPortalResponse> {
  return invokeLambda<BillingPortalResponse>(
    LAMBDA_ENDPOINTS.createBillingPortal,
    {
      httpMethod: "POST",
      path: "/billing-portal",
      body: JSON.stringify({ returnUrl }),
    }
  );
}
