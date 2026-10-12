import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext";
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard & Operational Stages with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />

            <Route
              path="/milk-reception"
              element={
                <DashboardLayout>
                  <MilkReception />
                </DashboardLayout>
              }
            />

            <Route
              path="/quality-testing"
              element={
                <DashboardLayout>
                  <QualityTesting />
                </DashboardLayout>
              }
            />

            <Route
              path="/raw-milk-storage"
              element={
                <DashboardLayout>
                  <RawMilkStorage />
                </DashboardLayout>
              }
            />

            <Route
              path="/processing"
              element={
                <DashboardLayout>
                  <MilkProcessing />
                </DashboardLayout>
              }
            />

            <Route
              path="/inventory"
              element={
                <DashboardLayout>
                  <InventoryManagement />
                </DashboardLayout>
              }
            />

            <Route
              path="/dispatch"
              element={
                <DashboardLayout>
                  <DispatchManagement />
                </DashboardLayout>
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