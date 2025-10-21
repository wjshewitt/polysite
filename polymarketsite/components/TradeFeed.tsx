"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { formatPrice, formatTimestamp, formatLargeNumber } from "@/lib/utils";
import { MarketDetailModal } from "@/components/MarketDetailModal";
import { TradeDetailModal } from "@/components/TradeDetailModal";
import { gammaAPI, GammaEvent } from "@/services/gamma";
import { Trade } from "@/types/polymarket";
import { GlobalBusynessIndicator } from "@/components/GlobalBusynessIndicator";

interface TradeFeedProps {
  overrideTrades?: Trade[];
  overrideFilters?: {
    minValue?: number;
    highConvictionOnly?: boolean;
  };
}

export function TradeFeed({
  overrideTrades,
  overrideFilters,
}: TradeFeedProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allTrades = usePolymarketStore((state) => state.trades);
  const [displayedTrades, setDisplayedTrades] = useState<Trade[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<GammaEvent | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [totalOutcomes, setTotalOutcomes] = useState<number | undefined>(
    undefined,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter states (use override if provided)
  const [minValue, setMinValue] = useState<number>(
    overrideFilters?.minValue || 0,
  );
  const [highConvictionOnly, setHighConvictionOnly] = useState(
    overrideFilters?.highConvictionOnly || false,
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Use override trades if provided
  const sourceTrades = overrideTrades || allTrades;
  const hideFilters = !!overrideTrades; // Hide filters when using override

  // Filter trades based on criteria
  const filterTrades = useCallback(
    (trades: Trade[]) => {
      return trades.filter((trade) => {
        // Calculate trade value
        const tradeValue = parseFloat(trade.price) * parseFloat(trade.size);

        // Filter by minimum value
        if (minValue > 0 && tradeValue < minValue) {
          return false;
        }

        // Filter by high conviction (extreme prices near 0 or 1)
        if (highConvictionOnly) {
          const price = parseFloat(trade.price);
          const isHighConviction = price <= 0.15 || price >= 0.85;
          if (!isHighConviction) {
            return false;
          }
        }

        return true;
      });
    },
    [minValue, highConvictionOnly],
  );

  // Sync override filter values
  useEffect(() => {
    if (overrideFilters?.minValue !== undefined) {
      setMinValue(overrideFilters.minValue);
    }
    if (overrideFilters?.highConvictionOnly !== undefined) {
      setHighConvictionOnly(overrideFilters.highConvictionOnly);
    }
  }, [overrideFilters]);

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isAtTop = scrollTop < 50; // Within 50px of top

    // User is scrolling if not at top
    setIsUserScrolling(!isAtTop);
    setAutoScroll(isAtTop);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset auto-scroll after 3 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollTop < 50) {
        setAutoScroll(true);
        setIsUserScrolling(false);
      }
    }, 3000);
  }, []);

  // Auto-scroll to top when new trades arrive (only if auto-scroll is enabled)
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current && !isPaused) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [displayedTrades, autoScroll, isPaused]);

  // Update displayed trades only when not paused, with filters applied
  useEffect(() => {
    if (!isPaused) {
      setDisplayedTrades(filterTrades(sourceTrades));
    }
  }, [sourceTrades, isPaused, filterTrades]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTradeClick = async (trade: Trade) => {
    setSelectedTrade(trade);
    setTradeModalOpen(true);

    // Try to get market info to determine total outcomes
    try {
      const state = usePolymarketStore.getState();
      let foundOutcomes: number | undefined;

      // Try to find the market data by token ID
      state.updateEventOutcomeByToken(trade.asset, (marketData) => {
        if (marketData && marketData.totalOutcomes) {
          foundOutcomes = marketData.totalOutcomes;
        }
        return marketData;
      });

      setTotalOutcomes(foundOutcomes);
    } catch (error) {
      console.error("Error getting market outcomes:", error);
      setTotalOutcomes(undefined);
    }
  };

  const handleViewMarket = (eventSlug?: string, outcomeTokenId?: string) => {
    try {
      console.log("[TradeFeed] handleViewMarket called", {
        eventSlug,
        outcomeTokenId,
      });

      // Close the trade modal first
      setTradeModalOpen(false);

      // If we have an eventSlug, navigate using URL params (like TopMarkets does)
      if (eventSlug) {
        console.log("[TradeFeed] Navigating to event:", eventSlug);
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        params.set("event", eventSlug);

        // If we have a token ID, try to find the outcome slug
        if (outcomeTokenId) {
          const state = usePolymarketStore.getState();
          // Search through eventOutcomes to find the market
          state.eventOutcomes.forEach((eventOutcome) => {
            const market = eventOutcome.markets.find(
              (m) =>
                m.yesTokenId === outcomeTokenId ||
                m.noTokenId === outcomeTokenId,
            );
            if (market?.slug) {
              params.set("outcome", market.slug);
              state.setSelectedMarket(market.id);
            }
          });
        }

        // Navigate using URL params - this will trigger the modal to open via URL watching
        router.push(`?${params.toString()}`);
        return;
      }

      // Fallback: try to find the event by token ID in the store
      if (outcomeTokenId) {
        console.log(
          "[TradeFeed] No eventSlug provided, looking up by token ID:",
          outcomeTokenId,
        );
        const state = usePolymarketStore.getState();
        let foundEventSlug: string | null = null;
        let foundOutcomeSlug: string | null = null;

        // Search through eventOutcomes map to find the event and market
        state.eventOutcomes.forEach((eventOutcome) => {
          const market = eventOutcome.markets.find(
            (m) =>
              m.yesTokenId === outcomeTokenId || m.noTokenId === outcomeTokenId,
          );
          if (market) {
            // Get the event slug from EventOutcomes
            foundEventSlug = eventOutcome.slug;
            foundOutcomeSlug = market.slug;
            state.setSelectedMarket(market.id);
          }
        });

        if (foundEventSlug) {
          console.log(
            "[TradeFeed] Successfully found event slug from token:",
            foundEventSlug,
          );
          const params = new URLSearchParams(searchParams?.toString() ?? "");
          params.set("event", foundEventSlug);
          if (foundOutcomeSlug) {
            params.set("outcome", foundOutcomeSlug);
          }
          router.push(`?${params.toString()}`);
          return;
        } else {
          console.warn(
            "[TradeFeed] Could not find event slug for token:",
            outcomeTokenId,
            "- Market may not be loaded yet",
          );
        }
      }

      // If we get here, we couldn't find the market
      console.error(
        "[TradeFeed] Unable to view market - no eventSlug or token lookup failed",
      );
    } catch (error) {
      console.error("[TradeFeed] Error in handleViewMarket:", error);
    }
  };

  const handleViewMarketFromTrade = (eventSlug?: string, tokenId?: string) => {
    console.log("[TradeFeed] handleViewMarketFromTrade called", {
      eventSlug,
      tokenId,
    });
    handleViewMarket(eventSlug, tokenId);
  };

  const activeFiltersCount =
    (minValue > 0 ? 1 : 0) + (highConvictionOnly ? 1 : 0);

  return (
    <div ref={containerRef} className="panel h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard?tab=main&subtab=livedata"
            className="text-lg sm:text-xl lg:text-2xl font-mono font-bold hover:text-neutral transition-colors cursor-pointer"
          >
            LIVE TRADES
          </Link>
          <GlobalBusynessIndicator />
        </div>
        <div className="flex items-center gap-3">
          {isUserScrolling && (
            <div className="text-xs sm:text-sm font-mono text-blue-500 flex items-center gap-1">
              <span>📌</span>
              SCROLL LOCKED
            </div>
          )}
          {isPaused && (
            <div className="text-xs sm:text-sm font-mono text-yellow-500 flex items-center gap-1">
              <span className="animate-pulse">⏸</span>
              PAUSED
            </div>
          )}
          {!hideFilters && (
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={`text-xs sm:text-sm font-mono transition-colors border border-border px-3 py-1.5 hover:border-foreground ${
                activeFiltersCount > 0 ? "text-buy" : "text-muted-foreground"
              }`}
              title="Toggle filters"
            >
              FILTER {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          )}
          <div className="text-xs sm:text-sm font-mono text-muted-foreground">
            {displayedTrades.length} TRADES
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      {!hideFilters && filtersExpanded && (
        <div className="mb-3 pb-3 border-b border-border space-y-2 flex-shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Minimum Value Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-mono text-muted-foreground whitespace-nowrap">
                MIN VALUE:
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) =>
                    setMinValue(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-20 px-2 py-1 text-xs sm:text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="0"
                  step="10"
                  min="0"
                />
              </div>
              {minValue > 0 && (
                <button
                  onClick={() => setMinValue(0)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>

            {/* High Conviction Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHighConvictionOnly(!highConvictionOnly)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-mono border transition-colors ${
                  highConvictionOnly
                    ? "border-buy text-buy bg-buy/5"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                HIGH CONVICTION {highConvictionOnly && "✓"}
              </button>
              <span
                className="text-xs font-mono text-muted-foreground"
                title="Trades with price ≤15¢ or ≥85¢"
              >
                ?
              </span>
            </div>

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setMinValue(0);
                  setHighConvictionOnly(false);
                }}
                className="text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground underline"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4"
        style={{ scrollBehavior: autoScroll ? "smooth" : "auto" }}
      >
        <div className="space-y-2 pr-2 pb-4">
          {displayedTrades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-xs sm:text-sm min-h-[200px] flex items-center justify-center">
              NO TRADES YET
            </div>
          ) : (
            displayedTrades.map((trade) => (
              <div
                key={trade.id}
                onClick={() => handleTradeClick(trade)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="border border-border p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm sm:text-base font-mono font-semibold mb-1">
                      {trade.marketTitle}
                    </div>
                    <div className="text-xs sm:text-sm font-mono text-muted-foreground">
                      {trade.outcome}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 text-xs sm:text-sm font-mono font-bold ${
                      trade.side === "BUY"
                        ? "text-buy bg-buy/10"
                        : "text-sell bg-sell/10"
                    }`}
                  >
                    {trade.side}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-mono">
                  <div>
                    <div className="text-muted-foreground">PRICE</div>
                    <div className="font-bold">${formatPrice(trade.price)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">SIZE</div>
                    <div className="font-bold">
                      {formatLargeNumber(trade.size)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">TIME</div>
                    <div>{formatTimestamp(Number(trade.timestamp))}</div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border text-xs sm:text-sm font-mono text-muted-foreground">
                  ID: {trade.tradeId.slice(0, 16)}...
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        onViewMarket={handleViewMarketFromTrade}
        totalOutcomes={totalOutcomes}
      />

      {/* Market Detail Modal */}
      <MarketDetailModal
        market={selectedMarket}
        open={marketModalOpen}
        onOpenChange={setMarketModalOpen}
      />
    </div>
  );
}
