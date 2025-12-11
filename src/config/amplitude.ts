import * as amplitude from "@amplitude/unified";

export const initAnalytics = () => {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

  if (!apiKey) {
    console.warn("Amplitude API key not found. Analytics disabled.");
    return;
  }

  amplitude.initAll(apiKey);
};
