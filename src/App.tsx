import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CposLoadingSpinner } from "./components/ui";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<CposLoadingSpinner message="Loading page..." />}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
