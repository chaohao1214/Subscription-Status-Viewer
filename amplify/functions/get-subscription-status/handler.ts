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

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Validate authentication
    const userId = validateAuthentication(event);
    const stripe = getStripeClient();
    const customerId = getCustomerId(userId);

    // Map user ID to Stripe Customer ID (hardcoded for MVP)

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      return successResponse({ status: "none" });
    }

    // Sort subscriptions by priority
    const priorityOrder = ["active", "trialing", "past_due", "canceled"];
    const sortedSubscriptions = subscriptions.data.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.status);
      const bPriority = priorityOrder.indexOf(b.status);
      return aPriority - bPriority;
    });

    // Get primary subscription (highest priority)
    const primarySubscription = sortedSubscriptions[0];
    const primaryProductId = primarySubscription.items.data[0].price
      .product as string;
    const primaryProduct = await stripe.products.retrieve(primaryProductId);

    const allSubscriptions = await Promise.all(
      sortedSubscriptions.map(async (sub) => {
        const productId = sub.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        return {
          id: sub.id,
          status: sub.status,
          planName: product.name,
          renewalDate: new Date(sub.current_period_end * 1000).toISOString(),
          renewalPeriod: sub.items.data[0].price.recurring?.interval || "month",
        };
      })
    );
    const response = {
      status: primarySubscription.status,
      planName: primaryProduct.name,
      renewalDate: new Date(
        primarySubscription.current_period_end * 1000
      ).toISOString(),
      renewalPeriod:
        primarySubscription.items.data[0].price.recurring?.interval || "month",
      subscriptions: allSubscriptions,
    };
    return successResponse(response);
  } catch (error) {
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === "User not authenticated") {
      return unauthorizedResponse();
    }

    return errorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Unknow error"
    );
  }
};
