export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export function successResponse(data: any, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export function errorResponse(
  error: string,
  message?: string,
  statusCode = 500
) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error,
      message: message || error,
    }),
  };
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", "Authentication required", 401);
}

export function badRequestResponse(message: string) {
  return errorResponse("Bad Request", message, 400);
}
