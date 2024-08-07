import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import { HydroChart, HydroEntry } from "../components/hydroChart";

const drawerWidth = 250;

export default function ShortTerm() {
  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);

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
    try {
      const response = await fetch(`/api/charts/getHydrometricForecast`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (response.status === 200) {
        const result = await response.json();
        return result;
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    }
  }

  useEffect(() => {
    async function fetchData() {
      const result = await getHydrometricHeightData();
      if (result) {
        let total = result["simulation"]["series"][0].pronosticos.length;
        let entries: HydroEntry[] = [];
        for (let i = 0; i < total; i++) {
          let obs = result["observations"][i]
            ? result["observations"][i].valor
            : null;
          let entry: HydroEntry = {
            date: result["simulation"]["series"][0].pronosticos[i].time,
            observed: obs !== null ? parseFloat(obs) : null,
            estimated: parseFloat(
              result["simulation"]["series"][2].pronosticos[i].value
            ),
            error_band: [
              parseFloat(
                result["simulation"]["series"][0].pronosticos[i].value
              ),
              parseFloat(
                result["simulation"]["series"][1].pronosticos[i].value
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
        <h1>Pronóstico a Corto Plazo</h1>
        <HydroChart message={"test"} data={data}></HydroChart>
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
