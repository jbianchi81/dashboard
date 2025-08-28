import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import Image from "next/image";
import { useEffect, useState } from "react";
import moment from "moment";
import { Button, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  HydroChart,
  HydroEntry,
  buildHydroEntries,
  getPronosByQualifier
} from "../components/hydroChart";
import {
  WindChart,
  WindEntry,
  buildWindEntries,
} from "../components/windChart";
import { CurrentPng } from "recharts-to-png";
import RefLines from "@/lib/domain/ref_lines"
import { pageGetServerSideProps } from "@/lib/sharedGetServerSideProps"
import DataPage from "@/lib/domain/dataPage"
import DataPageSet from "@/lib/domain/dataPageSet";

const drawerWidth = 250;

export const getServerSideProps = pageGetServerSideProps;

const sevenDaysAgo = moment().subtract(7, "d").toISOString();
const now = moment().toISOString();
const fifteenDaysFromNow = moment().add(15, "d").toISOString();

export default function Meteorological({ pageConfig, pageSet, pageSetIndex } : { pageConfig: DataPage, pageSet: DataPageSet, pageSetIndex : string[] }) {
  const [error, setError] = useState(false);
  const [hydroData, setHydroData] = useState([] as HydroEntry[]);
  const [windData, setWindData] = useState([] as WindEntry[]);
  const [hydroTimeStartObs_, setHydroTimeStartObs] = useState(sevenDaysAgo);
  const [hydroTimeEndObs_, setHydroTimeEndObs] = useState(now);
  const [forecastDate, setForecastDate] = useState("");
  const initialRefLines : RefLines = {
    bottom: (pageConfig.refLines) ? pageConfig.refLines.bottom : null,
    low: (pageConfig.refLines) ? pageConfig.refLines.low : null,
    up: (pageConfig.refLines) ? pageConfig.refLines.up : null,
    top: (pageConfig.refLines) ? pageConfig.refLines.top : null
  };

  const [refLines, setRefLines] = useState<RefLines>(initialRefLines);
  async function getHydrometricHeightData(
    timeStartObs_: string,
    timeEndObs_: string
  ) {
    const params = {
      type: "puntual",
      seriesIdObs: "52",
      calId: "432",
      seriesIdSim: "26202",
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

  async function getWindData(timeStart_: string, timeEnd_: string) {
    const params = {
      type: "puntual",
      estacionId: "1740",
      seriesIdWindVel: "35478",
      seriesIdWindDir: "35479",
      timeStart: timeStart_,
      timeEnd: timeEnd_,
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

  function handleSinceChange(e: any) {
    const date = e.$d.toISOString();
    setHydroTimeStartObs(date);
  }

  function handleToChange(e: any) {
    const date = e.$d.toISOString();
    setHydroTimeEndObs(date);
  }

  function handleDateChange() {
    fetchData();
  }

  async function fetchData() {
    const hydrometricResult = await getHydrometricHeightData(
      hydroTimeStartObs_,
      hydroTimeEndObs_
    );
    const windResult = await getWindData(sevenDaysAgo, fifteenDaysFromNow);

    if (!hydrometricResult || !windResult) {
      return;
    }
    const hydroEntries = buildHydroEntries(
      getPronosByQualifier(hydrometricResult.simulation.series,"main"),
      hydrometricResult.observations,
      getPronosByQualifier(hydrometricResult.simulation.series,"p05"),
      getPronosByQualifier(hydrometricResult.simulation.series,"p95"),
      null
    );
    setHydroData(hydroEntries);
    const windEntries = buildWindEntries(
      windResult.wind_direction_obs,
      windResult.wind_velocity_obs
    );
    setForecastDate(hydrometricResult.simulation.forecast_date);
    setWindData(windEntries);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <DrawerMenu pageSet={pageSet} pageSetIndex={pageSetIndex}/>
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
          Pronóstico Meteorológico del Río de la Plata
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
          <>
            <Typography
              fontSize={{ lg: 20, sm: 15, xs: 15 }}
              sx={{ ml: 5, mt: 3 }}
            >
              Altura hidrométrica en Estación San Fernando
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                m: 5,
              }}
            >
              <Typography sx={{ ml: 10, mb: 1 }}>Seleccionar fechas</Typography>
              <Box
                sx={{ display: "flex", flexDirection: "row", ml: 10, mb: 3 }}
              >
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
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDateChange}
                >
                  Ver
                </Button>
              </Box>
              <CurrentPng>
                {(props) => (
                  <HydroChart
                    data={hydroData}
                    height={400}
                    pngProps={props}
                    forecastDate={forecastDate}
                    refLines={refLines}
                    timeStart={new Date(hydroTimeStartObs_)}
                  />
                )}
              </CurrentPng>
            </Box>
            <Typography
              fontSize={{ lg: 20, sm: 15, xs: 15 }}
              sx={{ ml: 5, mt: 5 }}
            >
              Velocidad y dirección del viento en Estación Pilote Norden
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                ml: 5,
                mr: 5,
                mt: 4,
              }}
            >
              <CurrentPng>
                {(props) => (
                  <WindChart data={windData} pngProps={props} height={500} />
                )}
              </CurrentPng>
              <Box sx={{ ml: 5, mt: 1 }}>
                <Image
                  src="https://alerta.ina.gob.ar/ina/51-GEFS_WAVE/gefs_wave/gefs.wave.last.gif"
                  width={400}
                  height={450}
                  alt="map"
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
