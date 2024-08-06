import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";

const drawerWidth = 250;

export default function ShortTerm() {
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [obs, setObs] = useState([]);

  const fourDaysAgo = moment().subtract(4, "d").toISOString();
  const now = moment().toISOString();
  const fourDaysFromNow = moment().add(4, "d").toISOString();

  async function getHydrometricHeightData() {
    const params = {
      type: "puntual",
      seriesIdObs: "151",
      calId: "489",
      seriesIdSim: "3403",
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

  useEffect(() => {
    async function fetchData() {
      let result = await getHydrometricHeightData();
      setData(result);
      setObs(createObs(result["observations"]));
    }
    fetchData();
  }, []);

  function createObs(observations: []) {
    const data: any = [];
    observations.map((o: any) => {
      const d = { name: o[0], value: o[1] };
      data.push(d);
    });
    return data;
  }

  return (
    <>
      <DrawerMenu />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          pr: 10,
          pl: 10,
        }}
      >
        <h1>Pronóstico a Corto Plazo</h1>
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
