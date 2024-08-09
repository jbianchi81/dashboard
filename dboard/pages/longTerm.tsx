import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import Typography from "@mui/material/Typography";
import { HydroChart, HydroEntry } from "@/components/hydroChart";

const drawerWidth = 250;

export default function LongTerm() {
  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);

  const thirtyDaysAgo = moment().subtract(30, "d").toISOString();
  const now = moment().toISOString();
  const thirtyDaysFromNow = moment().add(30, "d").toISOString();

  async function getHydrometricHeightData() {
    const params = {
      type: "puntual",
      seriesIdObs: "151",
      calId: "499",
      seriesIdSim: "35471",
      timeStartObs: thirtyDaysAgo,
      timeEndObs: now,
      timeStartSim: thirtyDaysAgo,
      timeEndSim: thirtyDaysFromNow,
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
      const result = await getHydrometricHeightData();
      if (result) {
        console.log(result);
        let total = result["simulation"]["series"][0].pronosticos.length;
        let entries: HydroEntry[] = [];
        for (let i = 0; i < total; i++) {
          let obs = result["observations"][i]
            ? result["observations"][i].valor
            : null;
          let entry: HydroEntry = {
            date: new Date(
              result["simulation"]["series"][0].pronosticos[i].time
            ).getTime(),
            observed: obs !== null ? parseFloat(obs) : null,
            estimated: parseFloat(
              result["simulation"]["series"][1].pronosticos[i].value
            ),
            error_band: [
              parseFloat(
                result["simulation"]["series"][0].pronosticos[i].value
              ),
              parseFloat(
                result["simulation"]["series"][2].pronosticos[i].value
              ),
            ],
          };
          entries.push(entry);
        }
        setData(entries);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <DrawerMenu />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px}` },
          pr: 10,
          pl: 10,
        }}
      >
        <Typography variant="h4" sx={{ ml: 5 }}>
          Pronóstico a Largo Plazo
        </Typography>
        <Box
          sx={{
            display: "flex",
            m: 5,
          }}
        >
          <HydroChart data={data}></HydroChart>
        </Box>
      </Box>
      {error && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px}` },
            pr: 10,
            pl: 10,
          }}
        >
          <Alert severity="error" sx={{ mt: 10 }}>
            Ocurrió un error, por favor vuelva a intentarlo
          </Alert>
        </Box>
      )}
    </>
  );
}
