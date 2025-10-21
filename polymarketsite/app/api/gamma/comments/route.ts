import { NextRequest } from "next/server";
import { proxyGammaRequest } from "../gammaProxy";

export const revalidate = 15;

export async function GET(req: NextRequest) {
  return proxyGammaRequest(req, { path: "/comments" });
}
