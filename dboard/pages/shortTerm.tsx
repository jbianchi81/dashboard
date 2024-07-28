import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";

const drawerWidth = 250;

export default function ShortTerm() {
  return (
    <>
      <DrawerMenu />
      <Box
        sx={{
          display: "flex",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          pr: 10,
          pl: 10,
        }}
      >
        <h1>Pronóstico a Corto Plazo</h1>
      </Box>
    </>
  );
}
