import React from "react";
import { Alert, AlertTitle, Button } from "@mui/material";

interface CposErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * CPOS error alert component
 * Displays error with optional retry action
 */
export const CposErrorMessage: React.FC<CposErrorMessageProps> = ({
  title = "Error",
  message,
  onRetry,
}) => {
  return (
    <Alert
      severity="error"
      sx={{ borderRadius: 2 }}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            sx={{ textTransform: "none" }}
          >
            Retry
          </Button>
        )
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};
