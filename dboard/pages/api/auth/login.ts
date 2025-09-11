import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { serialize } from "cookie";
import { v4 as uuidv4 } from "uuid";

const api_url = process.env.api_url ?? "https://alerta.ina.gob.ar/a6"

const url = `${api_url}/login`;

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
    console.debug({login_url: url + `?username=${user}&password=${password}`})
    const response = await fetch(
      url + `?username=${user}&password=${password}`,
      { method: "POST" }
    );

    if (response.status == 200) {
      const sessionToken = uuidv4();

      res.setHeader(
        "Set-Cookie",
        serialize("session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        })
      );
      res.status(200).json({ message: "Logged in" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
    res.end();
  } catch (error: unknown) {
    reportError(error as Error);
    return undefined;
  }
}
