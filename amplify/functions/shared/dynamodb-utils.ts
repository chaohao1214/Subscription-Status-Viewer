import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

const getUserStripeMappingTableName = () => {
  const tableName = process.env.USER_STRIPE_MAPPING_TABLE;
  if (!tableName) {
    throw new Error("USER_STRIPE_MAPPING_TABLE environment variable not set");
  }
  return tableName;
};

const getSubscriptionCacheTableName = () => {
  const tableName = process.env.SUBSCRIPTION_CACHE_TABLE;
  if (!tableName) {
    throw new Error("SUBSCRIPTION_CACHE_TABLE environment variable not set");
  }
  return tableName;
};

// ============================================
// UserStripeMapping
// ============================================

export interface UserStripeMapping {
  userId: string;
  stripeCustomerId: string;
  email?: string;
  createdAt?: string;
}

export async function getUserStripeMapping(
  userId: string
): Promise<UserStripeMapping | null> {
  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: getUserStripeMappingTableName(),
        Key: marshall({ userId: userId }),
      })
    );

    if (!result.Item) {
      return null;
    }

    return unmarshall(result.Item) as UserStripeMapping;
  } catch (error) {
    console.error("Error getting user stripe mapping:", error);
    return null;
  }
}

export async function saveUserStripeMapping(
  mapping: UserStripeMapping
): Promise<void> {
  try {
    await client.send(
      new PutItemCommand({
        TableName: getUserStripeMappingTableName(),
        Item: marshall({
          ...mapping,
          createdAt: mapping.createdAt || new Date().toISOString(),
        }),
      })
    );
  } catch (error) {
    console.error("Error saving user stripe mapping:", error);
    throw error;
  }
}

// ============================================
// SubscriptionCache
// ============================================

export interface SubscriptionItem {
  id: string;
  status: string;
  planName: string;
  renewalDate: string;
  renewalPeriod: string;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string;
}

export interface SubscriptionCache {
  stripeCustomerId: string;
  status: string;
  planName?: string;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  subscriptions?: SubscriptionItem[];
  updatedAt?: string;
  lastSyncedFromStripe?: string;
}

export async function getSubscriptionCache(
  stripeCustomerId: string
): Promise<SubscriptionCache | null> {
  try {
    const tableName = getSubscriptionCacheTableName();
    console.log("Getting subscription cache:", { tableName, stripeCustomerId });

    const result = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: marshall({ stripeCustomerId: stripeCustomerId }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const data = unmarshall(result.Item) as any;

    // Parse subscriptions from JSON string
    let subscriptions: SubscriptionItem[] | undefined;
    if (data.subscriptionsJson) {
      try {
        subscriptions = JSON.parse(data.subscriptionsJson);
      } catch {
        console.error("Failed to parse subscriptionsJson");
      }
    }

    return {
      ...data,
      subscriptions,
    } as SubscriptionCache;
  } catch (error) {
    console.error("Error getting subscription cache:", error);
    return null;
  }
}

export async function saveSubscriptionCache(
  cache: SubscriptionCache
): Promise<void> {
  try {
    // Convert subscriptions array to JSON string for storage
    const subscriptionsJson = cache.subscriptions
      ? JSON.stringify(cache.subscriptions)
      : undefined;

    await client.send(
      new PutItemCommand({
        TableName: getSubscriptionCacheTableName(),
        Item: marshall(
          {
            stripeCustomerId: cache.stripeCustomerId,
            status: cache.status,
            planName: cache.planName,
            planId: cache.planId,
            currentPeriodEnd: cache.currentPeriodEnd,
            cancelAtPeriodEnd: cache.cancelAtPeriodEnd,
            subscriptionsJson,
            updatedAt: new Date().toISOString(),
            lastSyncedFromStripe: cache.lastSyncedFromStripe,
          },
          { removeUndefinedValues: true }
        ),
      })
    );
    console.log("Subscription cache saved:", cache.stripeCustomerId);
  } catch (error) {
    console.error("Error saving subscription cache:", error);
    throw error;
  }
}

// ============================================
// Cache freshness check
// ============================================

const CACHE_TTL_MINUTES = 5;

export function isCacheFresh(cache: SubscriptionCache | null): boolean {
  if (!cache || !cache.updatedAt) {
    return false;
  }

  const cacheTime = new Date(cache.updatedAt).getTime();
  const now = Date.now();
  const ageMinutes = (now - cacheTime) / (1000 * 60);

  return ageMinutes < CACHE_TTL_MINUTES;
}
