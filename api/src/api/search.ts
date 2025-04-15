import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import dotenv from "dotenv";

import { allowCors } from "../middleware/cors";

dotenv.config();

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cql, domain, limit, cursor, start } = req.query;
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

    // Build query parameters
    const queryParams: Record<string, unknown> = { cql };

    if (limit) {
      queryParams.limit = limit;
    }

    if (cursor) {
      queryParams.cursor = cursor;
    }

    if (start !== undefined) {
      queryParams.start = start;
    }

    const response = await axios.get(`${baseUrl}/rest/api/search`, {
      params: queryParams,
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    });

    // Extract cursor information from response
    const data = response.data;
    if (data._links && data._links.next) {
      const nextUrl = new URL(data._links.next, baseUrl);
      data.nextCursor = nextUrl.searchParams.get("cursor");
    }

    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Search error:", error);
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
