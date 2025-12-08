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
      limit: 1,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      return successResponse({ status: "none" });
    }

    // Get first subscription and its details
    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    const response = {
      status: subscription.status,
      planName: product.name,
      renewalDate: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      renewalPeriod:
        subscription.items.data[0].price.recurring?.interval || "month",
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
