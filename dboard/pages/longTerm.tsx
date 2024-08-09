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
} from "@/components/hydroChart";
import { parseCookies } from "nookies";
import { GetServerSidePropsContext } from "next";

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
      if (!result) {
        return;
      }
      const entries = buildHydroEntries(
        result.simulation.series[1].pronosticos,
        result.observations,
        result.simulation.series[0].pronosticos,
        result.simulation.series[2].pronosticos
      );
      setData(entries);
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
