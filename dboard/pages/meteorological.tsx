import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";

const drawerWidth = 250;

export default function Meteorological() {
  const [error, setError] = useState(false);

  const fourDaysAgo = moment().subtract(4, "d").toISOString();
  const now = moment().toISOString();
  const fourDaysFromNow = moment().add(4, "d").toISOString();
  const fifteenDaysFromNow = moment().add(15, "d").toISOString();

  async function getHydrometricHeightData() {
    const params = {
      type: "puntual",
      seriesIdObs: "52",
      calId: "432",
      seriesIdSim: "26202",
      timeStartObs: fourDaysAgo,
      timeEndObs: now,
      timeStartSim: fourDaysAgo,
      timeEndSim: fourDaysFromNow,
    };
    const response = await fetch(`/api/charts/getHydrometricForecast`, {
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

  async function getWindData() {
    const params = {
      type: "puntual",
      estacionId: "1740",
      seriesIdWindVel: "35478",
      seriesIdWindDir: "35479",
      timeStart: fourDaysAgo,
      timeEnd: fifteenDaysFromNow,
    };
    const response = await fetch(`/api/charts/getWindForecast`, {
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
    getHydrometricHeightData();
    getWindData();
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
        <h1>Pronóstico Meteorológico</h1>
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
