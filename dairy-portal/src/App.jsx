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
import UsersManagement from "./pages/UsersManagement";
import BatchTraceability from "./pages/BatchTraceability";
import { canAccessModule } from "./auth/roleAccess";

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

function RoleGate({ children, module }) {
  const { user } = useAuth();

  return canAccessModule(user?.role, module)
    ? children
    : <Navigate to="/dashboard" replace />;
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
                  <RoleGate module="dashboard">
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/milk-reception"
              element={
                <SessionGate>
                  <RoleGate module="milk-reception">
                    <DashboardLayout>
                      <MilkReception />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/quality-testing"
              element={
                <SessionGate>
                  <RoleGate module="quality-testing">
                    <DashboardLayout>
                      <QualityTesting />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/raw-milk-storage"
              element={
                <SessionGate>
                  <RoleGate module="raw-milk-storage">
                    <DashboardLayout>
                      <RawMilkStorage />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/processing"
              element={
                <SessionGate>
                  <RoleGate module="processing">
                    <DashboardLayout>
                      <MilkProcessing />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/inventory"
              element={
                <SessionGate>
                  <RoleGate module="inventory">
                    <DashboardLayout>
                      <InventoryManagement />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/dispatch"
              element={
                <SessionGate>
                  <RoleGate module="dispatch">
                    <DashboardLayout>
                      <DispatchManagement />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/traceability"
              element={
                <SessionGate>
                  <RoleGate module="traceability">
                    <DashboardLayout>
                      <BatchTraceability />
                    </DashboardLayout>
                  </RoleGate>
                </SessionGate>
              }
            />

            <Route
              path="/users"
              element={
                <SessionGate>
                  <RoleGate module="users">
                    <DashboardLayout>
                      <UsersManagement />
                    </DashboardLayout>
                  </RoleGate>
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