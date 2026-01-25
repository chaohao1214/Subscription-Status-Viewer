import type { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "./handler";
import * as authUtils from "../shared/auth-utils";
import * as stripeClient from "../shared/stripe-client";

jest.mock("../shared/dynamodb-utils", () => ({
  getSubscriptionCache: jest.fn(),
  isCacheFresh: jest.fn(),
}));

jest.mock("../shared/subscription-utils", () => ({
  fetchAndCacheSubscriptions: jest.fn(),
}));

jest.mock("../shared/auth-utils");
jest.mock("../shared/stripe-client");

import { getSubscriptionCache, isCacheFresh } from "../shared/dynamodb-utils";
import { fetchAndCacheSubscriptions } from "../shared/subscription-utils";

describe("get-subscription Lambda handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns cached subscription when cache is fresh", async () => {
    (authUtils.validateAuthentication as jest.Mock).mockReturnValue("user-123");
    (stripeClient.getCustomerId as jest.Mock).mockResolvedValue("cus_test123");
    (stripeClient.getStripeClient as jest.Mock).mockReturnValue({});

    const mockCacheData = {
      stripeCustomerId: "cus_test123",
      status: "active",
      planName: "Pro Plan",
      currentPeriodEnd: "1735689600",
      cancelAtPeriodEnd: false,
      subscriptions: [],
      updatedAt: new Date().toISOString(),
    };

    (getSubscriptionCache as jest.Mock).mockResolvedValue(mockCacheData);
    (isCacheFresh as jest.Mock).mockReturnValue(true);

    const event = {
      headers: { Authorization: "Bearer valid-token" },
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
    (authUtils.validateAuthentication as jest.Mock).mockReturnValue("user-123");
    (stripeClient.getCustomerId as jest.Mock).mockResolvedValue("cus_test123");
    (stripeClient.getStripeClient as jest.Mock).mockReturnValue({});

    (getSubscriptionCache as jest.Mock).mockResolvedValue(null);
    (isCacheFresh as jest.Mock).mockReturnValue(false);

    (fetchAndCacheSubscriptions as jest.Mock).mockResolvedValue({
      status: "active",
      planName: "Enterprise Plan",
      currentPeriodEnd: "1735689600",
      cancelAtPeriodEnd: false,
      subscriptions: [],
    });

    const event = {
      headers: { Authorization: "Bearer valid-token" },
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe("active");
    expect(body.fromCache).toBe(false);
  });

  test("returns 401 when user is not authenticated", async () => {
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
