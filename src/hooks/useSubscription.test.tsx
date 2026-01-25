import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("../api/apiEndpoints", () => ({
  getSubscriptionStatus: jest.fn(),
}));

jest.mock("aws-amplify/auth", () => ({
  getCurrentUser: jest.fn(),
}));

import { useSubscription } from "./useSubscription";
import * as apiEndpoints from "../api/apiEndpoints";
import { getCurrentUser } from "aws-amplify/auth";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches subscription data when user is authenticated", async () => {
    (getCurrentUser as any).mockResolvedValue({
      userId: "user-123",
      username: "testuser",
    });

    const mockSubscriptionData = {
      status: "active",
      planName: "Pro Plan",
      renewalDate: "2025-12-31",
      cancelAtPeriodEnd: false,
      subscriptions: [],
    };

    (apiEndpoints.getSubscriptionStatus as any).mockResolvedValue(
      mockSubscriptionData
    );

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSubscriptionData);
    expect(apiEndpoints.getSubscriptionStatus).toHaveBeenCalled();
  });

  test("does not fetch subscription when user is not authenticated", async () => {
    (getCurrentUser as any).mockRejectedValue(new Error("Not authenticated"));

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(apiEndpoints.getSubscriptionStatus).not.toHaveBeenCalled();
  });

  test("handles API errors gracefully", async () => {
    (getCurrentUser as any).mockResolvedValue({
      userId: "user-456",
      username: "testuser",
    });

    const mockError = new Error("Failed to fetch subscription");
    (apiEndpoints.getSubscriptionStatus as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  test("returns loading state initially", async () => {
    (getCurrentUser as any).mockResolvedValue({
      userId: "user-789",
      username: "testuser",
    });

    let resolveSubscription: any;
    const subscriptionPromise = new Promise((resolve) => {
      resolveSubscription = resolve;
    });

    (apiEndpoints.getSubscriptionStatus as any).mockReturnValue(
      subscriptionPromise
    );

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolveSubscription({ status: "active" });
  });
});
