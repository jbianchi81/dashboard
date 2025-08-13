import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  HydroChart,
  HydroEntry,
  buildHydroEntries,
  getPronosByQualifier
} from "../components/hydroChart";
import { Button, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CurrentPng } from "recharts-to-png";
import { useRouter } from "next/router";
import DataPage from "@/lib/domain/dataPage"
import RefLines from "@/lib/domain/ref_lines"
import { pageGetServerSideProps } from "@/lib/sharedGetServerSideProps"
import DataPageSet from "@/lib/domain/dataPageSet";

const drawerWidth = 250;

export const getServerSideProps = pageGetServerSideProps;

export default function SerieObsConSim({ pageConfig, pageSet } : { pageConfig: DataPage, pageSet: DataPageSet }) {
  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);
  const firstTimeStart = moment().subtract(pageConfig.timeStartDays ?? 7, "d").toISOString();
  const firstTimeEnd = moment().subtract(pageConfig.timeEndDays ?? 0, "d").toISOString();
  const [timeStartObs_, setTimeStartObs] = useState(firstTimeStart);
  const [timeEndObs_, setTimeEndObs] = useState(firstTimeEnd);
  const [forecastDate, setForecastDate] = useState("");
  const initialRefLines : RefLines = {
    bottom: (pageConfig.refLines) ? pageConfig.refLines.bottom : null,
    low: (pageConfig.refLines) ? pageConfig.refLines.low : null,
    up: (pageConfig.refLines) ? pageConfig.refLines.up : null,
    top: (pageConfig.refLines) ? pageConfig.refLines.top : null
  };
  const [refLines, setRefLines] = useState<RefLines>(initialRefLines);
  const [title, setTitle] = useState(pageConfig.title ?? "");
  const [nombre_variable, setNombreVariable] = useState("Altura hidrométrica")
  const [nombre_estacion, setNombreEstacion] = useState(pageConfig.nombre_estacion)

  function setCustomRefLines(percentiles_ref : Record<number, number>) {
    setRefLines({
      bottom: (95 in percentiles_ref) ? percentiles_ref[95] : refLines.bottom,
      low: (75 in percentiles_ref) ? percentiles_ref[75] : refLines.low,
      up: (25 in percentiles_ref) ? percentiles_ref[25] : refLines.up,
      top: (5 in percentiles_ref) ? percentiles_ref[5] : refLines.top
    })    
  }

  async function getHydrometricHeightData(
    timeStartObs_: string,
    timeEndObs_: string
  ) {
    const params = {
      type: pageConfig.type,
      seriesIdObs: pageConfig.seriesIdObs,
      calId: pageConfig.calId,
      seriesIdSim: pageConfig.seriesIdSim,
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
    if(result.simulation) {
      const entries = buildHydroEntries(
        getPronosByQualifier(result.simulation.series, pageConfig.mainQualifier ?? "main"),
        result.observations,
        getPronosByQualifier(result.simulation.series, pageConfig.errorBandLow ?? "error_band_01"),
        getPronosByQualifier(result.simulation.series, pageConfig.errorBandHigh ?? "error_band_99")
      );
      setData(entries);
      setForecastDate(result.simulation.forecast_date);
    } else {
      const entries = buildHydroEntries(
        [],
        result.observations,
        [],
        []
      );
      setData(entries);
    }
    if(result.metadata.percentiles_ref) {
      setCustomRefLines(result.metadata.percentiles_ref)
    }
    setNombreVariable(result.metadata.var.nombre)
    setNombreEstacion(result.metadata.estacion.nombre)
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <DrawerMenu pageSet={pageSet} />
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
          { title }
        </Typography>
        <Typography fontSize={{ lg: 20, sm: 15, xs: 15 }} sx={{ ml: 5, mt: 3 }}>
          {nombre_variable} en Estación {nombre_estacion}
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
                  data={data}
                  height={550}
                  pngProps={props}
                  forecastDate={forecastDate}
                  refLines={{...refLines}}
                  timeStart={new Date(timeStartObs_)}
                />
              )}
            </CurrentPng>
          </Box>
        )}
      </Box>
    </>
  );
}
