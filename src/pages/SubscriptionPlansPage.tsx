import type React from "react";
import { useNavigate } from "react-router-dom";
import { useSignOut } from "../hooks/useSignOut";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { useEffect, useState } from "react";
import * as amplitude from "@amplitude/unified";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposErrorMessage,
  CposGrid,
  CposLoadingSpinner,
  CposPageHeader,
  CposText,
} from "../components/ui";
import type { StripeProduct } from "../types/subscription";
import { formatPrice } from "../utils/utils";
import { createCheckoutSession } from "../api/apiEndpoints";
const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSignOut } = useSignOut();
  const { data, isLoading, error, refetch } = useSubscriptionPlans();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    amplitude.track("Subscription Plans Page Viewed");
  }, []);

  const handleSubscribe = async (priceId: string, planName: string) => {
    amplitude.track("Subscribe Button Clicked", { priceId, planName });
    try {
      setCheckoutLoading(priceId);
      const successUrl = `${window.location.origin}/subscription?success=true`;
      const cancelUrl = `${window.location.origin}/plans?canceled=true`;

      const { url } = await createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl
      );

      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setCheckoutLoading(null);
    }
  };

  return (
    <CposContainer>
      <CposPageHeader
        title="Choose Your Plan"
        actions={
          <>
            <CposButton
              variant="outlined"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </CposButton>
            <CposButton variant="outlined" onClick={handleSignOut}>
              Sign Out
            </CposButton>
          </>
        }
      />

      {isLoading && <CposLoadingSpinner message="Loading plans..." />}

      {error && (
        <CposErrorMessage
          message={
            error instanceof Error ? error.message : "Failed to load plans"
          }
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !error && data && (
        <CposGrid container spacing={3}>
          {data.products.map((product: StripeProduct) => (
            <CposGrid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <CposCard sx={{ height: "100%" }}>
                <CposText variant="h5" fontWeight={600} gutterBottom>
                  {product.name}
                </CposText>

                {product.description && (
                  <CposText
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {product.description}
                  </CposText>
                )}

                <CposText variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  {formatPrice(
                    product.default_price.unit_amount,
                    product.default_price.currency
                  )}
                </CposText>

                <CposText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  per {product.default_price.recurring.interval}
                </CposText>

                <CposButton
                  variant="contained"
                  fullWidth
                  loading={checkoutLoading === product.default_price.id}
                  onClick={() =>
                    handleSubscribe(product.default_price.id, product.name)
                  }
                >
                  Subscribe
                </CposButton>
              </CposCard>
            </CposGrid>
          ))}
        </CposGrid>
      )}
    </CposContainer>
  );
};

export default SubscriptionPlansPage;
