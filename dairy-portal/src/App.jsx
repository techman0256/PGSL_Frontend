
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import Dashboard from "./pages/Dashboard";
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardLayout from './components/DashboardLayout'
import ModulePage from './pages/ModulePage'

function App() {
  return (
     
    <BrowserRouter>
      <Routes>
        {/* Existing login and signup pages */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard and sidebar navigation */}
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
              <ModulePage title="Milk Reception" />
            </DashboardLayout>
          }
        />

        <Route
          path="/quality-testing"
          element={
            <DashboardLayout>
              <ModulePage title="Quality Testing" />
            </DashboardLayout>
          }
        />

        <Route
          path="/raw-milk-storage"
          element={
            <DashboardLayout>
              <ModulePage title="Raw Milk Storage" />
            </DashboardLayout>
          }
        />

        <Route
          path="/processing"
          element={
            <DashboardLayout>
              <ModulePage title="Processing" />
            </DashboardLayout>
          }
        />

        <Route
          path="/inventory"
          element={
            <DashboardLayout>
              <ModulePage title="Inventory" />
            </DashboardLayout>
          }
        />

        <Route
          path="/dispatch"
          element={
            <DashboardLayout>
              <ModulePage title="Dispatch" />
            </DashboardLayout>
          }
        />

        {/* Redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App