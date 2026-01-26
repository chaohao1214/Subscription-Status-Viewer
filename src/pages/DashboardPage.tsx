import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposPageHeader,
  CposStack,
} from "../components/ui";
import { Typography } from "@mui/material";
import { useSignOut } from "../hooks/useSignOut";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { handleSignOut } = useSignOut();

  return (
    <CposContainer>
      <CposPageHeader
        title="Dashboard"
        actions={
          <CposButton variant="outlined" onClick={handleSignOut}>
            Sign Out
          </CposButton>
        }
      />
      <CposCard>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome!
        </Typography>{" "}
        <Typography variant="body1" color="text.secondary">
          Manage your subscription and billing information.
        </Typography>
        <CposStack spacing={2}>
          <CposButton
            variant="contained"
            onClick={() => navigate("/subscription")}
            fullWidth
          >
            View Subscription
          </CposButton>
          <CposButton
            variant="outlined"
            onClick={() => navigate("/plans")}
            fullWidth
          >
            View Plans
          </CposButton>
        </CposStack>
      </CposCard>
    </CposContainer>
  );
};

export default DashboardPage;
