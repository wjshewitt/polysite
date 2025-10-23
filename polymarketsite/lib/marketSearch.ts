import { gammaAPI, GammaEvent } from "@/services/gamma";
import { buildEventOutcomes } from "@/lib/markets";
import type { EventOutcomes, NormalizedMarket } from "@/types/markets";
import type { SelectedMarketState } from "@/types/polymarket";

// Cache for search results (1 minute TTL)
const searchCache = new Map<
  string,
  { data: EventOutcomes[]; timestamp: number }
>();
const CACHE_TTL = 60000; // 1 minute

/**
 * Search markets with query string
 * Returns EventOutcomes with normalized markets
 */
export async function searchMarkets(
  query: string,
  limit = 20,
): Promise<EventOutcomes[]> {
  const cacheKey = `search:${query}:${limit}`;
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Fetch all markets from Gamma API with pagination
    const events = await gammaAPI.fetchAllEvents({
      order: "volume",
      ascending: false,
      closed: false,
      active: true,
    });

    // Convert to EventOutcomes
    const eventOutcomes = events
      .map((event) => buildEventOutcomes(event))
      .filter((outcome): outcome is EventOutcomes => outcome !== null);

    // Client-side filter by query
    const filtered = query.trim()
      ? eventOutcomes.filter((outcome) => {
          const lowerQuery = query.toLowerCase();

          // Search in event title
          if (outcome.title.toLowerCase().includes(lowerQuery)) return true;

          // Search in market names
          return outcome.markets.some(
            (market) =>
              market.title.toLowerCase().includes(lowerQuery) ||
              market.displayName?.toLowerCase().includes(lowerQuery),
          );
        })
      : eventOutcomes;

    const result = filtered.slice(0, limit);

    // Cache the result
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error("[marketSearch] Error searching markets:", error);
    throw error;
  }
}

/**
 * Get top markets by volume (for dropdown default list)
 */
export async function getTopMarkets(limit = 20): Promise<EventOutcomes[]> {
  return searchMarkets("", limit);
}

/**
 * Convert NormalizedMarket → SelectedMarketState
 */
export function toSelectedMarketState(
  market: NormalizedMarket,
  event: GammaEvent,
): SelectedMarketState {
  return {
    marketId: market.id,
    conditionId: market.conditionId,
    slug: market.slug,
    name: market.displayName || market.title,
    eventId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    yesTokenId: market.yesTokenId,
    noTokenId: market.noTokenId,
    clobTokenIds: market.clobTokenIds,
    icon: market.icon || event.icon,
    image: market.image || event.image,
    selectedAt: Date.now(),
  };
}

/**
 * Get market by ID or slug for validation
 */
export async function getMarketById(
  identifier: string,
): Promise<SelectedMarketState | null> {
  try {
    // Try fetching as event slug first
    const event = await gammaAPI.fetchEventBySlug(identifier);
    if (event && event.markets.length > 0) {
      const markets = gammaAPI.getNormalizedMarketsFromEvent(event);
      // Return primary market
      if (markets.length > 0) {
        return toSelectedMarketState(markets[0], event);
      }
    }
    // If event is null (not found), continue to try fetching by market ID
  } catch (error: any) {
    // Check if it's a 404 - expected for old/removed markets
    const is404 =
      error?.message?.includes("404") ||
      error?.message?.includes("Gamma API error: 404");
    if (!is404 && process.env.NODE_ENV === "development") {
      console.debug("[marketSearch] Event fetch failed:", error?.message);
    }
    // Continue to try market slug
  }

  try {
    // Try fetching as market slug
    const market = await gammaAPI.fetchMarketBySlug(identifier);
    if (market) {
      const normalized = gammaAPI.normalizeMarket(market);

      // Create minimal event data from market
      const syntheticEvent: GammaEvent = {
        id: market.id,
        ticker: market.question,
        slug: market.slug,
        title: market.question,
        description: "",
        startDate: new Date(market.startDate).toISOString(),
        creationDate: new Date(market.startDate).toISOString(),
        endDate: new Date(market.endDate).toISOString(),
        active: market.active,
        closed: market.closed,
        archived: false,
        featured: false,
        restricted: false,
        liquidity: parseFloat(market.liquidity) || 0,
        volume: parseFloat(market.volume) || 0,
        openInterest: 0,
        commentCount: 0,
        markets: [market],
      };

      return toSelectedMarketState(normalized, syntheticEvent);
    }
  } catch (error: any) {
    // Market not found - this is expected for expired/removed markets
    // Only log non-404 errors in development
    const is404 =
      error?.message?.includes("404") ||
      error?.message?.includes("Gamma API error: 404");
    if (!is404 && process.env.NODE_ENV === "development") {
      console.debug("[marketSearch] Market fetch failed:", error?.message);
    }
  }

  return null;
}

/**
 * Validate stored market (check if still active/valid)
 */
export async function validateStoredMarket(
  stored: SelectedMarketState,
): Promise<boolean> {
  try {
    // Check if market still exists and is active
    const identifier = stored.slug || stored.marketId;
    if (process.env.NODE_ENV === "development") {
      console.debug(`[marketSearch] Validating market: ${identifier}`);
    }
    const market = await getMarketById(identifier);

    if (!market) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[marketSearch] Market not found: ${identifier}`);
      }
      return false;
    }

    // Additional validation: check if not too old (7 days)
    const age = Date.now() - stored.selectedAt;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (age > maxAge) {
      return false;
    }

    return true;
  } catch (error) {
    // Validation failure is expected for expired/removed markets
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[marketSearch] Market validation failed:",
        stored.slug || stored.marketId,
      );
    }
    return false;
  }
}

/**
 * Clear search cache (useful for testing or manual refresh)
 */
export function clearSearchCache(): void {
  searchCache.clear();
}
