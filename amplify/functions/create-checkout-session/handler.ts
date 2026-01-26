import {
  badRequestResponse,
  errorResponse,
  successResponse,
} from "../shared/response-utils";
import { getStripeClient } from "../shared/stripe-client";

interface CheckoutEvent {
  body: string;
}

interface CheckoutBody {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export const handler = async (event: CheckoutEvent) => {
  try {
    const stripe = getStripeClient();
    const body: CheckoutBody = JSON.parse(event.body);
    const { priceId, successUrl, cancelUrl } = body;
    if (!priceId || !successUrl || !cancelUrl) {
      return badRequestResponse(
        "Missing required fields: priceId, successUrl, cancelUrl"
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return successResponse({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return errorResponse("Failed to create checkout session");
  }
};
