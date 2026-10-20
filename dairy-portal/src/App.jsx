import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

import { AuthProvider } from "./context/AuthContext";
import useAuth from "./context/useAuth";
import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MilkReception from "./pages/MilkReception";
import QualityTesting from "./pages/QualityTesting";
import RawMilkStorage from "./pages/RawMilkStorage";
import MilkProcessing from "./pages/MilkProcessing";
import InventoryManagement from "./pages/InventoryManagement";
import DispatchManagement from "./pages/DispatchManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SessionGate({ children, guestOnly = false }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (guestOnly && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!guestOnly && !user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication routes */}
            <Route
              path="/"
              element={
                <SessionGate guestOnly>
                  <Login />
                </SessionGate>
              }
            />
            <Route
              path="/signup"
              element={
                <SessionGate guestOnly>
                  <Signup />
                </SessionGate>
              }
            />

            {/* Dashboard & Operational Stages with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/milk-reception"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <MilkReception />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/quality-testing"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <QualityTesting />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/raw-milk-storage"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <RawMilkStorage />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/processing"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <MilkProcessing />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/inventory"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <InventoryManagement />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            <Route
              path="/dispatch"
              element={
                <SessionGate>
                  <DashboardLayout>
                    <DispatchManagement />
                  </DashboardLayout>
                </SessionGate>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;