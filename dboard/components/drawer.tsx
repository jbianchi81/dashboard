import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Link from "next/link";
import List from "@mui/material/List";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const drawerWidth = 250;

export default function ResponsiveDrawer() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div
      style={{ backgroundColor: "#01599b", height: "100%", color: "#EDEDED" }}
    >
      <Toolbar>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ display: { lg: "none" } }}
        >
          <ArrowBackIcon sx={{ ml: "190px", color: "#EDEDED" }} />
        </IconButton>
      </Toolbar>
      <List>
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#EDEDED",
          }}
        >
          <ListItem key={"home"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon sx={{ fontSize: 25, color: "#EDEDED" }} />
                <ListItemText
                  primary={"Inicio"}
                  sx={{ color: "#EDEDED", ml: 1 }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          href={"/shortTerm"}
          style={{
            textDecoration: "none",
            color: "#EDEDED",
          }}
        >
          <ListItem key={"short"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <KeyboardArrowRightIcon
                  sx={{ fontSize: 25, color: "#EDEDED" }}
                />
                <ListItemText
                  primary={"Pronóstico a Corto Plazo"}
                  sx={{ color: "#EDEDED", ml: 1 }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          href={"/longTerm"}
          style={{
            textDecoration: "none",
            color: "#EDEDED",
          }}
        >
          <ListItem key={"long"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <KeyboardDoubleArrowRightIcon
                  sx={{ fontSize: 25, color: "#EDEDED" }}
                />
                <ListItemText
                  primary={"Pronóstico a Largo Plazo"}
                  sx={{ color: "#EDEDED", ml: 1 }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Link>
        <Link
          href={"/meteorological"}
          style={{
            textDecoration: "none",
            color: "#EDEDED",
          }}
        >
          <ListItem key={"meteo"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <ThermostatIcon sx={{ fontSize: 25, color: "#EDEDED" }} />
                <ListItemText
                  primary={"Pronóstico Meteorológico"}
                  sx={{ color: "#EDEDED", ml: 1 }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Link>
        <ListItem key={"logout"} disablePadding>
          {/* <ListItemButton onClick={logOut}> */}
          <ListItemButton>
            <ListItemIcon>
              <LogoutIcon sx={{ fontSize: 25, color: "#EDEDED" }} />
              <ListItemText
                primary={"Cerrar sesión"}
                sx={{ color: "#EDEDED", ml: 1 }}
              />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#01599b",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Tablero de Monitoreo
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
      </Box>
    </Box>
  );
}
