import {
  PolymarketEvent,
  PolymarketMarket,
  MarketStats,
} from "@/types/polymarket";
import {
  normalizeEventMarkets,
  normalizeEventPrimaryMarket,
  normalizeMarketData,
  buildEventOutcomes,
} from "@/lib/markets";
import type { NormalizedMarket, EventOutcomes } from "@/types/markets";
import { cachedFetch } from "@/services/marketsCache";
import {
  filterGammaEvents,
  filterGammaMarkets,
  logFilterStats,
  getFilterStats,
} from "@/lib/marketFilters";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const USE_API_PROXY = typeof window !== "undefined"; // Use proxy on client-side
const API_PROXY_BASE = "/api/gamma";

export interface GammaEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  resolutionSource?: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image?: string;
  icon?: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  commentCount: number;
  markets: GammaMarket[];
  tags?: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
  spread?: number;
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  clobTokenIds?: string;
  endDate: string;
  startDate: string;
}

export interface FetchEventsParams {
  limit?: number;
  offset?: number;
  order?: "id" | "volume" | "liquidity" | "startDate" | "endDate";
  ascending?: boolean;
  closed?: boolean;
  archived?: boolean;
  active?: boolean;
  tag_id?: string;
  exclude_tag_id?: string;
}

export interface FetchMarketsParams {
  limit?: number;
  offset?: number;
  closed?: boolean;
  active?: boolean;
  archived?: boolean;
  tag_id?: string;
  exclude_tag_id?: string;
}

export interface FetchCommentsParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  parent_entity_type?: "Event" | "Series" | "market";
  parent_entity_id?: number;
  get_positions?: boolean;
  holders_only?: boolean;
}

export interface CommentProfile {
  name?: string;
  pseudonym?: string;
  displayUsernamePublic?: boolean;
  bio?: string;
  isMod?: boolean;
  isCreator?: boolean;
  proxyWallet?: string;
  baseAddress?: string;
  profileImage?: string;
  profileImageOptimized?: any;
  positions?: Array<{
    tokenId: string;
    positionSize: string;
  }>;
}

export interface CommentReaction {
  id: string;
  commentID: number;
  reactionType: string;
  icon?: string;
  userAddress: string;
  createdAt: string;
  profile?: CommentProfile;
}

export interface GammaComment {
  id: string;
  body?: string;
  parentEntityType?: string;
  parentEntityID?: number;
  parentCommentID?: string;
  userAddress?: string;
  replyAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: CommentProfile;
  reactions?: CommentReaction[];
  reportCount?: number;
  reactionCount?: number;
}

