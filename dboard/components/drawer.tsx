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
import { useRouter } from "next/router";
// import { sharedGetServerSideProps } from "@/lib/sharedGetServerSideProps";
import DataPageSet from "@/lib/domain/dataPageSet";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const iconTagMap : Record<string, OverridableComponent<SvgIconTypeMap<{}, "svg">>> = {
  KeyboardArrowRightIcon: KeyboardArrowRightIcon,
  KeyboardDoubleArrowRightIcon: KeyboardDoubleArrowRightIcon,
  ArrowBackIcon: ArrowBackIcon,
  ThermostatIcon: ThermostatIcon  
} 

const drawerWidth = 250;

// export const getServerSideProps = sharedGetServerSideProps;

export default function ResponsiveDrawer({ pageSet, pageSetIndex } : { pageSet: DataPageSet, pageSetIndex : string[]}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const router = useRouter();

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

  async function logOut() {
    try {
      const authRequest = await fetch("/api/auth/logout");
      if (authRequest.status == 200) {
        router.push("/login");
      } else {
        router.push("/error");
      }
    } catch (error: unknown) {
      reportError(error as Error);
    }
  }

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

        <Accordion disableGutters elevation={0} square>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ListItemText primary={pageSet.title} title="Haga click aquí para cambiar el pageset" />
          </AccordionSummary>
          <AccordionDetails sx={{ pl: 2 }}>
            <List disablePadding>
              {pageSetIndex.map(pageset_id => (
                <ListItemButton component={Link} href={`/?pageset=${pageset_id}`}>
                  <ListItemText primary={pageset_id} />
                </ListItemButton>  
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Link
          href={`/?pageset=${pageSet.id}`}
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
        {pageSet.pages.map((pageConfig, i) =>  {
          const IconTag = iconTagMap[pageConfig.itemIcon ?? "KeyboardArrowRightIcon"]
          return (
            <Link
              href={`/${pageConfig.pageType}?pageset=${pageSet.id}&page=${i}`}
              style={{
                textDecoration: "none",
                color: "#EDEDED",
              }}
            >
              <ListItem key={pageConfig.id} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <IconTag
                      sx={{ fontSize: 25, color: "#EDEDED" }}
                    />
                    <ListItemText
                      primary={pageConfig.title ?? pageConfig.id}
                      sx={{ color: "#EDEDED", ml: 1 }}
                    />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </Link>
          )
        })}

        <ListItem key={"logout"} disablePadding>
          <ListItemButton onClick={logOut}>
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
