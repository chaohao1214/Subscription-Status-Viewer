import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "aws-amplify/auth";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useSignOut = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      queryClient.clear(); // Clear all React Query cache on sign out
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [navigate, queryClient]);

  return { handleSignOut };
};
