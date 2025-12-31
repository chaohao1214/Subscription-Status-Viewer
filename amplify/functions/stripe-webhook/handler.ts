import type { APIGatewayProxyHandler } from "aws-lambda";
import { getStripeClient } from "../shared/stripe-client";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
} from "../shared/response-utils";
import type Stripe from "stripe";
import { fetchAndCacheSubscriptions } from "../shared/subscription-utils";

/**
 * Stripe Webhook Handler
 *
 * Receives webhook events from Stripe when subscription changes occur.
 * Updates SubscriptionCache in DynamoDB for real-time status sync.
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
      const body = JSON.parse(event.body || "{}");
      console.log("Event type:", body.type);
      return successResponse({ received: true, verified: false });
    }

    // Verify webhook signature (ensures request is from Stripe)
    let stripeEvent: Stripe.Event;
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

    await handleStripeEvent(stripe, stripeEvent);
    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return errorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

async function handleStripeEvent(
  stripe: Stripe,
  stripeEvent: Stripe.Event
): Promise<void> {
  switch (stripeEvent.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      console.log("Processing subscription event:", {
        id: subscription.id,
        status: subscription.status,
        customer: customerId,
      });
      await fetchAndCacheSubscriptions(stripe, customerId);
      console.log("Subscription cache updated for:", customerId);
      break;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = stripeEvent.data.object as Stripe.Invoice;
      console.log(`Invoice ${stripeEvent.type}:`, invoice.id);

      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await fetchAndCacheSubscriptions(stripe, customerId);
      }
      break;
    }

    default:
      console.log("Unhandled event type:", stripeEvent.type);
  }
}
