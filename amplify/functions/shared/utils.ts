/**
 * Validate webhook secret configuration
 * @throws Error if secret is invalid
 */
export function validateWebhookSecret(secret: string | undefined): string {
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  if (secret === "whsec_placeholder") {
    throw new Error("Using placeholder webhook secret");
  }

  return secret;
}
