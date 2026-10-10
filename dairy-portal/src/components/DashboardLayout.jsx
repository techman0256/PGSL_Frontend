
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f2f3f5" }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "#202733",
            borderBottom: "1px solid #dfe3e8"
          }}
        >
          <Toolbar>
            <Typography variant="subtitle1" fontWeight="bold">
              Milk Processing Plant Management System
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2, minWidth: 0 }}>
           {children}
        </Box>
      </Box>
    </Box>
  );
}
