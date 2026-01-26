import { errorResponse, successResponse } from "../shared/response-utils";
import { getStripeClient } from "../shared/stripe-client";

export const handler = async () => {
  try {
    const stripe = getStripeClient();

    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    return successResponse({ products: products.data });
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch subscription products");
  }
};
