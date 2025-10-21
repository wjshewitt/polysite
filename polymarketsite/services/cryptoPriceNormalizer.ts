import { CryptoPrice } from "@/types/polymarket";

const toStringOrDefault = (value: unknown, defaultValue = "0"): string => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }

  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  return defaultValue;
};

const normalizeSymbol = (symbol: unknown): string | null => {
  if (!symbol) {
    return null;
  }

  const raw = String(symbol).trim();
  if (!raw) {
    return null;
  }

  return raw.toUpperCase().replace("-USD", "USDT");
};

const normalizeTimestamp = (timestamp: unknown): number => {
  if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
    return timestamp;
  }

  if (typeof timestamp === "string" && timestamp.trim() !== "") {
    const parsed = Number(timestamp);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    const fromDate = Date.parse(timestamp);
    if (!Number.isNaN(fromDate)) {
      return fromDate;
    }
  }

  return Date.now();
};

interface RawCryptoLike {
  symbol?: unknown;
  asset?: unknown;
  asset_id?: unknown;
  price?: unknown;
  value?: unknown;
  change24h?: unknown;
  volume24h?: unknown;
  marketCap?: unknown;
  timestamp?: unknown;
  [key: string]: unknown;
}

export const normalizeCryptoPricePayload = (
  raw: unknown,
  fallbackSymbol?: string,
): CryptoPrice | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as RawCryptoLike;

  const symbol =
    normalizeSymbol(data.symbol) ||
    normalizeSymbol(data.asset) ||
    normalizeSymbol(data.asset_id) ||
    normalizeSymbol(fallbackSymbol);

  if (!symbol) {
    return null;
  }

  const priceSource =
    data.value !== undefined && data.value !== null
      ? data.value
      : data.price;

  const price = toStringOrDefault(priceSource, "0");

  return {
    symbol,
    price,
    change24h: toStringOrDefault(data.change24h),
    volume24h: toStringOrDefault(data.volume24h),
    marketCap: toStringOrDefault(data.marketCap),
    timestamp: normalizeTimestamp(data.timestamp),
  };
};
