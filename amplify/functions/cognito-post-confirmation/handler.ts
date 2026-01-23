import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { getStripeClient } from "../shared/stripe-client";
import { saveUserStripeMapping } from "../shared/dynamodb-utils";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { log } from "console";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

let cachedTableName: string | null = null;

async function getUserStripeMappingTableName(): Promise<string> {
  if (cachedTableName) {
    return cachedTableName;
  }
  // Find table that starts with UserStripeMapping-
  const result = await dynamoClient.send(new ListTablesCommand({}));
  const tableName = result.TableNames?.find((name) =>
    name.startsWith("UserStripeMapping-")
  );

  if (!tableName) {
    throw new Error("UserStripeMapping table not found");
  }
  cachedTableName = tableName;
  console.log("Found table:", tableName);
  return tableName;
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userAttributes } = event.request;
  const email = userAttributes.email;
  const userId = event.userName; // Cognito userName is sub (user ID)

  console.log("Post-confirmation trigger started", { userId, email });

  try {
    const stripe = getStripeClient();

    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        cognitoUserId: userId,
      },
    });
    console.log("Stripe customer created", {
      customerId: customer.id,
      userId,
      email,
    });

    const tableName = await getUserStripeMappingTableName();

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          userId: userId,
          stripeCustomerId: customer.id,
          email: email,
          createdAt: new Date().toISOString(),
        },
      })
    );
    console.log("User-Stripe mapping saved successfully", {
      userId,
      stripeCustomerId: customer.id,
      tableName,
    });
  } catch (error) {
    console.error("Error in post-confirmation trigger:", error);
  }
  return event;
};
