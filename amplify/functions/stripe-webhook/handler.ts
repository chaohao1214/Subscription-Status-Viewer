import type { APIGatewayProxyHandler } from "aws-lambda";
import { getStripeClient } from "../shared/stripe-client";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
} from "../shared/response-utils";

/**
 * Stripe Webhook Handler
 *
 * Receives webhook events from Stripe when subscription changes occur.
 * Events include: subscription created/updated/deleted, invoice paid/failed.
 *
 * This handler:
 * 1. Verifies the webhook signature for security
 * 2. Processes the event (Phase 3: will update DynamoDB)
 * 3. Returns 200 to acknowledge receipt to Stripe
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("Received webhook event");

    const stripe = getStripeClient();

    // Get Stripe signature from headers (case-insensitive)
    const signature =
      event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

    if (!signature) {
      console.error("No Stripe signature found in headers");
      return badRequestResponse("Missing Stripe signature");
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === "whsec_placeholder") {
      console.warn(
        "Using placeholder webhook secret - signature verification skipped"
      );
      // For initial testing, we'll skip verification
      // TODO: Configure real webhook secret after deployment
      const body = JSON.parse(event.body || "{}");
      console.log("Event type:", body.type);
      return successResponse({ received: true, verified: false });
    }

    // Verify webhook signature (ensures request is from Stripe)
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body!,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return badRequestResponse("Invalid signature");
    }

    console.log("Webhook verified:", {
      type: stripeEvent.type,
      id: stripeEvent.id,
    });

    // TODO Phase 3: Handle different event types and update DynamoDB
    switch (stripeEvent.type) {
      case "customer.subscription.created":
        console.log("Subscription created:", stripeEvent.data.object.id);
        break;

      case "customer.subscription.updated":
        console.log("Subscription updated:", stripeEvent.data.object.id);
        break;

      case "customer.subscription.deleted":
        console.log("Subscription deleted:", stripeEvent.data.object.id);
        break;

      case "invoice.paid":
        console.log("Invoice paid:", stripeEvent.data.object.id);
        break;

      case "invoice.payment_failed":
        console.log("Payment failed:", stripeEvent.data.object.id);
        break;

      default:
        console.log("Unhandled event type:", stripeEvent.type);
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return errorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
