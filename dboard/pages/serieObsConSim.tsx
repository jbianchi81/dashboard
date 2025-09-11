import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Image from "next/image";
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
import { HydrometricForecastResponse } from "./api/charts/getHydrometricForecast"
import Metadata from "@/lib/domain/metadata"
import { buildWindEntries, WindEntry, WindChart } from "@/components/windChart";
const drawerWidth = 250;

interface GetDataParams {
  type : string,
  seriesIdObs : number,
  calId?: number,
  seriesIdSim?: number,
  timeStartObs?: string,
  timeEndObs?: string,
  timeStartSim?: string,
  timeEndSim?: string
}

interface GetWindParams {
    estacionId: number
    seriesIdWindVel: number
    seriesIdWindDir: number
}

export const getServerSideProps = pageGetServerSideProps;

export default function SerieObsConSim({ pageConfig, pageSet, pageSetIndex } : { pageConfig: DataPage, pageSet: DataPageSet, pageSetIndex : string[] }) {

  const router = useRouter();
  const { page } = router.query;

  const [error, setError] = useState(false);
  const [data, setData] = useState([] as HydroEntry[]);
  const [windData, setWindData] = useState([] as WindEntry[]);
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
  const [auxMetadata, setAuxMetadata] = useState<Metadata[]>([])

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
    timeEndObs_: string,
    params_ : GetDataParams | null
  ) : Promise<HydrometricForecastResponse | undefined> {
    const config_ = params_ ?? pageConfig
    const params = {
      type: config_.type,
      seriesIdObs: config_.seriesIdObs,
      calId: config_.calId,
      seriesIdSim: config_.seriesIdSim,
      timeStartObs: timeStartObs_,
      timeEndObs: timeEndObs_,
      timeStartSim: "",
      timeEndSim: "",
    };
    try {
      const obs_request_url = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/charts/getHydrometricForecast`
      console.debug({request_url: obs_request_url})
      const response = await fetch(obs_request_url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (response.status === 200) {
        const result : HydrometricForecastResponse = await response.json();
        return result;
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    }
  }

  async function getWindData(
    timeStart_: string, 
    timeEnd_: string,
    params_: GetWindParams | null
  ) {
    const config = params_ ?? pageConfig.viento
    if(!config) {
      throw new Error("Faltan parámetros para gráfico de viento")
    }
    const params = {
      type: "puntual",
      estacionId: config.estacionId,
      seriesIdWindVel: config.seriesIdWindVel,
      seriesIdWindDir: config.seriesIdWindDir,
      timeStart: timeStart_,
      timeEnd: timeEnd_,
    };
    try {
      const wind_request_url = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/charts/getWindForecast`
      console.debug({wind_request_url})
      const response = await fetch(wind_request_url, {
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
    if(e.$d.toString() == "Invalid Date") {
      console.warn("Fecha inicial no válida")
      return
    }
    const date = e.$d.toISOString();
    setTimeStartObs(date);
  }

  function handleToChange(e: any) {
    if(e.$d.toString() == "Invalid Date") {
      console.warn("Fecha inicial no válida")
      return
    }
    const date = e.$d.toISOString();
    setTimeEndObs(date);
  }

  function handleDateChange() {
    fetchData(null, null, null);
  }

  async function fetchData(pageConfig_ : DataPage | null, timestart : string | null, timeend : string | null) {
    pageConfig_ = pageConfig_ ?? pageConfig
    timestart = timestart ?? timeStartObs_
    timeend = timeend ?? timeEndObs_
    var timeend_wind = new Date(timeEndObs_)
    timeend_wind.setDate(timeend_wind.getDate() + (pageConfig_.viento && pageConfig_.viento.timeendDays ? pageConfig_.viento.timeendDays : 15))
    // console.debug({timestart, timeend, timeend_wind})
    const result_main = await getHydrometricHeightData(
      timestart, 
      timeend,  
      {
        type: pageConfig_.type,
        seriesIdObs: pageConfig_.seriesIdObs,
        calId: pageConfig_.calId,
        seriesIdSim: pageConfig_.seriesIdSim
      });
    if (!result_main) {
      return;
    }
    const results_aux = []
    if(pageConfig_.seriesAuxiliares) {
      for(const serieAuxiliar of pageConfig_.seriesAuxiliares) {
        const result_aux = await getHydrometricHeightData(
          timestart,
          timeend,
          {
            type: serieAuxiliar.tipo,
            seriesIdObs: serieAuxiliar.series_id
          });
          if(result_aux) {
            results_aux.push(result_aux)
          }
      }
    }
    if(pageConfig_.viento) {
      var windResult = await getWindData(timestart, timeend_wind.toISOString(), pageConfig_.viento);
      const windEntries = buildWindEntries(
        windResult.wind_direction_obs,
        windResult.wind_velocity_obs
      );
      setWindData(windEntries);
    }

    setAuxMetadata(results_aux.map(r=>r.metadata))
    if(result_main.simulation) {
      const entries = buildHydroEntries(
        getPronosByQualifier(result_main.simulation.series, pageConfig_.mainQualifier ?? "main"),
        result_main.observations,
        pageConfig_.errorBandLow ? getPronosByQualifier(result_main.simulation.series, pageConfig_.errorBandLow) : [], //  ?? "error_band_01"
        pageConfig_.errorBandHigh ? getPronosByQualifier(result_main.simulation.series, pageConfig_.errorBandHigh) : [], //  ?? "error_band_99"
        results_aux.map(r => r.observations)
      );
      setData(entries);
      setForecastDate(result_main.simulation.forecast_date);
    } else {
      const entries = buildHydroEntries(
        [],
        result_main.observations,
        [],
        [],
        results_aux.map(r => r.observations)
      );
      setData(entries);
    }
    if(result_main.metadata.percentiles_ref) {
      setCustomRefLines(result_main.metadata.percentiles_ref)
    }
    setNombreVariable(result_main.metadata.var.nombre)
    setNombreEstacion(result_main.metadata.estacion.nombre)
  }

  useEffect(() => {
    if(page) {
      const page_index_int : number = Array.isArray(page) ? parseInt(page[0]) : parseInt(page)
      if(page_index_int > pageSet.pages.length - 1) {
        throw new Error("Error: page " + page_index_int + " not found in pageSet " + pageSet.id);
      }
      const pageConfig_ : DataPage = pageSet.pages[page_index_int]

      const firstTimeStart = moment().subtract(pageConfig_.timeStartDays ?? 7, "d").toISOString();
      const firstTimeEnd = moment().subtract(pageConfig_.timeEndDays ?? 0, "d").toISOString();
      setTimeStartObs(firstTimeStart);
      setTimeEndObs(firstTimeEnd);
      const initialRefLines : RefLines = {
        bottom: (pageConfig_.refLines) ? pageConfig_.refLines.bottom : null,
        low: (pageConfig_.refLines) ? pageConfig_.refLines.low : null,
        up: (pageConfig_.refLines) ? pageConfig_.refLines.up : null,
        top: (pageConfig_.refLines) ? pageConfig_.refLines.top : null
      };
      setRefLines(initialRefLines);
      if(pageConfig_.title) {
        setTitle(pageConfig_.title);
      }
      setNombreVariable("Altura hidrométrica")
      setNombreEstacion(pageConfig_.nombre_estacion)

      fetchData(pageConfig_, firstTimeStart, firstTimeEnd)

    } else {
      fetchData(null, null, null);
    }
  }, [page]);

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
                  auxColumns={auxMetadata.map(m => m.estacion.nombre)}
                />
              )}
            </CurrentPng>
          </Box>
        )}
        { !error && pageConfig.viento && (
          <div>
            <Typography
              fontSize={{ lg: 20, sm: 15, xs: 15 }}
              sx={{ ml: 5, mt: 5 }}
            >
              { pageConfig.viento.title ?? "Velocidad y dirección del viento" }
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
              { pageConfig.viento.image && 
                <Box sx={{ ml: 5, mt: 1 }}>
                  <Image
                    src={pageConfig.viento.image ?? "https://alerta.ina.gob.ar/ina/51-GEFS_WAVE/gefs_wave/gefs.wave.last.gif"}
                    width={400}
                    height={450}
                    alt="map"
                  />
                </Box>
              }
            </Box>
          </div>
        )}
      </Box>
    </>
  );
}
