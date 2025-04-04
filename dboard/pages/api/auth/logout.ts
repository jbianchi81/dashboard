import { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { serialize } from "cookie";

const url = "https://alerta.ina.gob.ar/a6/logout";

export default async function LogOut(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    res.setHeader(
      "Set-Cookie",
      serialize("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: -1, // Expire the cookie
        path: "/",
      })
    );

    res.status(200).json({ message: "Logged out" });
    res.end();
  } catch (error: unknown) {
    reportError(error as Error);
    return undefined;
  }
}
