import React from "react";
import { Container, type ContainerProps } from "@mui/material";

interface CposContainerProps extends ContainerProps {
  children: React.ReactNode;
}

/**
 * CPOS page container
 * Consistent max width and padding
 */
export const CposContainer: React.FC<CposContainerProps> = ({
  children,
  ...props
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 4, ...props.sx }} {...props}>
      {children}
    </Container>
  );
};
