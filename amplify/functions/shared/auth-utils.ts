import type { APIGatewayProxyEvent } from "aws-lambda";

/**
 * Extract user ID from API Gateway authorizer claims
 * This assumes Cognito User Pool authorizer is properly configured
 */

export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  return event.requestContext?.authorizer?.claims?.sub || null;
}

/**
 * Validate authentication and return userId
 * Throws error if user is not authenticated
 *
 * @throws Error with message "User not authenticated" if validation fails
 */
export function validateAuthentication(event: APIGatewayProxyEvent): string {
  const userId = getUserIdFromEvent(event);

  if (!userId) {
    console.error("Authentication failed: No user ID found in request context");
    throw new Error("User not authenticated");
  }

  if (!isValidUserId(userId)) {
    console.error("Authentication failed: Invalid user ID format", { userId });
    throw new Error("User not authenticated");
  }
  return userId;
}

function isValidUserId(userId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}
