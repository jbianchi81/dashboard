import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";

const url = "https://alerta.ina.gob.ar/a6/login";

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const { user, password } = req.body;

  if (!user || !password) {
    res.status(401).end();
    return;
  }

  try {
    const response = await fetch(
      url + `?username=${user}&password=${password}`,
      { method: "POST" }
    );

    res.status(response.status);
    res.end();
  } catch (error: unknown) {
    reportError(error as Error);
    return undefined;
  }
}
