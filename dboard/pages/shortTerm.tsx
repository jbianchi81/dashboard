import Alert from "@mui/material/Alert";
import DrawerMenu from "../components/drawer";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import moment from "moment";
import HydroChart from "../components/hydroChart";
import Metadata from "@/lib/domain/metadata";
import DataPoint from "@/lib/domain/datapoint";
import ErrorBandDatapoint from "@/lib/domain/errorBandDatapoint";

const drawerWidth = 250;

export default function ShortTerm() {
  const [error, setError] = useState(false);
  const [metadata, setMetadata] = useState({} as Metadata);
  const [obs, setObs] = useState([] as DataPoint[]);
  const [sim, setSim] = useState([] as DataPoint[]);
  const [simErrorBand, setSimErrorBand] = useState([] as ErrorBandDatapoint[]);
  const [data, setData] = useState({} as FormattedData);

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
      setMetadata(result["metadata"]);
      setObs(createDataPoints(result["observations"]));
      setSim(
        createDataPoints(result["simulation"]["series"][2]["pronosticos"])
      );
      setSimErrorBand(createSimErrorBand(result["simulation"]["series"]));
      setData(assembleData(metadata, obs, sim, simErrorBand));
    }
    fetchData();
  }, []);

  function createDataPoints(rawData: []) {
    const data: DataPoint[] = [];
    rawData.map((i) => {
      const dp: DataPoint = { name: i[0], value: i[1] };
      data.push(dp);
    });
    return data;
  }

  function createSimErrorBand(simulationSeries: { [x: string]: any }[]) {
    const data: ErrorBandDatapoint[] = [];
    const lowerErrorBand = simulationSeries[0]["pronosticos"];
    const upperErrorBand = simulationSeries[1]["pronosticos"];

    const a = lowerErrorBand.map((x: any, i: any) => {
      const eb: ErrorBandDatapoint = {
        name: x["time"],
        value: [x["value"], upperErrorBand[i]["value"]],
      };
      data.push(eb);
    });
    return data;
  }

  function assembleData(
    metadata_: Metadata,
    observations_: DataPoint[],
    simulation_: DataPoint[],
    errorBand_: ErrorBandDatapoint[]
  ) {
    const data: FormattedData = {
      metadata: metadata_,
      observations: observations_,
      simulation: simulation_,
      error_band: errorBand_,
    };
    return data;
  }

  type FormattedData = {
    metadata: Metadata;
    observations: DataPoint[];
    simulation: DataPoint[];
    error_band: ErrorBandDatapoint[];
  };

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

        <HydroChart message={"test"}></HydroChart>
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
