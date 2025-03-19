import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";

const token = process.env.token;

export default async function getWindForecast(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    type,
    estacionId,
    seriesIdWindVel,
    seriesIdWindDir,
    timeStart,
    timeEnd,
  } = req.body;

  const sessionToken = req.cookies.session;

  if (process.env.skip_login !== "true" && !sessionToken) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    try {
      const metaData = await getMetadata(type, estacionId);
      const windVelObs = await getWindVelocityObs(
        type,
        seriesIdWindVel,
        timeStart,
        timeEnd
      );
      const windDirObs = await getWindDirectionObs(
        type,
        seriesIdWindDir,
        timeStart,
        timeEnd
      );
      const response = assembleResponse(metaData, windVelObs, windDirObs);
      res.status(200).json(response);
    } catch (error: unknown) {
      console.error(error);
      res.status(500);
    } finally {
      res.end();
    }
  }
}

function assembleResponse(
  metadata: StationMetadataResponse,
  windVelocityObs: WindObservationResponse[],
  windDirectionObs: WindObservationResponse[]
): WindForecastResponse {
  const geometry_: Geometry = {
    type: metadata.geometry.type,
    coordinates: metadata.geometry.coordinates,
  };
  const properties_: Properties = {
    nombre: metadata.properties.nombre,
    pais: metadata.properties.pais,
    rio: metadata.properties.rio,
    tipo: metadata.properties.tipo,
    id: metadata.properties.id,
  };

  const metadata_: StationMetadataModifResponse = {
    geometry: geometry_,
    properties: properties_,
  };
  const response: WindForecastResponse = {
    metadata: metadata_,
    wind_velocity_obs: windVelocityObs,
    wind_direction_obs: windDirectionObs,
  };
  return response;
}

async function getMetadata(
  type: string,
  estacionId: string
): Promise<StationMetadataResponse> {
  const metaDataUrl = `https://alerta.ina.gob.ar/a6/obs/${type}/estaciones/${estacionId}?format=geojson`;
  const response = await fetch(metaDataUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

async function getWindVelocityObs(
  type: string,
  seriesIdWindVel: string,
  timeStart: string,
  timeEnd: string
): Promise<[WindObservationResponse]> {
  const windVelUrl = `https://alerta.ina.gob.ar/a6/obs/${type}/series/${seriesIdWindVel}/observaciones?timestart=${timeStart}&timeend=${timeEnd}`;
  const response = await fetch(windVelUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

async function getWindDirectionObs(
  type: string,
  seriesIdWindDir: string,
  timeStart: string,
  timeEnd: string
): Promise<[WindObservationResponse]> {
  const windDirUrl = `https://alerta.ina.gob.ar/a6/obs/${type}/series/${seriesIdWindDir}/observaciones?timestart=${timeStart}&timeend=${timeEnd}`;
  const response = await fetch(windDirUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

type WindObservationResponse = {
  tipo: string;
  series_id: number;
  timestart: string;
  timeend: string;
  nombre: string;
  descripcion: string;
  unit_id: number;
  timeupdate: string;
  valor: number;
  id: string;
};

type StationMetadataResponse = {
  type: "Feature";
  geometry: Geometry;
  properties: Properties;
};

type StationMetadataModifResponse = {
  geometry: Geometry;
  properties: Properties;
};

type Geometry = {
  type: string;
  coordinates: number[];
};

type Properties = {
  nombre: string;
  pais: string;
  rio: string;
  tipo: string;
  id: number;
};

type WindForecastResponse = {
  metadata: StationMetadataModifResponse;
  wind_velocity_obs: WindObservationResponse[];
  wind_direction_obs: WindObservationResponse[];
};
