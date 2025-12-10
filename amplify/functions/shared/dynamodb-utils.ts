import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

// Table names from environment variables
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
// UserStripeMapping operations
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
        Key: marshall({ userId }),
      })
    );

    if (!result.Item) {
      return null;
    }

    return unmarshall(result.Item) as UserStripeMapping;
  } catch (error) {
    console.error("Error getting user stripe mapping:", error);
    throw error;
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
// SubscriptionCache operations
// ============================================

export interface SubscriptionCache {
  stripeCustomerId: string;
  status: string;
  planName?: string;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
  lastSyncedFromStripe?: string;
}

export async function getSubscriptionCache(
  stripeCustomerId: string
): Promise<SubscriptionCache | null> {
  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: getSubscriptionCacheTableName(),
        Key: marshall({ stripeCustomerId }),
      })
    );

    if (!result.Item) {
      return null;
    }

    return unmarshall(result.Item) as SubscriptionCache;
  } catch (error) {
    console.error("Error getting subscription cache:", error);
    throw error;
  }
}

export async function saveSubscriptionCache(
  cache: SubscriptionCache
): Promise<void> {
  try {
    await client.send(
      new PutItemCommand({
        TableName: getSubscriptionCacheTableName(),
        Item: marshall({
          ...cache,
          updatedAt: new Date().toISOString(),
        }),
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
