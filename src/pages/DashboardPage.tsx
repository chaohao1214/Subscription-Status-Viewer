import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposPageHeader,
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
        <CposButton
          variant="contained"
          onClick={() => navigate("/subscription")}
          fullWidth
        >
          View Subscription
        </CposButton>
      </CposCard>
    </CposContainer>
  );
};

export default DashboardPage;
