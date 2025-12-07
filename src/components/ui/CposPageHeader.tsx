import React from "react";
import { Box, Typography } from "@mui/material";

interface CposPageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

/**
 * CPOS page header component
 * Consistent page title with optional action buttons
 */
export const CposPageHeader: React.FC<CposPageHeaderProps> = ({
  title,
  actions,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={4}
    >
      <Typography variant="h4" fontWeight={600}>
        {title}
      </Typography>
      {actions && (
        <Box display="flex" gap={2}>
          {actions}
        </Box>
      )}
    </Box>
  );
};
