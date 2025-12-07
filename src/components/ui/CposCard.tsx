import React from "react";
import { Card, CardContent, type CardProps } from "@mui/material";

interface CposCardProps extends CardProps {
  children: React.ReactNode;
}

/**
 * CPOS standardized card component
 * Consistent elevation, spacing, and rounded corners
 */
export const CposCard: React.FC<CposCardProps> = ({ children, ...props }) => {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        maxWidth: 600,
        margin: "auto",
        ...props.sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
};
