
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import ScienceIcon from "@mui/icons-material/Science";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import InventoryIcon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

const drawerWidth = 220;
const drawerHeight = 1008;
const menuWidth = 188;
const menuItemHeight = 44;

const menuItems = [
  { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { text: "Milk Reception", path: "/milk-reception", icon: <LocalDrinkIcon /> },
  { text: "Quality Testing", path: "/quality-testing", icon: <ScienceIcon /> },
  { text: "Raw Milk Storage", path: "/raw-milk-storage", icon: <StorageIcon /> },
  { text: "Processing", path: "/processing", icon: <SettingsIcon /> },
  { text: "Inventory", path: "/inventory", icon: <InventoryIcon /> },
  { text: "Dispatch", path: "/dispatch", icon: <LocalShippingIcon /> },
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleMenuItems =
    user?.role?.toUpperCase() === "ADMIN"
      ? [...menuItems, { text: "User Management", path: "/users", icon: <PeopleAltIcon /> }]
      : menuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        height: drawerHeight,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          height: drawerHeight,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #dfe3e8",
          overflowX: "hidden"
        }
      }}
    >
      <Toolbar
        sx={{
          minHeight: "44px !important",
          height: 44,
          px: "16px !important"
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap"
          }}
        >
          PGSL Dairy Portal
        </Typography>
      </Toolbar>

      <Box sx={{ px: 1.75, pt: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: "#6b7280",
            lineHeight: "16px",
            mb: 1
          }}
        >
          MAIN MENU
        </Typography>

        <List
          disablePadding
          sx={{
            width: menuWidth,
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {visibleMenuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                width: menuWidth,
                height: menuItemHeight,
                minHeight: menuItemHeight,
                boxSizing: "border-box",
                px: "16px",
                py: 0,
                borderRadius: "5px",
                color: "#303746",

                "& .MuiListItemIcon-root": {
                  minWidth: 34,
                  color: "#788292",
                  alignItems: "center"
                },

                "& .MuiSvgIcon-root": {
                  fontSize: 20
                },

                "& .MuiListItemText-root": {
                  margin: 0
                },

                "& .MuiListItemText-primary": {
                  fontSize: 14,
                  lineHeight: "16px",
                  whiteSpace: "nowrap"
                },

                "&.active": {
                  backgroundColor: "#EBF3ED",
                  color: "#2D5A43"
                },

                "&.active .MuiListItemIcon-root": {
                  color: "#2D5A43"
                },

                "&.active .MuiListItemText-primary": {
                  fontWeight: 600,
                  color: "#2D5A43"
                },

                "&:hover": {
                  backgroundColor: "#F9FAFB"
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
