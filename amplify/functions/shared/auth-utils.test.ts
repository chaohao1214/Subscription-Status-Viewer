import { validateAuthentication, getUserIdFromEvent } from "./auth-utils";
import type { APIGatewayProxyEvent } from "aws-lambda";

describe("auth-utils", () => {
  describe("getUserIdFromEvent", () => {
    test("returns userId from valid event", () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      } as any;

      const userId = getUserIdFromEvent(event);
      expect(userId).toBe("123e4567-e89b-12d3-a456-426614174000");
    });

    test("returns null when authorizer is missing", () => {
      const event = {
        requestContext: {},
      } as any;

      const userId = getUserIdFromEvent(event);
      expect(userId).toBeNull();
    });

    test("returns null when claims are missing", () => {
      const event = {
        requestContext: {
          authorizer: {},
        },
      } as any;

      const userId = getUserIdFromEvent(event);
      expect(userId).toBeNull();
    });
  });

  describe("validateAuthentication", () => {
    test("returns userId when valid UUID is provided", () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      } as any;

      const userId = validateAuthentication(event);
      expect(userId).toBe("123e4567-e89b-12d3-a456-426614174000");
    });

    test("throws error when userId is missing", () => {
      const event = {
        requestContext: {},
      } as any;

      expect(() => validateAuthentication(event)).toThrow(
        "User not authenticated"
      );
    });

    test("throws error when userId is not a valid UUID", () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: "invalid-user-id",
            },
          },
        },
      } as any;

      expect(() => validateAuthentication(event)).toThrow(
        "User not authenticated"
      );
    });

    test("throws error when userId is empty string", () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: "",
            },
          },
        },
      } as any;

      expect(() => validateAuthentication(event)).toThrow(
        "User not authenticated"
      );
    });
  });
});
