/**
 * Format ISO date string to readable format
 * @param dateString - ISO date string (e.g., "2026-01-06T16:24:54.000Z")
 * @returns Formatted date string (e.g., "January 6, 2026")
 */

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format price in cents to currency string
 * @param amount - Price in cents
 * @param currency - Currency code (e.g., 'cad', 'usd')
 * @returns Formatted price string (e.g., '$29.00')
 */

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
