import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { validateAuthentication } from "../shared/auth-utils";
import { getCustomerId, getStripeClient } from "../shared/stripe-client";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "../shared/response-utils";
import { getSubscriptionCache, isCacheFresh } from "../shared/dynamodb-utils";
import { fetchAndCacheSubscriptions } from "../shared/subscription-utils";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = validateAuthentication(event);
    const stripe = getStripeClient();
    const customerId = await getCustomerId(userId);

    // Check cache first
    const cachedData = await getSubscriptionCache(customerId);

    if (cachedData && isCacheFresh(cachedData)) {
      console.log("Returning cached subscription data for:", customerId);
      return successResponse({
        status: cachedData.status,
        planName: cachedData.planName,
        renewalDate: cachedData.currentPeriodEnd,
        cancelAtPeriodEnd: cachedData.cancelAtPeriodEnd,
        subscriptions: cachedData.subscriptions || [],
        fromCache: true,
      });
    }

    // Cache miss or stale - fetch from Stripe
    console.log("Cache miss, fetching from Stripe for:", customerId);
    const cacheData = await fetchAndCacheSubscriptions(stripe, customerId);

    return successResponse({
      status: cacheData.status,
      planName: cacheData.planName,
      renewalDate: cacheData.currentPeriodEnd,
      cancelAtPeriodEnd: cacheData.cancelAtPeriodEnd,
      subscriptions: cacheData.subscriptions || [],
      fromCache: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return unauthorizedResponse();
    }

    return errorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
