import type Stripe from "stripe";
import {
  saveSubscriptionCache,
  SubscriptionCache,
  SubscriptionItem,
} from "./dynamodb-utils";
/**
 * Priority order for subscription statuses
 * Active subscriptions should appear first, canceled last
 */
const STATUS_PRIORITY = ["active", "trialing", "past_due", "canceled"];

export function sortedSubscriptionsByPriority(
  subscriptions: Stripe.Subscription[]
): Stripe.Subscription[] {
  return [...subscriptions].sort((a, b) => {
    const aPriority = STATUS_PRIORITY.indexOf(a.status);
    const bPriority = STATUS_PRIORITY.indexOf(b.status);
    return aPriority - bPriority;
  });
}

/**
 * Build SubscriptionItem array from Stripe subscriptions
 */
export async function buildSubscriptionItems(
  stripe: Stripe,
  subscriptions: Stripe.Subscription[]
): Promise<SubscriptionItem[]> {
  return Promise.all(
    subscriptions.map(async (sub) => {
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
          : undefined,
      };
    })
  );
}

/**
 * Fetch all subscriptions for a customer and update cache
 * Used by both get-subscription-status and stripe-webhook
 */

export async function fetchAndCacheSubscriptions(
  stripe: Stripe,
  customerId: string
): Promise<SubscriptionCache> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
  });

  // No subscriptions
  if (subscriptions.data.length === 0) {
    const cacheData: SubscriptionCache = {
      stripeCustomerId: customerId,
      status: "none",
      subscriptions: [],
      updatedAt: new Date().toISOString(),
      lastSyncedFromStripe: new Date().toISOString(),
    };
    await saveSubscriptionCache(cacheData);
    return cacheData;
  }

  // Sort and build subscription items
  const sortedSubscriptions = sortedSubscriptionsByPriority(subscriptions.data);
  const subscriptionItems = await buildSubscriptionItems(
    stripe,
    sortedSubscriptions
  );

  // Get primary subscription details
  const primarySubscription = sortedSubscriptions[0];
  const primaryProductId = primarySubscription.items.data[0].price
    .product as string;
  const primaryProduct = await stripe.products.retrieve(primaryProductId);

  // Build and save cache
  const cacheData: SubscriptionCache = {
    stripeCustomerId: customerId,
    status: primarySubscription.status,
    planName: primaryProduct.name,
    planId: primaryProductId,
    currentPeriodEnd: new Date(
      primarySubscription.current_period_end * 1000
    ).toISOString(),
    cancelAtPeriodEnd: primarySubscription.cancel_at_period_end,
    subscriptions: subscriptionItems,
    updatedAt: new Date().toISOString(),
    lastSyncedFromStripe: new Date().toISOString(),
  };

  await saveSubscriptionCache(cacheData);
  return cacheData;
}
