import type { APIGatewayProxyHandler } from "aws-lambda";
import { validateAuthentication } from "../shared/auth-utils";
import { getCustomerId, getStripeClient } from "../shared/stripe-client";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "../shared/response-utils";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Validate authentication
    const userId = validateAuthentication(event);
    const stripe = getStripeClient();
    const customerId = getCustomerId(userId);

    const body = event.body ? JSON.parse(event.body) : {};
    const returnUrl = body.returnUrl;

    // Validate required parameter
    if (!returnUrl) {
      return badRequestResponse("returnUrl is required");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return successResponse({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === "User not authenticated") {
      return unauthorizedResponse();
    }

    return errorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
