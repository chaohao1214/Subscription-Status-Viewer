import type { APIGatewayProxyHandler } from "aws-lambda";
import { getStripeClient } from "../shared/stripe-client";
import {
  badRequestResponse,
  errorResponse,
  successResponse,
} from "../shared/response-utils";
import {
  saveSubscriptionCache,
  type SubscriptionCache,
} from "../shared/dynamodb-utils";
import type Stripe from "stripe";

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

    // Handle subscription events
    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(
          stripe,
          stripeEvent.data.object as Stripe.Subscription
        );
        break;

      case "invoice.paid":
        console.log("Invoice paid:", stripeEvent.data.object.id);
        // Optionally refresh subscription cache after payment
        const paidInvoice = stripeEvent.data.object as Stripe.Invoice;
        if (paidInvoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            paidInvoice.subscription as string
          );
          await handleSubscriptionEvent(stripe, subscription);
        }
        break;

      case "invoice.payment_failed":
        console.log("Payment failed:", stripeEvent.data.object.id);
        const failedInvoice = stripeEvent.data.object as Stripe.Invoice;
        if (failedInvoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            failedInvoice.subscription as string
          );
          await handleSubscriptionEvent(stripe, subscription);
        }
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

/**
 * Handle subscription events and update DynamoDB cache
 */
async function handleSubscriptionEvent(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<void> {
  console.log("Processing subscription event:", {
    id: subscription.id,
    status: subscription.status,
    customer: subscription.customer,
    current_period_end: subscription.current_period_end,
  });

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // Get product name
  let planName: string | undefined;
  let planId: string | undefined;

  try {
    const priceData = subscription.items.data[0]?.price;
    if (priceData?.product) {
      planId =
        typeof priceData.product === "string"
          ? priceData.product
          : priceData.product.id;
      const product = await stripe.products.retrieve(planId);
      planName = product.name;
    }
  } catch (err) {
    console.error("Error fetching product:", err);
  }

  // Safe date handling
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : undefined;

  // Build cache data
  const cacheData: SubscriptionCache = {
    stripeCustomerId: customerId,
    status: subscription.status,
    planName,
    planId,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
    lastSyncedFromStripe: new Date().toISOString(),
  };

  // Save to DynamoDB
  await saveSubscriptionCache(cacheData);

  console.log("Subscription cache updated:", {
    customerId,
    status: subscription.status,
    planName,
  });
}
