import React from "react";
import { Typography, type TypographyProps } from "@mui/material";

interface CposTextProps extends TypographyProps {
  children: React.ReactNode;
}

/**
 * CPOS standardized text component
 * Wrapper around MUI Typography for consistent text styling
 */
export const CposText: React.FC<CposTextProps> = ({ children, ...props }) => {
  return <Typography {...props}>{children}</Typography>;
};
