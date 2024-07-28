import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";

const drawerWidth = 250;

export default function LongTerm() {
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
        <h1>Pronóstico a Largo Plazo</h1>
      </Box>
    </>
  );
}
