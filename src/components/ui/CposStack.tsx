import React from "react";
import { Stack, type StackProps } from "@mui/material";

interface CposStackProps extends StackProps {
  children: React.ReactNode;
}

/**
 * CPOS stack component
 * Wrapper around MUI Stack for consistent spacing in vertical/horizontal layouts
 */
export const CposStack: React.FC<CposStackProps> = ({ children, ...props }) => {
  return <Stack {...props}>{children}</Stack>;
};
