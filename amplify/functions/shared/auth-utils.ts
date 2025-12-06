import type { APIGatewayProxyEvent } from "aws-lambda";

export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  return event.requestContext?.authorizer?.claims?.sub || null;
}

export function validateAuthentication(event: APIGatewayProxyEvent): string {
  const userId = getUserIdFromEvent(event);

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}
