import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { getStripeClient, getCustomerId } from "./stripe-client";

// @ts-ignore
const dynamoMock = mockClient(DynamoDBClient);

describe("stripe-client", () => {
  beforeEach(() => {
    dynamoMock.reset();
    process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
    process.env.USER_STRIPE_MAPPING_TABLE = "test-mapping-table";
  });

  describe("getStripeClient", () => {
    test("returns Stripe client with correct configuration", () => {
      const stripe = getStripeClient();

      expect(stripe).toBeDefined();
      expect(stripe.customers).toBeDefined();
      expect(stripe.subscriptions).toBeDefined();
    });

    test("throws error when STRIPE_SECRET_KEY is not set", () => {
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => getStripeClient()).toThrow(
        "STRIPE_SECRET_KEY environment variable is not set"
      );
    });
  });

  describe("getCustomerId", () => {
    test("returns customerId from DynamoDB mapping", async () => {
      // @ts-ignore
      dynamoMock.on(GetItemCommand).resolves({
        // @ts-ignore
        Item: {
          userId: { S: "user-123" },
          stripeCustomerId: { S: "cus_test123" },
        },
      });

      const customerId = await getCustomerId("user-123");
      expect(customerId).toBe("cus_test123");
    });

    test("throws error when USER_STRIPE_MAPPING_TABLE is not set", async () => {
      delete process.env.USER_STRIPE_MAPPING_TABLE;

      await expect(getCustomerId("user-123")).rejects.toThrow(
        "USER_STRIPE_MAPPING_TABLE environment variable is not set"
      );
    });

    test("throws error when no mapping found in DynamoDB", async () => {
      // @ts-ignore
      dynamoMock.on(GetItemCommand).resolves({});

      await expect(getCustomerId("user-456")).rejects.toThrow(
        "No Stripe customer mapping found for user: user-456"
      );
    });

    test("throws error when DynamoDB query fails", async () => {
      // @ts-ignore
      dynamoMock.on(GetItemCommand).rejects(new Error("DynamoDB error"));

      await expect(getCustomerId("user-789")).rejects.toThrow(
        "Failed to fetch customer mapping for user: user-789"
      );
    });
  });
});
