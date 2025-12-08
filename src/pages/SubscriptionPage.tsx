import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type SubscriptionData } from "../types/subscription";
import {
  createBillingPortalSession,
  getSubscriptionStatus,
} from "../api/apiEndpoints";
import { signOut } from "aws-amplify/auth";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposErrorMessage,
  CposLoadingSpinner,
  CposPageHeader,
} from "../components/ui";
import { Button } from "@mui/material";
import { SubscriptionStatus } from "../components/features/SubscriptionStatus";

/**
 * Subscription management page
 * Displays current subscription status and provides access to Stripe Billing Portal
 */
const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [portalLoading, setPortalLoading] = useState(false);

  /**
   * Fetch subscription data from backend
   */

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptionStatus();
      setSubscription(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const returnUrl = window.location.href;
      const { url } = await createBillingPortalSession(returnUrl);
      window.location.href = url;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to open billing portal"
      );
      setPortalLoading(false);
    }
  };

  const handleSighOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <CposContainer>
      <CposPageHeader
        title="Subscription"
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
            <Button variant="outlined" onClick={handleSighOut}>
              Sign Out
            </Button>
          </>
        }
      />
      <CposCard>
        {loading && <CposLoadingSpinner message="Loading subscription..." />}
        {error && (
          <CposErrorMessage message={error} onRetry={fetchSubscription} />
        )}
        {!loading && !error && subscription && (
          <>
            {" "}
            <SubscriptionStatus data={subscription} />
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
