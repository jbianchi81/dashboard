import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import Typography from "@mui/material/Typography";
import {
  HydroChart,
  HydroEntry,
  buildHydroEntries,
  getPronosByQualifier
} from "@/components/hydroChart";
import { parseCookies } from "nookies";
import { GetServerSidePropsContext } from "next";
import { CurrentPng } from "recharts-to-png";

const drawerWidth = 250;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = parseCookies(context);
  const sessionToken = cookies.session;

  if (process.env.skip_login !== "true" && !sessionToken) {
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

export default function LongTerm() {
  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);
  const [forecastDate, setForecastDate] = useState("");

  const sixtyDaysAgo = moment().subtract(60, "d").toISOString();
  const now = moment().toISOString();

  async function getHydrometricHeightData() {
    const params = {
      type: "puntual",
      seriesIdObs: "36030",
      calId: "499",
      seriesIdSim: "35472",
      timeStartObs: sixtyDaysAgo,
      timeEndObs: now,
      timeStartSim: "",
      timeEndSim: "",
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
      if (!result) {
        return;
      }
      const entries = buildHydroEntries(
        getPronosByQualifier(result.simulation.series,"main"),
        result.observations,
        getPronosByQualifier(result.simulation.series,"p10"),
        getPronosByQualifier(result.simulation.series,"p90"),
      );
      setData(entries);
      setForecastDate(result.simulation.forecast_date);
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
        <Typography fontSize={{ lg: 30, sm: 20, xs: 20 }} sx={{ ml: 5 }}>
          Pronóstico a Largo Plazo
        </Typography>
        <Typography fontSize={{ lg: 20, sm: 15, xs: 15 }} sx={{ ml: 5, mt: 3 }}>
          Altura hidrométrica en Estación Atucha
        </Typography>
        {error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: { sm: `calc(100% - 2*${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px}` },
              mr: { sm: `${drawerWidth}px}` },
              pr: 10,
              pl: 10,
            }}
          >
            <Alert severity="error" sx={{ mt: 10 }}>
              Ocurrió un error, por favor vuelva a intentarlo
            </Alert>
          </Box>
        )}
        {!error && (
          <Box
            sx={{
              display: "flex",
              m: 5,
            }}
          >
            <CurrentPng>
              {(props) => (
                <HydroChart
                  data={data}
                  height={600}
                  pngProps={props}
                  forecastDate={forecastDate}
                />
              )}
            </CurrentPng>
          </Box>
        )}
      </Box>
    </>
  );
}
