import React from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router-dom";
import { CposLoadingSpinner } from "../components/ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  if (authStatus === "configuring") {
    return <CposLoadingSpinner message="Verifying session..." />;
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
