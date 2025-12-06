import { Card as MuiCard, CardContent, type CardProps } from "@mui/material";

interface CustomCardProps extends CardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CustomCardProps> = ({ children, ...props }) => {
  return (
    <MuiCard
      elevation={2}
      sx={{ maxWidth: 600, margin: "auto", ...props.sx }}
      {...props}
    >
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
};
