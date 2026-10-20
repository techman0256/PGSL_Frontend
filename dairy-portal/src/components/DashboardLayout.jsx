import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ButtonBase,
  Snackbar,
  Alert,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuth from "../context/useAuth";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutError, setLogoutError] = useState("");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    setLogoutError("");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      setLogoutError(error.response?.data?.message || "Could not sign out. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8F9FA" }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            color: "#1F2937",
            borderBottom: "1px solid #E5E7EB",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px !important", px: { xs: 2, md: 3 } }}>
            {/* Left Header Logo & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  bgcolor: "#EBF3ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2D5A43",
                }}
              >
                <LocalDrinkIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                Milk Processing Plant Management System
              </Typography>
            </Box>

            {/* Right Header: Profile / User Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ButtonBase
                onClick={handleMenuOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: "6px",
                  "&:hover": { bgcolor: "#F9FAFB" },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: "12px",
                    fontWeight: 600,
                    bgcolor: "#E5E7EB",
                    color: "#374151",
                  }}
                >
                  {user?.initials || "AD"}
                </Avatar>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  {user?.username === "admin" ? "Admin" : user?.name || "Admin"}
                </Typography>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </ButtonBase>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    elevation: 1,
                    sx: {
                      mt: 1,
                      minWidth: 160,
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                    },
                  },
                }}
              >
                <MenuItem onClick={handleMenuClose} sx={{ fontSize: "13px" }}>
                  <PersonIcon sx={{ fontSize: 18, mr: 1, color: "#6B7280" }} />
                  {user?.name || "Plant Admin"}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontSize: "13px", color: "#DC2626" }}>
                  <LogoutIcon sx={{ fontSize: 18, mr: 1 }} />
                  Sign out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1, minWidth: 0, bgcolor: "#F8F9FA" }}>
          {children}
        </Box>
      </Box>
      <Snackbar
        open={Boolean(logoutError)}
        autoHideDuration={5000}
        onClose={() => setLogoutError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setLogoutError("")}>
          {logoutError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
