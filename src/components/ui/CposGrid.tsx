import React from "react";
import { Grid, type GridProps } from "@mui/material";

interface CposGridProps extends GridProps {
  children: React.ReactNode;
}

/**
 * CPOS grid component
 * Wrapper around MUI Grid for consistent responsive layouts
 */
export const CposGrid: React.FC<CposGridProps> = ({ children, ...props }) => {
  return <Grid {...props}>{children}</Grid>;
};
