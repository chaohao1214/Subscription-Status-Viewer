import React from "react";
import {
  Button as MuiButton,
  type ButtonProps,
  CircularProgress,
} from "@mui/material";

interface CposButtonProps extends ButtonProps {
  loading?: boolean;
}

/**
 * CPOS standardized button component
 * Extends MUI Button with consistent theming and loading state
 */
export const CposButton: React.FC<CposButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          props.startIcon
        )
      }
      sx={{
        textTransform: "none",
        borderRadius: 2,
        fontWeight: 500,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
