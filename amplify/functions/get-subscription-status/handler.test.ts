import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import * as authUtils from "../shared/auth-utils";
import * as stripeClient from "../shared/stripe-client";
import * as dynamodbUtils from "../shared/dynamodb-utils";
import { Authorization } from "aws-cdk-lib/aws-events";
import { handler } from "./handler";
// @ts-ignore
const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock("../shared/auth-utils");
jest.mock("../shared/stripe-client");

describe("get-subscription Lambda", () => {
  //reset each test
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
  });

  test("returns cached subscription when cache is fresh", async () => {
    (authUtils.validateAuthentication as jest.Mock).mockReturnValue("user-123");

    (stripeClient.getCustomerId as jest.Mock).mockReturnValue("cus_test123");
    (stripeClient.getStripeClient as jest.Mock).mockReturnValue({});

    const mockCacheData = {
      stripeCustomerId: "cus_test123",
      status: "active",
      planName: "Pro Plan",
      currentPeriodEnd: "1735689600",
      cancelAtPeriodEnd: false,
      subscriptions: [],
      ttl: Math.floor(Date.now() / 1000) + 3600,
    };

    jest
      .spyOn(dynamodbUtils, "getSubscriptionCache")
      .mockResolvedValue(mockCacheData);
    jest.spyOn(dynamodbUtils, "isCacheFresh").mockReturnValue(true);

    const event = {
      header: { Authorization: "Bearer valid-token" },
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe("active");
    expect(body.planName).toBe("Pro Plan");
    expect(body.fromCache).toBe(true);
  });

  test("fetches from Stripe when cache is stale", async () => {
    // Mock authentication
    (authUtils.validateAuthentication as jest.Mock).mockReturnValue("user-123");

    // Mock Stripe customer ID
    (stripeClient.getCustomerId as jest.Mock).mockResolvedValue("cus_test123");
    (stripeClient.getStripeClient as jest.Mock).mockReturnValue({});

    // Mock stale cache
    jest.spyOn(dynamodbUtils, "getSubscriptionCache").mockResolvedValue(null);
    jest.spyOn(dynamodbUtils, "isCacheFresh").mockReturnValue(false);

    // Mock fetchAndCacheSubscriptions (need to mock this module too)
    const subscriptionUtils = require("../shared/subscription-utils");
    jest
      .spyOn(subscriptionUtils, "fetchAndCacheSubscriptions")
      .mockResolvedValue({
        status: "active",
        planName: "Enterprise Plan",
        currentPeriodEnd: 1735689600,
        cancelAtPeriodEnd: false,
        subscriptions: [],
      });

    // Execute handler
    const event = {
      headers: { Authorization: "Bearer valid-token" },
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    // Verify response
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe("active");
    expect(body.fromCache).toBe(false);
  });

  test("returns 401 when user is not authenticated", async () => {
    // Mock authentication failure
    (authUtils.validateAuthentication as jest.Mock).mockImplementation(() => {
      throw new Error("User not authenticated");
    });

    const event = {
      headers: {},
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(401);
  });
});
