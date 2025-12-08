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
} from "../../components/ui";

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
  const hasMultipleSubscriptions =
    data.subscriptions && data.subscriptions.length > 0;

  // Single subscription or no subscription view
  if (data.status === "none" || !hasMultipleSubscriptions) {
    const statusConfig = STATUS_CONFIG[data.status];

    return (
      <CposCard>
        {/* Header with status badge */}
        <CposBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <CposText variant="h5" fontWeight={600}>
            Subscription Status
          </CposText>
          <CposBadge label={statusConfig.label} color={statusConfig.color} />
        </CposBox>

        <CposDivider sx={{ mb: 3 }} />

        {/* Subscription details */}
        {data.status !== "none" && (
          <CposStack spacing={2}>
            {data.planName && (
              <CposBox>
                <CposText variant="caption" color="text.secondary">
                  Plan
                </CposText>
                <CposText variant="h6" fontWeight={500}>
                  {data.planName}
                </CposText>
              </CposBox>
            )}

            {data.renewalDate && (
              <CposBox>
                <CposText variant="caption" color="text.secondary">
                  Next Renewal
                </CposText>
                <CposText variant="body1">
                  {formatDate(data.renewalDate)}
                </CposText>
              </CposBox>
            )}

            {data.renewalPeriod && (
              <CposBox>
                <CposText variant="caption" color="text.secondary">
                  Billing Cycle
                </CposText>
                <CposText variant="body1" sx={{ textTransform: "capitalize" }}>
                  {data.renewalPeriod}ly
                </CposText>
              </CposBox>
            )}
          </CposStack>
        )}

        {data.status === "none" && (
          <CposText variant="body1" color="text.secondary">
            You don't have an active subscription.
          </CposText>
        )}
      </CposCard>
    );
  }

  // Multiple subscriptions view
  return (
    <CposBox>
      <CposText variant="h5" fontWeight={600} mb={3}>
        Your Subscriptions
      </CposText>
      <CposStack spacing={3}>
        {data.subscriptions!.map((subscription, index) => {
          const statusConfig =
            STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG];

          return (
            <CposCard
              key={subscription.id}
              sx={{
                // Highlight primary subscription with border
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
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="small"
                />
              </CposBox>

              <CposDivider sx={{ mb: 2 }} />

              {/* Subscription details */}
              <CposStack spacing={1.5}>
                <CposBox display="flex" justifyContent="space-between">
                  <CposText variant="body2" color="text.secondary">
                    Next Renewal
                  </CposText>
                  <CposText variant="body2" fontWeight={500}>
                    {subscription.renewalDate
                      ? formatDate(subscription.renewalDate)
                      : "N/A"}
                  </CposText>
                </CposBox>

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
              </CposStack>
            </CposCard>
          );
        })}
      </CposStack>
    </CposBox>
  );
};
