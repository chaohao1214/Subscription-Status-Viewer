import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "../api/apiEndpoints";
import { getCurrentUser } from "aws-amplify/auth";

export const useSubscription = () => {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        return user;
      } catch (error) {}
    },
    staleTime: Infinity,
  });
  return useQuery({
    queryKey: ["subscription", user?.userId], // Add userId to prevent cache collision
    queryFn: getSubscriptionStatus,
    enabled: !!user?.userId, // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
