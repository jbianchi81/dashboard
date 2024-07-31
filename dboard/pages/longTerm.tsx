import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

const drawerWidth = 250;

export default function LongTerm() {
  const [error, setError] = useState(false);

  async function getData() {
    //TO DO check params
    const params = {
      type: "puntual",
      seriesIdObs: "151",
      calId: "489",
      seriesIdSim: "3403",
    };
    const response = await fetch(`/api/charts/getLongTerm`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (response.status == 200) {
      const result = await response.json();
      return result;
    } else {
      setError(true);
    }
  }

  useEffect(() => {
    getData();
  }, []);

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
      {error && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              pr: 10,
              pl: 10,
            }}
          >
            <Alert severity="error" sx={{ mt: 10 }}>
              Ocurrió un error, por favor vuelva a intentarlo
            </Alert>
          </Box>
        </>
      )}
    </>
  );
}
