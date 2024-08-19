import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  HydroChart,
  HydroEntry,
  buildHydroEntries,
} from "../components/hydroChart";
import { Button, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parseCookies } from "nookies";
import { GetServerSidePropsContext } from "next";
import { CurrentPng } from "recharts-to-png";

const drawerWidth = 250;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = parseCookies(context);
  const sessionToken = cookies.session;

  if (!sessionToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session: sessionToken,
    },
  };
};

const fourDaysAgo = moment().subtract(4, "d").toISOString();
const now = moment().toISOString();

export default function ShortTerm() {
  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);
  const [timeStartObs_, setTimeStartObs] = useState(fourDaysAgo);
  const [timeEndObs_, setTimeEndObs] = useState(now);

  async function getHydrometricHeightData(
    timeStartObs_: string,
    timeEndObs_: string
  ) {
    const params = {
      type: "puntual",
      seriesIdObs: "151",
      calId: "489",
      seriesIdSim: "3403",
      timeStartObs: timeStartObs_,
      timeEndObs: timeEndObs_,
      timeStartSim: "",
      timeEndSim: "",
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

  function handleSinceChange(e: any) {
    const date = e.$d.toISOString();
    setTimeStartObs(date);
  }

  function handleToChange(e: any) {
    const date = e.$d.toISOString();
    setTimeEndObs(date);
  }

  function handleDateChange() {
    fetchData();
  }

  async function fetchData() {
    const result = await getHydrometricHeightData(timeStartObs_, timeEndObs_);
    if (!result) {
      return;
    }
    const entries = buildHydroEntries(
      result.simulation.series[2].pronosticos,
      result.observations,
      result.simulation.series[0].pronosticos,
      result.simulation.series[1].pronosticos
    );
    setData(entries);
  }

  useEffect(() => {
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
        <Typography fontSize={{ lg: 30, sm: 20, xs: 20 }} sx={{ ml: 5 }}>
          Pronóstico a Corto Plazo
        </Typography>
        <Typography fontSize={{ lg: 20, sm: 15, xs: 15 }} sx={{ ml: 5, mt: 3 }}>
          Altura hidrométrica en Estación Atucha
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            m: 5,
          }}
        >
          <Typography sx={{ ml: 10, mb: 1 }}>Seleccionar fechas</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", mb: 3, ml: 10 }}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="EN-GB"
            >
              <DatePicker
                label="Desde"
                onChange={(e) => handleSinceChange(e)}
                format="DD-MM-YYYY"
              />
              <DatePicker
                label="Hasta"
                sx={{ ml: 3, mr: 3 }}
                onChange={(ev) => handleToChange(ev)}
                format="DD-MM-YYYY"
              />
            </LocalizationProvider>
            <Button variant="contained" size="small" onClick={handleDateChange}>
              Ver
            </Button>
          </Box>
          <CurrentPng>
            {(props) => (
              <HydroChart data={data} height={550} pngProps={props} />
            )}
          </CurrentPng>
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
