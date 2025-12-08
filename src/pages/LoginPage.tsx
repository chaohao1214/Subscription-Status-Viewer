import React, { useEffect } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Subscription Status Viewer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to manage your subscription
        </Typography>
      </Box>
      <Authenticator />
    </Box>
  );
};

export default LoginPage;
