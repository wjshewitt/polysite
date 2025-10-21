import { NextRequest, NextResponse } from "next/server";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

type ProxyOptions = {
  /**
   * Optional override for the upstream path; defaults to the incoming pathname.
   */
  path?: string;
  /**
   * Cache-Control header value for successful responses.
   */
  cacheControl?: string;
};

const DEFAULT_CACHE_CONTROL = "s-maxage=30, stale-while-revalidate=60";

export async function proxyGammaRequest(
  req: NextRequest,
  options: ProxyOptions = {},
) {
  const { path, cacheControl = DEFAULT_CACHE_CONTROL } = options;
  const incomingUrl = new URL(req.url);
  const targetPath = path ?? incomingUrl.pathname.replace(/^\/api\/gamma/, "");
  const upstreamUrl = new URL(`${GAMMA_API_BASE}${targetPath}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const detail = typeof body === "string" ? body : undefined;
      return NextResponse.json(
        {
          error: "Gamma API request failed",
          status: response.status,
          detail: detail ?? body,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(body, {
      status: response.status,
      headers: {
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("[GammaProxy] Upstream request error", error);
    return NextResponse.json(
      {
        error: "Gamma API request failed",
        status: 500,
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
