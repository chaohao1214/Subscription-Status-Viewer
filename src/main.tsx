import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./theme.ts";
import { CssBaseline } from "@mui/material";
import { Authenticator } from "@aws-amplify/ui-react";
import "./config/amplify.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Authenticator.Provider>
          <App />
        </Authenticator.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
