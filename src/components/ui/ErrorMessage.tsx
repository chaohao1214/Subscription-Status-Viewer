import { Alert, AlertTitle } from "@mui/material";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Error",
  message,
  onRetry,
}) => {
  return (
    <Alert
      severity="error"
      action={onRetry && <button onClick={onRetry}>Retry</button>}
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};
