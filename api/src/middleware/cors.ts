import { VercelRequest, VercelResponse } from "@vercel/node";

type HandlerFunction = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<VercelResponse | void>;

export const allowCors =
  (fn: HandlerFunction) => async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return await fn(req, res);
  };
