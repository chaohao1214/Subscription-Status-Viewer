import React from "react";
import type { SubscriptionData } from "../../types/subscription";
import { formatDate } from "../../utils/utils";
import {
  CposCard,
  CposBox,
  CposText,
  CposDivider,
  CposBadge,
  CposStack,
} from "../ui";

interface SubscriptionStatusProps {
  data: SubscriptionData;
}

/**
 * Status configuration for different subscription states
 */
const STATUS_CONFIG = {
  active: { label: "Active", color: "success" as const },
  trialing: { label: "Trial", color: "info" as const },
  past_due: { label: "Past Due", color: "warning" as const },
  canceled: { label: "Canceled", color: "error" as const },
  none: { label: "No Subscription", color: "default" as const },
};

/**
 * Subscription status display component
 * Shows plan details, renewal date, and billing cycle
 * Uses only Cpos components for consistency
 */
export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  data,
}) => {
  // No subscription
  if (data.status === "none" || !data.subscriptions?.length) {
    return (
      <CposCard>
        <CposBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <CposText variant="h5" fontWeight={600}>
            Subscription Status
          </CposText>
          <CposBadge
            label={STATUS_CONFIG.none.label}
            color={STATUS_CONFIG.none.color}
          />
        </CposBox>
        <CposDivider sx={{ mb: 3 }} />
        <CposText variant="body1" color="text.secondary">
          You don't have an active subscription.
        </CposText>
      </CposCard>
    );
  }

  // Has subscriptions
  return (
    <CposBox>
      <CposText variant="h5" fontWeight={600} mb={3}>
        Your Subscriptions
      </CposText>
      <CposStack spacing={3}>
        {data.subscriptions.map((subscription, index) => {
          const statusConfig =
            STATUS_CONFIG[subscription.status] || STATUS_CONFIG.none;
          const isCanceling = subscription.cancelAtPeriodEnd;

          return (
            <CposCard
              key={subscription.id}
              sx={{
                ...(index === 0 && {
                  border: 2,
                  borderColor: "primary.main",
                }),
              }}
            >
              <CposBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <CposBox display="flex" alignItems="center" gap={1}>
                  <CposText variant="h6" fontWeight={600}>
                    {subscription.planName}
                  </CposText>
                  {index === 0 && (
                    <CposBadge
                      label="Primary"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </CposBox>
                <CposBadge
                  label={isCanceling ? "Canceling" : statusConfig.label}
                  color={isCanceling ? "warning" : statusConfig.color}
                  size="small"
                />
              </CposBox>

              {/* Cancellation warning */}
              {isCanceling && (
                <CposBox
                  sx={{
                    backgroundColor: "warning.light",
                    borderRadius: 1,
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  <CposText variant="body2" color="warning.dark">
                    ⚠️ Cancels on {formatDate(subscription.renewalDate)}
                  </CposText>
                </CposBox>
              )}

              <CposDivider sx={{ mb: 2 }} />

              <CposStack spacing={1.5}>
                <CposBox display="flex" justifyContent="space-between">
                  <CposText variant="body2" color="text.secondary">
                    {isCanceling ? "Cancels On" : "Next Renewal"}
                  </CposText>
                  <CposText variant="body2" fontWeight={500}>
                    {formatDate(subscription.renewalDate)}
                  </CposText>
                </CposBox>

                {!isCanceling && (
                  <CposBox display="flex" justifyContent="space-between">
                    <CposText variant="body2" color="text.secondary">
                      Billing Cycle
                    </CposText>
                    <CposText
                      variant="body2"
                      fontWeight={500}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {subscription.renewalPeriod}ly
                    </CposText>
                  </CposBox>
                )}
              </CposStack>
            </CposCard>
          );
        })}
      </CposStack>
    </CposBox>
  );
};
