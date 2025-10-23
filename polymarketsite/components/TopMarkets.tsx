"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { gammaAPI, GammaEvent } from "@/services/gamma";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarketDetailModal } from "@/components/MarketDetailModal";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { formatUSD, getUSDEquivalent } from "@/lib/crypto";
import { MarketOutcomes } from "@/components/markets/MarketOutcomes";
import type { EventOutcomeSummary, EventOutcomeRow } from "@/types/markets";
import { buildEventOutcomes } from "@/lib/markets";
import type { EventOutcomes } from "@/types/markets";
import { toSelectedMarketState } from "@/lib/marketSearch";
import { TrendingUp, DollarSign, Users } from "lucide-react";

export function TopMarkets() {
   const [markets, setMarkets] = useState<GammaEvent[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [filter, setFilter] = useState<"volume" | "liquidity">("volume");
   const [selectedMarket, setSelectedMarket] = useState<GammaEvent | null>(null);
   const [eventOutcomeMap, setEventOutcomeMap] = useState<
     Map<string, EventOutcomes>
   >(new Map());
   const [modalOpen, setModalOpen] = useState(false);
   const isInitialLoadRef = useRef(true);
   const lastClosedSlugRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  const hydrateEventOutcomeSet = usePolymarketStore(
    (state) => state.hydrateEventOutcomeSet,
  );
  const eventOutcomesFromStore = usePolymarketStore(
    (state) => state.eventOutcomes,
  );
  const setGlobalSelectedMarket = usePolymarketStore(
    (state) => state.setSelectedMarket,
  );
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const eventSlug = params.get("event");
    const outcomeSlug = params.get("outcome");

    if (!eventSlug && lastClosedSlugRef.current) {
      lastClosedSlugRef.current = null;
    }

    if (eventSlug && eventSlug === lastClosedSlugRef.current) {
      return;
    }

    // Only process URL params if modal is not already open
    // This prevents reopening when markets refresh
    if (eventSlug && markets.length > 0 && !modalOpen) {
      const eventMatch = markets.find((event) => event.slug === eventSlug);
      if (eventMatch) {
        setSelectedMarket(eventMatch);
        setModalOpen(true);

        if (outcomeSlug && eventOutcomesFromStore.has(eventMatch.id)) {
          const outcomes = eventOutcomesFromStore.get(eventMatch.id);
          const matchedOutcome = outcomes?.markets.find(
            (market) => market.slug === outcomeSlug,
          );
          if (matchedOutcome) {
            // pass via store selection for modal consumption
            const selectedState = toSelectedMarketState(
              matchedOutcome,
              eventMatch,
            );
            usePolymarketStore.getState().setSelectedMarket(selectedState);
          }
        }
      }
    }
  }, [searchParams, markets, eventOutcomesFromStore, modalOpen]);

   useEffect(() => {
     const fetchMarkets = async () => {
       try {
         if (isInitialLoadRef.current) {
           setLoading(true);
         }
         setError(null);

         console.log(`[TopMarkets] Fetching events with filter: ${filter}`);

         const events = await gammaAPI.fetchEvents({
           limit: 20,
           order: filter,
           ascending: false,
           closed: false,
           active: true,
         });

         console.log(`[TopMarkets] Received ${events.length} events`);
         const nextEventOutcomeMap = new Map<string, EventOutcomes>();
         events.forEach((event) => {
           const eventOutcomes = buildEventOutcomes(event);
           if (eventOutcomes) {
             nextEventOutcomeMap.set(event.id, eventOutcomes);
           }
         });

         if (nextEventOutcomeMap.size) {
           hydrateEventOutcomeSet(Array.from(nextEventOutcomeMap.values()));
         }
         setEventOutcomeMap(nextEventOutcomeMap);
         setMarkets(events);
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : String(err);
         console.warn(
           "[TopMarkets] Error fetching markets:",
           errorMessage,
           err,
         );
         setError(`Failed to load markets: ${errorMessage}`);

         // On error, only clear markets if initial load; otherwise keep existing data
         if (isInitialLoadRef.current) {
           setMarkets([]);
         }
       } finally {
         if (isInitialLoadRef.current) {
           setLoading(false);
           isInitialLoadRef.current = false;
         }
       }
     };

     // Reset isInitialLoad when filter changes to show loading on filter switch
     isInitialLoadRef.current = true;

     // Initial fetch or filter change fetch
     fetchMarkets();

     // Refresh every 30 seconds (only after initial load)
     const interval = setInterval(fetchMarkets, 30000);

     return () => {
       clearInterval(interval);
     };
   }, [filter, hydrateEventOutcomeSet]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatNumberWithUSD = (num: number): string => {
    // Markets are denominated in USDC, convert to USD equivalent
    const usdValue = getUSDEquivalent(num, "USDC", cryptoPrices);
    return formatUSD(usdValue);
  };

  const handleMarketClick = (market: GammaEvent) => {
    // Set local state for modal
    setSelectedMarket(market);
    setModalOpen(true);

    // Set global selected market (for filtering data site-wide)
    if (market.markets.length > 0) {
      const normalizedMarkets = gammaAPI.getNormalizedMarketsFromEvent(market);
      if (normalizedMarkets.length > 0) {
        const selectedState = toSelectedMarketState(
          normalizedMarkets[0],
          market,
        );
        setGlobalSelectedMarket(selectedState);
      }
    }

    // Update URL
    if (market.slug) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("event", market.slug);
      router.replace(`?${params.toString()}`);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      // Clear selected market and close modal
      if (selectedMarket?.slug) {
        lastClosedSlugRef.current = selectedMarket.slug;
      }
      setSelectedMarket(null);
      setModalOpen(false);

      // Clear URL params when modal closes
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("event");
      params.delete("outcome");
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    } else {
      setModalOpen(true);
    }
  };

  const sortedEvents = useMemo(() => {
    const eventsWithOutcomes = markets
      .map((event) => ({
        event,
        outcomes: eventOutcomeMap.get(event.id) ?? null,
      }))
      .filter(({ outcomes }) => (outcomes?.markets.length ?? 0) > 0);

    const eventsWithoutOutcomes = markets
      .map((event) => ({ event, outcomes: eventOutcomeMap.get(event.id) }))
      .filter(({ outcomes }) => !outcomes || outcomes.markets.length === 0);

    const comparator = (a: EventOutcomes | null, b: EventOutcomes | null) => {
      if (!a || !b) return 0;
      const primaryMetric = filter === "volume" ? "volume" : "liquidity";
      const av = a.markets.reduce(
        (sum, market) => sum + (market[primaryMetric] ?? 0),
        0,
      );
      const bv = b.markets.reduce(
        (sum, market) => sum + (market[primaryMetric] ?? 0),
        0,
      );
      if (av === bv) return 0;
      return bv - av;
    };

    const sorted = [...eventsWithOutcomes].sort((left, right) =>
      comparator(left.outcomes, right.outcomes),
    );

    const fallbackSorted = eventsWithoutOutcomes.sort((left, right) => {
      const lv = filter === "volume" ? left.event.volume : left.event.liquidity;
      const rv =
        filter === "volume" ? right.event.volume : right.event.liquidity;
      return rv - lv;
    });

    return [...sorted, ...fallbackSorted];
  }, [markets, eventOutcomeMap, filter]);

  return (
    <div className="panel h-full min-h-0 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-buy" />
          <h2 className="text-base sm:text-lg lg:text-xl font-mono font-bold tracking-tight">
            TOP MARKETS
          </h2>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setFilter("volume")}
            className={`px-2 md:px-3 py-1 text-[10px] sm:text-xs font-mono transition-colors ${
              filter === "volume"
                ? "bg-buy text-success-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <span className="hidden sm:inline">BY </span>VOLUME
          </button>
          <button
            onClick={() => setFilter("liquidity")}
            className={`px-2 md:px-3 py-1 text-[10px] sm:text-xs font-mono transition-colors ${
              filter === "liquidity"
                ? "bg-buy text-success-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <span className="hidden sm:inline">BY </span>LIQUIDITY
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && markets.length === 0 && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground font-mono text-xs sm:text-sm">
              LOADING MARKETS...
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center p-4 min-h-[200px]">
          <div className="text-center">
            <div className="text-sell font-mono text-xs sm:text-sm mb-2">
              ⚠️ {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && markets.length === 0 && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-muted-foreground font-mono text-xs sm:text-sm">
            No markets found
          </div>
        </div>
      )}

      {/* Markets List - Scrollable */}
      {!loading && !error && markets.length > 0 && (
        <ScrollArea className="flex-1 min-h-0 -mx-4 px-4">
          <div className="space-y-2 pr-2">
            {sortedEvents.map(({ event, outcomes }, index) => {
              const eventMarkets = outcomes?.markets ?? [];
              const fallbackMarket = event.markets[0];
              const primaryMarket =
                eventMarkets[0] ??
                (fallbackMarket
                  ? gammaAPI.normalizeMarket(fallbackMarket)
                  : null);

              if (!primaryMarket) return null;

              return (
                <div
                  key={event.id}
                  onClick={() => handleMarketClick(event)}
                  className="border border-border bg-card p-3 hover:bg-muted transition-colors cursor-pointer"
                >
                  {/* Market Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        {event.featured && (
                          <span className="text-xs font-mono text-buy">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <h3 className="font-mono text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                        {event.title}
                      </h3>
                    </div>
                    {event.icon && (
                      <img
                        src={event.icon}
                        alt=""
                        className="w-10 h-10 object-cover flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Outcomes: prefer compact multi-outcome summary when available */}
                  {outcomes?.summary?.isMultiOutcome ? (
                    (() => {
                      const summary = outcomes.summary as EventOutcomeSummary;
                      const rows = (summary.rankedOutcomes || []).slice(0, 3);
                      const maxProb = rows.reduce(
                        (m, r) => (r.probability > m ? r.probability : m),
                        0,
                      );
                      const onRowClick = (row: EventOutcomeRow) => {
                        try {
                          const state = usePolymarketStore.getState();
                          const params = new URLSearchParams(
                            searchParams?.toString() ?? "",
                          );
                          if (event.slug) params.set("event", event.slug);
                          // Try to find the outcome slug in hydrated markets
                          const hydrated = eventOutcomeMap.get(event.id);
                          const match = hydrated?.markets.find(
                            (m) => m.id === row.marketId,
                          );
                          if (match) {
                            // Create SelectedMarketState from match and event
                            const selectedState = toSelectedMarketState(
                              match,
                              event,
                            );
                            state.setSelectedMarket(selectedState);
                            if (match.slug) params.set("outcome", match.slug);
                          }
                          router.replace(`?${params.toString()}`);
                          setSelectedMarket(event);
                          setModalOpen(true);
                        } catch (e) {
                          console.error("TopMarkets row click error", e);
                        }
                      };

                      return (
                        <div className="mb-2 space-y-1">
                          {rows.map((row) => {
                            const width = maxProb
                              ? (row.probability / maxProb) * 100
                              : 0;
                            const tierColor =
                              row.tier === "favorite"
                                ? "bg-buy/20"
                                : row.tier === "contender"
                                  ? "bg-neutral/20"
                                  : "bg-muted";
                            const textColor =
                              row.tier === "favorite"
                                ? "text-buy"
                                : row.tier === "contender"
                                  ? "text-neutral"
                                  : "text-foreground";
                            return (
                              <button
                                key={`${row.marketId}-${row.rank}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRowClick(row);
                                }}
                                className="relative w-full text-left border border-border bg-card px-2 py-1 overflow-hidden hover:bg-muted/50 transition-colors"
                              >
                                <div
                                  className={`absolute inset-y-0 left-0 ${tierColor}`}
                                  style={{ width: `${width}%` }}
                                />
                                <div className="relative z-10 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-muted-foreground font-mono">
                                      #{row.rank}
                                    </span>
                                    <span
                                      className={`font-mono font-semibold truncate ${textColor}`}
                                    >
                                      {row.name}
                                    </span>
                                  </div>
                                  <div className="font-mono font-bold">
                                    {(row.probability * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                          {summary.totalOutcomes > rows.length && (
                            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                              +{summary.totalOutcomes - rows.length} more
                              outcomes
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : eventMarkets.length ? (
                    <div className="mb-2 space-y-2">
                      {eventMarkets.slice(0, 4).map((marketData) => {
                        const isMultiOutcome =
                          marketData.type === "multi" ||
                          eventMarkets.length > 1;
                        return (
                          <div
                            key={marketData.id}
                            className="border border-border bg-card hover:bg-muted transition-colors"
                          >
                            {marketData.primaryOutcome ? (
                              <div className="flex items-center justify-between px-2 py-1 text-[10px] sm:text-xs font-mono border-b border-border/60">
                                <span className="text-muted-foreground">
                                  {marketData.primaryOutcome.name}
                                </span>
                                <span className="font-bold text-buy">
                                  {(
                                    marketData.primaryOutcome.probability * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-[10px] sm:text-xs font-mono border-b border-border/60 text-muted-foreground">
                                {marketData.title}
                              </div>
                            )}
                            <MarketOutcomes
                              market={marketData}
                              hidePrimary={true}
                              hideNoBars={isMultiOutcome}
                            />
                          </div>
                        );
                      })}
                      {eventMarkets.length > 4 && (
                        <div className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                          +{eventMarkets.length - 4} more outcomes
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-[11px] sm:text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-neutral" />
                      <span className="text-muted-foreground">Vol:</span>
                      <span
                        className="text-foreground font-semibold"
                        title={`${event.volume} USDC`}
                      >
                        {formatNumberWithUSD(event.volume)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-buy" />
                      <span className="text-muted-foreground">Liq:</span>
                      <span
                        className="text-foreground font-semibold"
                        title={`${event.liquidity} USDC`}
                      >
                        {formatNumberWithUSD(event.liquidity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground font-semibold">
                        {event.commentCount}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[10px] sm:text-xs font-mono bg-background text-muted-foreground px-2 py-0.5 border border-border"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Footer - Fixed */}
      <div className="mt-3 pt-3 border-t border-border flex-shrink-0">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted-foreground">
          <span>LIVE DATA FROM GAMMA API</span>
          <span>{loading ? "UPDATING..." : `${markets.length} MARKETS`}</span>
        </div>
      </div>

      {/* Market Detail Modal */}
      <MarketDetailModal
        market={selectedMarket}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
