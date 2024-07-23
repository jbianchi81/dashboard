import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";

const url = "https://alerta.ina.gob.ar/a6/logout";

export default async function LogOut(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(url);

    res.status(response.status);
    res.end();
  } catch (error: unknown) {
    reportError(error as Error);
    return undefined;
  }
}
