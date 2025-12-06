import {
  Button as MuiButton,
  type ButtonProps,
  CircularProgress,
} from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
