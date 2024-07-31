import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";

const token = process.env.token;

export default async function getShortTermData(
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

  try {
    const metaData = await getMetadata(type, seriesIdObs);
    const observations = await getObservations(
      type,
      seriesIdObs,
      timeStartObs,
      timeEndObs
    );
    const simulation = await getSimulation(
      calId,
      seriesIdSim,
      timeStartSim,
      timeEndSim
    );
    const response = assembleResponse(metaData, observations, simulation);
    res.status(200).json(response);
  } catch (error: unknown) {
    console.error(error);
    res.status(500);
  } finally {
    res.end();
  }
}

async function getMetadata(
  type: string,
  seriesId: string
): Promise<MetadataResponse> {
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
  const simUrl = `https://alerta.ina.gob.ar/a6/sim/calibrados/${calId}/corridas/last?series_id=${seriesId}&timestart=${timestart}&timeend=${timeend}`;
  const response = await fetch(simUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

function assembleResponse(
  metadata: MetadataResponse,
  observations: ObservationsResponse[],
  simulation: SimulationResponse
) {
  const estacion_: Estacion = {
    nombre: metadata.estacion.nombre,
    provincia: metadata.estacion.provincia,
    rio: metadata.estacion.rio,
  };
  const var_: Var = {
    nombre: metadata.var.nombre,
  };
  const unidades_: Unidades = {
    nombre: metadata.unidades.nombre,
  };
  const metadata_: MetadataResponse = {
    estacion: estacion_,
    var: var_,
    unidades: unidades_,
  };
  const observations_ = observations.map((o: ObservationsResponse) =>
    createObs(o)
  );
  const simulation_ = {
    series: simulation.series.map((s: SeriesItem) => createForecast(s)).flat(),
  };
  const response: shortTermResponse = {
    metadata: metadata_,
    observations: observations_,
    simulation: simulation_,
  };

  return response;
}

function createObs(observation: ObservationsResponse) {
  const r: ObservationsResponse = {
    timestart: observation.timestart,
    valor: observation.valor,
  };
  return r;
}

function createForecast(seriesItem: SeriesItem) {
  const pronosticos = seriesItem.pronosticos.map((p) => {
    const r: Forecast = { time: p[0], value: p[2], qualifier: p[3] };
    return r;
  });
  const ser: ModifSeriesItem = { pronosticos };
  return ser;
}

type shortTermResponse = {
  metadata: MetadataResponse;
  observations: ObservationsResponse[];
  simulation: ModifSimulationResponse;
};

type ObservationsResponse = {
  timestart: string;
  valor: number;
};

type SimulationResponse = {
  series: SeriesItem[];
};

type SeriesItem = {
  series_id: number;
  qualifier: string;
  pronosticos: string[][];
};

type ModifSimulationResponse = {
  series: ModifSeriesItem[];
};

type ModifSeriesItem = {
  pronosticos: Forecast[];
};

type Forecast = {
  time: string;
  value: string;
  qualifier: string;
};

type MetadataResponse = {
  estacion: Estacion;
  var: Var;
  unidades: Unidades;
};

type Estacion = {
  nombre: string;
  provincia: string;
  rio: string;
};

type Var = {
  nombre: string;
};

type Unidades = {
  nombre: string;
};
