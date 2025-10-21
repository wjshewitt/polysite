type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

let ttlMs: number = (() => {
  const envValue = process.env.NEXT_PUBLIC_MARKETS_TTL_MS;
  const parsed = envValue ? Number(envValue) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return 30000;
})();

export const setMarketsCacheTTL = (ms: number) => {
  if (Number.isFinite(ms) && ms > 0) {
    ttlMs = ms;
  }
};

export const getMarketsCacheTTL = (): number => ttlMs;

export const clearMarketsCache = () => {
  cache.clear();
};

export const isCacheEntryFresh = (key: string): boolean => {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
};

const setCacheEntry = <T>(key: string, data: T) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const getCacheEntry = <T>(key: string): T | undefined => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (!isCacheEntryFresh(key)) return undefined;
  return entry.data as T;
};

export const cachedFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> => {
  try {
    const data = await fetcher();
    setCacheEntry(key, data);
    return data;
  } catch (error) {
    const stale = cache.get(key);
    if (stale) {
      return stale.data as T;
    }
    throw error;
  }
};
