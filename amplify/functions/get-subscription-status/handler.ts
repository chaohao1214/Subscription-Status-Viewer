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
import {
  getSubscriptionCache,
  isCacheFresh,
  saveSubscriptionCache,
  SubscriptionCache,
  SubscriptionItem,
} from "../shared/dynamodb-utils";

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

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      await saveSubscriptionCache({
        stripeCustomerId: customerId,
        status: "none",
        subscriptions: [],
        updatedAt: new Date().toISOString(),
        lastSyncedFromStripe: new Date().toISOString(),
      });
      return successResponse({ status: "none", subscriptions: [] });
    }

    // Sort subscriptions by priority
    const priorityOrder = ["active", "trialing", "past_due", "canceled"];
    const sortedSubscriptions = subscriptions.data.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.status);
      const bPriority = priorityOrder.indexOf(b.status);
      return aPriority - bPriority;
    });

    // Get primary subscription
    const primarySubscription = sortedSubscriptions[0];
    const primaryProductId = primarySubscription.items.data[0].price
      .product as string;
    const primaryProduct = await stripe.products.retrieve(primaryProductId);

    // Build all subscriptions array
    const allSubscriptions: SubscriptionItem[] = await Promise.all(
      sortedSubscriptions.map(async (sub) => {
        const productId = sub.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        return {
          id: sub.id,
          status: sub.status,
          planName: product.name,
          renewalDate: new Date(sub.current_period_end * 1000).toISOString(),
          renewalPeriod: sub.items.data[0].price.recurring?.interval || "month",
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          cancelAt: sub.cancel_at
            ? new Date(sub.cancel_at * 1000).toISOString()
            : undefined, //cancel read this key
        };
      })
    );

    // Save to cache with all subscriptions
    const cacheData: SubscriptionCache = {
      stripeCustomerId: customerId,
      status: primarySubscription.status,
      planName: primaryProduct.name,
      planId: primaryProductId,
      currentPeriodEnd: new Date(
        primarySubscription.current_period_end * 1000
      ).toISOString(),
      cancelAtPeriodEnd: primarySubscription.cancel_at_period_end,
      subscriptions: allSubscriptions,
      updatedAt: new Date().toISOString(),
      lastSyncedFromStripe: new Date().toISOString(),
    };
    await saveSubscriptionCache(cacheData);

    const response = {
      status: primarySubscription.status,
      planName: primaryProduct.name,
      renewalDate: new Date(
        primarySubscription.current_period_end * 1000
      ).toISOString(),
      renewalPeriod:
        primarySubscription.items.data[0].price.recurring?.interval || "month",
      cancelAtPeriodEnd: primarySubscription.cancel_at_period_end,
      subscriptions: allSubscriptions,
      fromCache: false,
    };

    return successResponse(response);
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
