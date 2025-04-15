import Koa from "koa";
import Router from "@koa/router";
import cors from "koa-cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = new Koa();
const router = new Router();

// Remove hardcoded BASE_URL
// const BASE_URL = "https://archedata.atlassian.net/wiki";

// Search endpoint
router.get("/api/search", async (ctx) => {
  try {
    const { cql, domain, limit, cursor, start } = ctx.query;
    const auth = ctx.headers.authorization;

    if (!auth) {
      ctx.status = 401;
      ctx.body = { error: "Authorization header is required" };
      return;
    }

    if (!domain) {
      ctx.status = 400;
      ctx.body = { error: "Domain parameter is required" };
      return;
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

    ctx.body = data;
  } catch (error: unknown) {
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      ctx.status = axiosError.response?.status || 500;
      ctx.body = {
        error: axiosError.response?.data?.message || "Internal server error",
      };
      console.log(axiosError.response?.data);
    } else {
      ctx.status = 500;
      ctx.body = {
        error: "Internal server error",
      };
    }
  }
});

// Get page by ID endpoint
router.get("/api/pages/:pageId", async (ctx) => {
  try {
    const { pageId } = ctx.params;
    const { domain } = ctx.query;
    const auth = ctx.headers.authorization;

    if (!auth) {
      ctx.status = 401;
      ctx.body = { error: "Authorization header is required" };
      return;
    }

    if (!domain) {
      ctx.status = 400;
      ctx.body = { error: "Domain parameter is required" };
      return;
    }

    const baseUrl = `https://${domain}.atlassian.net/wiki`;

    const response = await axios.get(`${baseUrl}/api/v2/pages/${pageId}`, {
      params: { "body-format": "styled_view" },
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    });

    ctx.body = response.data;
  } catch (error: unknown) {
    console.error("Get page error:", error);
    if (error instanceof Error && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      ctx.status = axiosError.response?.status || 500;
      ctx.body = {
        error: axiosError.response?.data?.message || "Internal server error",
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        error: "Internal server error",
      };
    }
  }
});

app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
