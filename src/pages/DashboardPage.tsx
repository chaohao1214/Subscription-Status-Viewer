import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import {
  CposButton,
  CposCard,
  CposContainer,
  CposPageHeader,
} from "../components/ui";
import { Button, Typography } from "@mui/material";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <CposContainer>
      <CposPageHeader
        title="Dashboard"
        actions={
          <Button variant="outlined" onClick={handleSignOut}>
            Sign Out
          </Button>
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
