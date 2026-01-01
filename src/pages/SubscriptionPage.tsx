import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBillingPortalSession } from "../api/apiEndpoints";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposErrorMessage,
  CposLoadingSpinner,
  CposPageHeader,
} from "../components/ui";
import { SubscriptionStatus } from "../components/views/SubscriptionStatus";
import { useSignOut } from "../hooks/useSignOut";
import * as amplitude from "@amplitude/unified";
import { useSubscription } from "../hooks/useSubscription";
/**
 * Subscription management page
 * Displays current subscription status and provides access to Stripe Billing Portal
 */
const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSignOut } = useSignOut();
  const { data: subscription, isLoading, error, refetch } = useSubscription();

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  useEffect(() => {
    amplitude.track("Subscription Page Viewed");
  }, []);
  /**
   * Fetch subscription data from backend with cache
   */

  useEffect(() => {
    if (subscription) {
      amplitude.track("Subscription Data Fetched", {
        status: subscription.status,
        subscriptionCount: subscription.subscriptions?.length || 0,
      });
    }
  }, [subscription]);

  const handleManageBilling = async () => {
    amplitude.track("Manage Billing Clicked");
    try {
      setPortalLoading(true);
      const returnUrl = window.location.href;
      const { url } = await createBillingPortalSession(returnUrl);
      window.location.href = url;
    } catch (error) {
      setPortalError(
        error instanceof Error ? error.message : "Failed to open billing portal"
      );
      setPortalLoading(false);
    }
  };

  return (
    <CposContainer>
      <CposPageHeader
        title="Subscription"
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
      <CposCard>
        {isLoading && <CposLoadingSpinner message="Loading subscription..." />}
        {error && (
          <CposErrorMessage
            message={
              error instanceof Error
                ? error.message
                : "Failed to load subscription"
            }
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && subscription && (
          <>
            {" "}
            <SubscriptionStatus data={subscription} />
            {portalError && (
              <CposErrorMessage
                message={portalError}
                onRetry={handleManageBilling}
              />
            )}
            {subscription.status !== "none" && (
              <CposButton
                variant="contained"
                fullWidth
                loading={portalLoading}
                onClick={handleManageBilling}
                sx={{ mt: 4 }}
              >
                Manage Billing
              </CposButton>
            )}
          </>
        )}
      </CposCard>
    </CposContainer>
  );
};

export default SubscriptionPage;
