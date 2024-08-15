import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import { parseCookies } from "nookies";
import { GetServerSidePropsContext } from "next";
import Typography from "@mui/material/Typography";
import {
  HydroChart,
  HydroEntry,
  buildHydroEntries,
} from "../components/hydroChart";
import {
  WindChart,
  WindEntry,
  buildWindEntries,
} from "../components/windChart";

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

export default function Meteorological() {
  const [error, setError] = useState(false);
  const [hydroData, setHydroData] = useState([] as HydroEntry[]);
  const [windData, setWindData] = useState([] as WindEntry[]);

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

  async function getWindData() {
    const params = {
      type: "puntual",
      estacionId: "1740",
      seriesIdWindVel: "35478",
      seriesIdWindDir: "35479",
      timeStart: fourDaysAgo,
      timeEnd: fifteenDaysFromNow,
    };
    try {
      const response = await fetch(`/api/charts/getWindForecast`, {
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
      const hydrometricResult = await getHydrometricHeightData();
      const windResult = await getWindData();

      if (!hydrometricResult || !windResult) {
        return;
      }
      const hydroEntries = buildHydroEntries(
        hydrometricResult.simulation.series[1].pronosticos,
        hydrometricResult.observations,
        hydrometricResult.simulation.series[0].pronosticos,
        hydrometricResult.simulation.series[3].pronosticos
      );
      setHydroData(hydroEntries);
      const windEntries = buildWindEntries(
        windResult.wind_direction_obs,
        windResult.wind_velocity_obs
      );
      setWindData(windEntries);
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
          Pronóstico Meteorológico en el Río de la Plata
        </Typography>
        <Box
          sx={{
            display: "flex",
            m: 5,
          }}
        >
          {/* <HydroChart data={hydroData}></HydroChart> */}
          <WindChart data={windData}></WindChart>
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