class GammaAPIService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 60 seconds cache
  private cacheVersion = "v2";

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch all events with pagination (for comprehensive search)
   */
  async fetchAllEvents(params: Omit<FetchEventsParams, 'limit' | 'offset'> = {}): Promise<GammaEvent[]> {
    const baseParams = {
      order: "volume" as const,
      ascending: false,
      closed: false,
      archived: false,
      active: true,
      ...params,
    };

    const cacheKey = `${this.cacheVersion}:all-events:${JSON.stringify(baseParams)}`;
    
    // Check cache
    const cached = this.getCached<GammaEvent[]>(cacheKey);
    if (cached) {
      console.log(`[GammaAPI] Using cached all events (${cached.length} events)`);
      return cached;
    }

    const fetcher = async () => {
      const allEvents: GammaEvent[] = [];
      const pageSize = 100; // Fetch 100 at a time to stay under rate limits
      let offset = 0;
      let hasMore = true;

      console.log('[GammaAPI] Fetching all events with pagination...');

      while (hasMore) {
        const events = await this.fetchEvents({
          ...baseParams,
          limit: pageSize,
          offset,
        });

        if (events.length === 0) {
          hasMore = false;
        } else {
          allEvents.push(...events);
          offset += events.length;
          
          // If we got fewer results than requested, we've reached the end
          if (events.length < pageSize) {
            hasMore = false;
          }

          // Safety: stop after 500 events (5 pages) to avoid excessive API calls
          if (allEvents.length >= 500) {
            console.log(`[GammaAPI] Reached safety limit of 500 events`);
            hasMore = false;
          }
        }
      }

      console.log(`[GammaAPI] Fetched ${allEvents.length} total events`);
      this.setCache(cacheKey, allEvents);
      return allEvents;
    };

    try {
      return await cachedFetch(cacheKey, fetcher);
    } catch (error) {
      console.warn("[GammaAPI] Error fetching all events:", error);
      throw error;
    }
  }

  /**
   * Fetch events (collections of related markets)
   * Use this to get top markets with all their details
   */
  async fetchEvents(params: FetchEventsParams = {}): Promise<GammaEvent[]> {
    const defaultParams: FetchEventsParams = {
      limit: 100,
      offset: 0,
      order: "volume",
      ascending: false,
      closed: false,
      archived: false,
      active: true,
      ...params,
    };

    const queryString = this.buildQueryString(defaultParams);
    const cacheKey = `${this.cacheVersion}:events:${queryString}`;

    // Check cache
    const cached = this.getCached<GammaEvent[]>(cacheKey);
    if (cached) {
      console.log(`[GammaAPI] Using cached events for: ${queryString}`);
      return cached;
    }

    const fetcher = async () => {
      const baseUrl = USE_API_PROXY ? API_PROXY_BASE : GAMMA_API_BASE;
      const url = `${baseUrl}/events?${queryString}`;

      console.log(`[GammaAPI] Fetching events from: ${url}`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`[GammaAPI] Error response:`, errorText);
        
        // Check if we got HTML instead of JSON (likely a 404 page)
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          console.warn(`[GammaAPI] Received HTML instead of JSON - check if API route exists: ${url}`);
          throw new Error(`API route not found or returning HTML instead of JSON. URL: ${url}`);
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Check content-type before parsing JSON
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const errorText = await response.text().catch(() => "");
        console.warn(`[GammaAPI] Expected JSON but got ${contentType}:`, errorText);
        throw new Error(`Invalid content type: expected JSON but got ${contentType}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          `Invalid response format: expected array, got ${typeof data}`,
        );
      }

      console.log(`[GammaAPI] Successfully fetched ${data.length} events`);

      // Apply filtering
      const stats = getFilterStats(data);
      const filtered = filterGammaEvents(data);
      logFilterStats("fetchEvents", {
        ...stats,
        passed: filtered.length,
        filtered: data.length - filtered.length,
      });

      this.setCache(cacheKey, filtered);
      return filtered;
    };

    try {
      const data = await cachedFetch(cacheKey, fetcher);
      // Data is already filtered in the fetcher
      return data;
    } catch (error) {
      console.warn("[GammaAPI] Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Fetch a single event by slug
   */
  async fetchEventBySlug(slug: string): Promise<GammaEvent | null> {
    const cacheKey = `${this.cacheVersion}:event:${slug}`;

    // Check cache
    const cached = this.getCached<GammaEvent>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${GAMMA_API_BASE}/events/slug/${slug}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        // Don't throw for 404s - return null instead
        if (response.status === 404) {
          if (process.env.NODE_ENV === "development") {
            console.debug(`[GammaAPI] Event not found: ${slug}`);
          }
          return null;
        }
        
        // Check if we got HTML instead of JSON
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          if (process.env.NODE_ENV === "development") {
            console.debug(`[GammaAPI] Received HTML for event slug: ${slug}`);
          }
          return null;
        }
        
        throw new Error(`Gamma API error: ${response.status}`);
      }
      
      // Check content-type before parsing JSON
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[GammaAPI] Expected JSON for event slug ${slug} but got ${contentType}`);
        }
        return null;
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error: any) {
      // Don't log expected errors (404s, HTML responses, network errors)
      const is404 = error?.message?.includes("404");
      const isNetworkError = error?.name === "TypeError" && error?.message?.includes("fetch");
      const isTimeout = error?.name === "TimeoutError" || error?.name === "AbortError";
      
      if (!is404 && !isNetworkError && !isTimeout && process.env.NODE_ENV === "development") {
        console.debug("[GammaAPI] Error fetching event by slug:", slug, error?.message);
      }
      
      // Return null for all expected errors (don't throw)
      return null;
    }
  }

  /**
   * Fetch markets directly (individual prediction markets)
   */
  async fetchMarkets(params: FetchMarketsParams = {}): Promise<GammaMarket[]> {
    const defaultParams: FetchMarketsParams = {
      limit: 50,
      offset: 0,
      closed: false,
      active: true,
      archived: false,
      ...params,
    };

    const queryString = this.buildQueryString(defaultParams);
    const cacheKey = `${this.cacheVersion}:markets:${queryString}`;

    // Check cache
    const cached = this.getCached<GammaMarket[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const fetcher = async () => {
      const response = await fetch(`${GAMMA_API_BASE}/markets?${queryString}`);
      if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status}`);
      }
      const data = await response.json();

      // Apply filtering
      const stats = getFilterStats(data);
      const filtered = filterGammaMarkets(data);
      logFilterStats("fetchMarkets", {
        ...stats,
        passed: filtered.length,
        filtered: data.length - filtered.length,
      });

      this.setCache(cacheKey, filtered);
      return filtered;
    };

    try {
      const data = await cachedFetch(cacheKey, fetcher);
      // Data is already filtered in the fetcher
      return data;
    } catch (error) {
      console.error("Error fetching markets from Gamma API:", error);
      throw error;
    }
  }

  /**
   * Fetch a single market by slug
   */
  async fetchMarketBySlug(slug: string): Promise<GammaMarket> {
    const cacheKey = `${this.cacheVersion}:market:${slug}`;

    // Check cache
    const cached = this.getCached<GammaMarket>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const baseUrl = USE_API_PROXY ? API_PROXY_BASE : GAMMA_API_BASE;
      const url = `${baseUrl}/markets/slug/${slug}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        // Treat 404s as null (market removed/renamed)
        if (response.status === 404) {
          return null as any;
        }
        // If server returned HTML (proxy missing or route invalid), don't throw—return null
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("text/html")) {
          return null as any;
        }
        throw new Error(`Gamma API error: ${response.status}`);
      }

      // Validate content type is JSON
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return null as any;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error: any) {
      // Don't log expected errors (404s, HTML, network, timeouts)
      const is404 = error?.message?.includes("404");
      const isNetworkError = error?.name === "TypeError" && error?.message?.includes("fetch");
      const isTimeout = error?.name === "TimeoutError" || error?.name === "AbortError";
      
      if (!is404 && !isNetworkError && !isTimeout && process.env.NODE_ENV === "development") {
        console.debug("[GammaAPI] Error fetching market by slug:", slug, error?.message);
      }
      
      return null as any;
    }
  }

  /**
   * Fetch all available tags
   */
  async fetchTags(): Promise<any[]> {
    const cacheKey = `${this.cacheVersion}:tags`;

    // Check cache
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${GAMMA_API_BASE}/tags`);
      if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  }

  /**
   * Fetch sports-specific tags and metadata
   */
  async fetchSports(): Promise<any[]> {
    const cacheKey = `${this.cacheVersion}:sports`;

    // Check cache
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${GAMMA_API_BASE}/sports`);
      if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching sports:", error);
      throw error;
    }
  }

  /**
   * Fetch comments for a specific entity (event, market, or series)
   */
  async fetchComments(
    params: FetchCommentsParams = {},
  ): Promise<GammaComment[]> {
    const defaultParams: FetchCommentsParams = {
      limit: 50,
      offset: 0,
      order: "createdAt",
      ascending: false,
      get_positions: false,
      holders_only: false,
      ...params,
    };

    const queryString = this.buildQueryString(defaultParams);
    const cacheKey = `${this.cacheVersion}:comments:${queryString}`;

    // Check cache (shorter TTL for comments)
    const cached = this.getCached<GammaComment[]>(cacheKey);
    if (cached) {
      console.log(`[GammaAPI] Using cached comments for: ${queryString}`);
      return cached;
    }

    try {
      // Use API proxy on client-side to avoid CORS issues
      const baseUrl = USE_API_PROXY ? API_PROXY_BASE : GAMMA_API_BASE;
      const url = `${baseUrl}/comments?${queryString}`;

      console.log(`[GammaAPI] Fetching comments from: ${url}`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`[GammaAPI] Error response:`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          `Invalid response format: expected array, got ${typeof data}`,
        );
      }

      console.log(`[GammaAPI] Successfully fetched ${data.length} comments`);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn("[GammaAPI] Error fetching comments:", error);
      throw error;
    }
  }

  /**
   * Convert Gamma event to internal PolymarketEvent format
   */
  convertToPolymarketEvent(gammaEvent: GammaEvent): PolymarketEvent {
    return {
      id: gammaEvent.id,
      slug: gammaEvent.slug,
      title: gammaEvent.title,
      description: gammaEvent.description,
      startDate: new Date(gammaEvent.startDate).getTime(),
      endDate: new Date(gammaEvent.endDate).getTime(),
      createdAt: new Date(gammaEvent.creationDate).getTime(),
      updatedAt: Date.now(),
      image: gammaEvent.image,
      icon: gammaEvent.icon,
      active: gammaEvent.active,
      closed: gammaEvent.closed,
      archived: gammaEvent.archived,
      featured: gammaEvent.featured,
      restricted: gammaEvent.restricted,
      volume: gammaEvent.volume.toString(),
      liquidity: gammaEvent.liquidity.toString(),
      openInterest: gammaEvent.openInterest?.toString() || "0",
      commentCount: gammaEvent.commentCount,
      markets: gammaEvent.markets.map((m, index) =>
        this.convertToPolymarketMarket(m, {
          eventId: gammaEvent.id,
          outcomeIndex: index,
          totalOutcomes: gammaEvent.markets.length,
        }),
      ),
    };
  }

  /**
   * Convert Gamma market to internal PolymarketMarket format
   */
  convertToPolymarketMarket(
    gammaMarket: GammaMarket,
    options: {
      eventId?: string;
      outcomeIndex?: number;
      totalOutcomes?: number;
    } = {},
  ): PolymarketMarket {
    const outcomes = (() => {
      try {
        return JSON.parse(gammaMarket.outcomes || "[]");
      } catch (error) {
        console.warn("[GammaAPI] Failed to parse outcomes", error);
        return [];
      }
    })();

    const outcomePrices = (() => {
      try {
        return JSON.parse(gammaMarket.outcomePrices || "[]");
      } catch (error) {
        console.warn("[GammaAPI] Failed to parse outcomePrices", error);
        return [];
      }
    })();

    const clobTokenIds = (() => {
      try {
        return gammaMarket.clobTokenIds
          ? JSON.parse(gammaMarket.clobTokenIds)
          : [];
      } catch (error) {
        console.warn("[GammaAPI] Failed to parse clobTokenIds", error);
        return [];
      }
    })();

    const yesTokenId = clobTokenIds.length > 1 ? clobTokenIds[1] : undefined;
    const noTokenId = clobTokenIds.length > 0 ? clobTokenIds[0] : undefined;

    return {
      id: gammaMarket.id,
      conditionId: gammaMarket.conditionId,
      slug: gammaMarket.slug,
      question: gammaMarket.question,
      outcomes,
      outcomePrices,
      volume: gammaMarket.volume,
      liquidity: gammaMarket.liquidity,
      active: gammaMarket.active,
      closed: gammaMarket.closed,
      startDate: new Date(gammaMarket.startDate).getTime(),
      endDate: new Date(gammaMarket.endDate).getTime(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      spread: gammaMarket.spread,
      lastTradePrice: gammaMarket.lastTradePrice,
      bestBid: gammaMarket.bestBid,
      bestAsk: gammaMarket.bestAsk,
      clobTokenIds,
      negRisk: undefined,
      negRiskMarketID: undefined,
      outcomeIndex: options.outcomeIndex,
      totalOutcomes: options.totalOutcomes,
      eventId: options.eventId,
      yesTokenId,
      noTokenId,
    };
  }

  /**
   * Get market stats from a Gamma market
   */
  getMarketStats(gammaMarket: GammaMarket): MarketStats {
    const volume = parseFloat(gammaMarket.volume || "0");
    const liquidity = parseFloat(gammaMarket.liquidity || "0");

    return {
      volume24h: volume.toString(),
      totalVolume: volume.toString(),
      liquidity: liquidity.toString(),
      uniqueTraders: 0,
      totalTrades: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  getNormalizedMarketsFromEvent(event: GammaEvent): NormalizedMarket[] {
    return normalizeEventMarkets(event);
  }

  getNormalizedPrimaryMarket(event: GammaEvent): NormalizedMarket | null {
    return normalizeEventPrimaryMarket(event);
  }

  normalizeMarket(market: GammaMarket): NormalizedMarket {
    return normalizeMarketData(market);
  }

  getEventOutcomes(event: GammaEvent): EventOutcomes | null {
    return buildEventOutcomes(event);
  }
}

export const gammaAPI = new GammaAPIService();
