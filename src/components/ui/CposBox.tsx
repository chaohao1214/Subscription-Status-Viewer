import React from "react";
import { Box, type BoxProps } from "@mui/material";

interface CposBoxProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * CPOS standardized box component
 * Wrapper around MUI Box for consistent spacing and layout
 */
export const CposBox: React.FC<CposBoxProps> = ({ children, ...props }) => {
  return <Box {...props}>{children}</Box>;
};
