import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import dotenv from "dotenv";

import { allowCors } from "../../middleware/cors";

dotenv.config();

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pageId } = req.query;
    const { domain } = req.query;
    const auth = req.headers.authorization;

    if (!auth) {
      return res
        .status(401)
        .json({ error: "Authorization header is required" });
    }

    if (!domain) {
      return res.status(400).json({ error: "Domain parameter is required" });
    }

    const baseUrl = `https://${domain}.atlassian.net/wiki`;

    const response = await axios.get(`${baseUrl}/api/v2/pages/${pageId}`, {
      params: { "body-format": "styled_view" },
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error("Get page error:", error);
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      return res.status(axiosError.response?.status || 500).json({
        error: axiosError.response?.data?.message || "Internal server error",
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default allowCors(handler);
