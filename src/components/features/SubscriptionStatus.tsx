import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import type { SubscriptionData } from "../../types/subscription";
import { formatDate } from "../../utils/utils";

interface SubscriptionStatusProps {
  data: SubscriptionData;
}

/**
 * Status configuration for different subscription states
 * Maps status to display label and color
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
 */
export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  data,
}) => {
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <Box>
      {/* Header with status badge */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Subscription Status
        </Typography>
        <Chip
          label={statusConfig.label}
          color={statusConfig.color}
          size="medium"
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Subscription details (only show if user has subscription) */}
      {data.status !== "none" && (
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Plan name */}
          {data.planName && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Plan
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {data.planName}
              </Typography>
            </Box>
          )}

          {/* Renewal date */}
          {data.renewalDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Next Renewal
              </Typography>
              <Typography variant="body1">
                {formatDate(data.renewalDate)}
              </Typography>
            </Box>
          )}

          {/* Billing cycle */}
          {data.renewalPeriod && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Billing Cycle
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                {data.renewalPeriod}ly
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* No subscription message */}
      {data.status === "none" && (
        <Typography variant="body1" color="text.secondary">
          You don't have an active subscription.
        </Typography>
      )}
    </Box>
  );
};
