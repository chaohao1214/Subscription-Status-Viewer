import React from "react";
import { Divider, type DividerProps } from "@mui/material";

/**
 * CPOS standardized divider component
 * Consistent divider styling across the app
 */
export const CposDivider: React.FC<DividerProps> = (props) => {
  return <Divider {...props} />;
};
