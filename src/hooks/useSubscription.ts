import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "../api/apiEndpoints";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
