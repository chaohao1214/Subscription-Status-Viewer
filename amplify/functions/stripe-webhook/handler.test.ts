import { fetchAndCacheSubscriptions } from "../shared/subscription-utils";
import type Stripe from "stripe";
import { handler } from "./handler";
import * as stripeClient from "../shared/stripe-client";
import * as utils from "../shared/utils";
import type { APIGatewayProxyResult } from "aws-lambda";

jest.mock("../shared/stripe-client");
jest.mock("../shared/utils");
jest.mock("../shared/subscription-utils", () => ({
  fetchAndCacheSubscriptions: jest.fn(),
}));

describe("stripe-webhook Lambda handler", () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn(),
      },
      subscriptions: {
        retrieve: jest.fn(),
      },
    };
    (stripeClient.getStripeClient as jest.Mock).mockReturnValue(mockStripe);
    (utils.validateWebhookSecret as jest.Mock).mockReturnValue(
      "whsec_test_secret"
    );
  });

  test("returns 400 when Stripe signature is missing", async () => {
    const event = { headers: {}, body: "{}" } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("Bad Request");
  });

  test("returns 400 when signature verification fails", async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const event = {
      headers: { "stripe-signature": "invalid_sig" },
      body: "{}",
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("Bad Request");
  });

  test("processes customer.subscription.updated event", async () => {
    const mockEvent: Stripe.Event = {
      id: "evt_test123",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_test123",
          status: "active",
          customer: "cus_test123",
        } as Stripe.Subscription,
      },
    } as any;

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const event = {
      headers: { "stripe-signature": "valid_sig" },
      body: JSON.stringify(mockEvent),
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(fetchAndCacheSubscriptions).toHaveBeenCalledWith(
      mockStripe,
      "cus_test123"
    );
  });

  test("processes customer.subscription.deleted event", async () => {
    const mockEvent: Stripe.Event = {
      id: "evt_test456",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_test456",
          customer: "cus_test456",
          status: "canceled",
        } as Stripe.Subscription,
      },
    } as any;

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const event = {
      headers: { "stripe-signature": "valid_sig" },
      body: JSON.stringify(mockEvent),
    } as any;

    const result = (await handler(
      event,
      {} as any,
      {} as any
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(fetchAndCacheSubscriptions).toHaveBeenCalledWith(
      mockStripe,
      "cus_test456"
    );
  });
});
