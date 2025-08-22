import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import Metadata from "@/lib/domain/metadata";
import Station from "@/lib/domain/station";
import Var from "@/lib/domain/var";
import Units from "@/lib/domain/units";

const token = process.env.token;

export default async function getHydrometricForecast(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    type,
    seriesIdObs,
    calId,
    seriesIdSim,
    timeStartObs,
    timeEndObs,
    timeStartSim,
    timeEndSim,
  } = req.body;

  const sessionToken = req.cookies.session;

  if (process.env.skip_login !== "true" && !sessionToken) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    try {
      const metaData = await getMetadata(type, seriesIdObs);
      const observations = await getObservations(
        type,
        seriesIdObs,
        timeStartObs,
        timeEndObs
      );
      if(calId && seriesIdSim) {
        const simulation = await getSimulation(
          calId,
          seriesIdSim,
          timeStartSim,
          timeEndSim
        );
        const response = assembleResponse(metaData, observations, simulation);
        res.status(200).json(response);
      } else {
        const response = assembleResponse(metaData, observations)
        res.status(200).json(response);
      }
    } catch (error: unknown) {
      console.error(error);
      res.status(500);
    } finally {
      res.end();
    }
  }
}

async function getMetadata(type: string, seriesId: string): Promise<Metadata> {
  const metaDataUrl = `https://alerta.ina.gob.ar/a6/obs/${type}/series/${seriesId}`;
  const response = await fetch(metaDataUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

async function getObservations(
  type: string,
  seriesId: string,
  timestart: string,
  timeend: string
): Promise<[ObservationsResponse]> {
  const obsUrl = `https://alerta.ina.gob.ar/a6/obs/${type}/series/${seriesId}/observaciones?timestart=${timestart}&timeend=${timeend}`;
  const response = await fetch(obsUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

async function getSimulation(
  calId: string,
  seriesId: string,
  timestart: string,
  timeend: string
): Promise<SimulationResponse> {
  const simUrl = `https://alerta.ina.gob.ar/a6/sim/calibrados/${calId}/corridas/last?series_id=${seriesId}&timestart=${timestart}&timeend=${timeend}&includeProno=true&group_by_qualifier=true`;
  const response = await fetch(simUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

function assembleResponse(
  metadata: Metadata,
  observations: ObservationsResponse[],
  simulation?: SimulationResponse
): HydrometricForecastResponse {
  const estacion_: Station = {
    nombre: metadata.estacion.nombre,
    provincia: metadata.estacion.provincia,
    rio: metadata.estacion.rio,
  };
  const var_: Var = {
    nombre: metadata.var.nombre,
  };
  const unidades_: Units = {
    nombre: metadata.unidades.nombre,
  };
  const percentiles_ref_: Record<number,number> = (metadata.percentiles_ref) ? metadata.percentiles_ref : {}
  const metadata_: Metadata = {
    estacion: estacion_,
    var: var_,
    unidades: unidades_,
    percentiles_ref: percentiles_ref_
  };
  const observations_ = observations.map((o: ObservationsResponse) =>
    createObs(o)
  );
  if(simulation) {
    const simulation_ = {
      forecast_date: simulation.forecast_date,
      series: simulation.series.map((s: SeriesItem) => createForecast(s)).flat(),
    };
    const response: HydrometricForecastResponse = {
      metadata: metadata_,
      observations: observations_,
      simulation: simulation_,
    };

    return response;

  } else {
    const response: HydrometricForecastResponse = {
      metadata: metadata_,
      observations: observations_
    };

    return response;
  }
}

function createObs(observation: ObservationsResponse) {
  const r: ObservationsResponse = {
    timestart: observation.timestart,
    valor: observation.valor,
  };
  return r;
}

function createForecast(seriesItem: SeriesItem) {
  seriesItem.series_id;
  const pronosticos = seriesItem.pronosticos.map((p) => {
    const r: Forecast = { time: p.timestart, value: parseFloat(p.valor.toString()), qualifier: seriesItem.qualifier };
    return r;
  });
  const ser: ModifSeriesItem = {
    series_id: seriesItem.series_id,
    qualifier: seriesItem.qualifier,
    pronosticos: pronosticos,
  };
  return ser;
}

export type HydrometricForecastResponse = {
  metadata: Metadata;
  observations: ObservationsResponse[];
  simulation?: ModifSimulationResponse;
};

type ObservationsResponse = {
  timestart: string;
  valor: number;
};

type SimulationResponse = {
  forecast_date: string;
  series: SeriesItem[];
};

type SeriesItem = {
  series_id: number;
  qualifier: string;
  pronosticos: ObservationsResponse[];
};

type ModifSimulationResponse = {
  forecast_date: string;
  series: ModifSeriesItem[];
};

type ModifSeriesItem = {
  series_id: number;
  qualifier: string;
  pronosticos: Forecast[];
};

type Forecast = {
  time: string;
  value: number;
  qualifier: string;
};
