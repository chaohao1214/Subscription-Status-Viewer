import { signOut } from "aws-amplify/auth";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [navigate]);

  return { handleSignOut };
};
