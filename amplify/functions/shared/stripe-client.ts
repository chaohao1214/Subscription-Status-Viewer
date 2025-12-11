import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import Stripe from "stripe";

const dynamoClient = new DynamoDBClient({});
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
 * Strategy:
 * 1. Try DynamoDB UserStripeMapping table first
 * 2. Fallback to environment variables (for backwards compatibility)
 *
 * @param userId - Cognito user ID (from JWT token)
 * @returns Stripe customer ID
 * @throws Error if no mapping found
 */
export const getCustomerId = async (userId: string): Promise<string> => {
  const tableName = process.env.USER_STRIPE_MAPPING_TABLE;

  if (tableName) {
    try {
      const result = await dynamoClient.send(
        new GetItemCommand({
          TableName: tableName,
          Key: {
            userId: { S: userId },
          },
        })
      );
      if (result.Item?.stripeCustomerId?.S) {
        console.log(
          `Found DynamoDB mapping: ${userId} -> ${result.Item.stripeCustomerId.S}`
        );
        return result.Item.stripeCustomerId.S;
      }
    } catch (error) {
      console.warn("DynamoDB lookup failed, falling back to env vars:", error);
    }
  }

  /**
   * since we use DynamoDB, we no longer need the code belows,
   *  because we complete Stretch Goal -Amplify Data model
   */
  // Fallback to environment variables
  const sanitizedUserId = userId.replace(/-/g, "_").toUpperCase();
  const userSpecificEnvVar = `USER_STRIPE_CUSTOMER_${sanitizedUserId}`;

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
