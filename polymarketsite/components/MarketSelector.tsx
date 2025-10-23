"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import {
  searchMarkets,
  getTopMarkets,
  toSelectedMarketState,
} from "@/lib/marketSearch";
import type { EventOutcomes, NormalizedMarket } from "@/types/markets";
import type { GammaEvent } from "@/services/gamma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Search, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { formatUSD } from "@/lib/crypto";

export function MarketSelector() {
  const router = useRouter();
  const selectedMarket = usePolymarketStore((state) => state.selectedMarket);
  const recentMarkets = usePolymarketStore((state) => state.recentMarkets);
  const setSelectedMarket = usePolymarketStore(
    (state) => state.setSelectedMarket,
  );
  const clearSelectedMarket = usePolymarketStore(
    (state) => state.clearSelectedMarket,
  );

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [markets, setMarkets] = useState<EventOutcomes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!open) return;

      setLoading(true);
      setError(null);

      try {
        const results = searchQuery.trim()
          ? await searchMarkets(searchQuery, 20)
          : await getTopMarkets(20);
        setMarkets(results);
      } catch (err) {
        console.error("[MarketSelector] Search error:", err);
        setError("Failed to load markets");
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  // Load markets when dialog opens
  useEffect(() => {
    if (open && markets.length === 0) {
      setLoading(true);
      getTopMarkets(20)
        .then(setMarkets)
        .catch((err) => {
          console.error("[MarketSelector] Failed to load top markets:", err);
          setError("Failed to load markets");
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const hoveredEvent = useMemo(
    () => markets.find((event) => event.eventId === hoveredEventId),
    [markets, hoveredEventId],
  );

  const handleSelectEvent = (eventOutcome: EventOutcomes) => {
    if (
      !eventOutcome ||
      !Array.isArray(eventOutcome.markets) ||
      eventOutcome.markets.length === 0
    ) {
      setError("No markets available for this event");
      return;
    }

    console.log("[MarketSelector] Selected event for event-level view:", {
      eventId: eventOutcome.eventId,
      slug: eventOutcome.slug,
      title: eventOutcome.title,
      marketCount: eventOutcome.markets.length,
    });

    // For multi-market events, select the primary market and show event context
    const primaryMarket = eventOutcome.markets[0];
    const syntheticEvent: GammaEvent = {
      id: eventOutcome.eventId,
      ticker: eventOutcome.title,
      slug: eventOutcome.slug,
      title: eventOutcome.title,
      description: "",
      startDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      active: true,
      closed: false,
      archived: false,
      featured: false,
      restricted: false,
      liquidity: eventOutcome.totalLiquidity || 0,
      volume: eventOutcome.totalVolume || 0,
      openInterest: 0,
      commentCount: 0,
      markets: [],
      icon: primaryMarket.icon,
      image: primaryMarket.image,
    };

    const selectedState = toSelectedMarketState(primaryMarket, syntheticEvent);
    setSelectedMarket(selectedState);

    // Close the selector dialog
    setOpen(false);
    setSearchQuery("");

    // Navigate to Market Focus
    router.push("/dashboard?tab=main&subtab=marketfocus");
  };

  const handleSelectForMarketFocus = (
    market: NormalizedMarket,
    eventOutcome: EventOutcomes,
  ) => {
    // Create the event object
    const syntheticEvent: GammaEvent = {
      id: eventOutcome.eventId,
      ticker: eventOutcome.title,
      slug: eventOutcome.slug,
      title: eventOutcome.title,
      description: "",
      startDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      active: true,
      closed: false,
      archived: false,
      featured: false,
      restricted: false,
      liquidity: eventOutcome.totalLiquidity || 0,
      volume: eventOutcome.totalVolume || 0,
      openInterest: 0,
      commentCount: 0,
      markets: [],
      icon: market.icon,
      image: market.image,
    };

    // Convert to SelectedMarketState using the helper
    const selectedState = toSelectedMarketState(market, syntheticEvent);

    console.log("[MarketSelector] Setting selected market for Market Focus:", {
      marketId: selectedState.marketId,
      conditionId: selectedState.conditionId,
      name: selectedState.name,
      eventTitle: selectedState.eventTitle,
    });

    // Set the selected market (DO NOT CLEAR IT)
    setSelectedMarket(selectedState);

    // Close selector
    setOpen(false);
    setSearchQuery("");

    // Navigate to Market Focus tab
    router.push("/dashboard?tab=main&subtab=marketfocus");
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelectedMarket();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={`
          w-full flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-mono text-sm group justify-center
          ${
            selectedMarket
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 shadow-sm"
              : "border-border bg-background hover:bg-secondary/50 hover:border-primary/50"
          }
        `}
      >
        {selectedMarket ? (
          <>
            {selectedMarket.icon && (
              <img
                src={selectedMarket.icon}
                alt=""
                className="w-5 h-5 rounded-full ring-1 ring-border"
              />
            )}
            <span className="max-w-[200px] truncate font-semibold">
              {selectedMarket.name}
            </span>
            <div
              onClick={handleClearSelection}
              className="ml-1 hover:bg-primary/30 rounded-full p-0.5 cursor-pointer transition-colors"
              title="Clear selection"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClearSelection(e as any);
                }
              }}
            >
              <X className="w-4 h-4" />
            </div>
          </>
        ) : (
          <>
            <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span>All Markets</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </>
        )}
      </button>

      {/* Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300 ${
            hoveredEvent ? "max-w-5xl" : "max-w-3xl"
          }`}
        >
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="font-mono text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Select Market
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by market name, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Main Content */}
          <div
            className="flex flex-1 mt-3 -mx-6 overflow-hidden"
            onMouseLeave={() => {
              if (hoverTimer) clearTimeout(hoverTimer);
              setHoveredEventId(null);
            }}
          >
            {/* Markets List */}
            <div
              className={`px-6 pr-8 overflow-y-scroll scrollbar-hide transition-all duration-300 ${
                hoveredEvent ? "w-1/2" : "w-full"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="space-y-2 py-2 pb-8">
                {/* All Markets Option */}
                {!searchQuery && (
                  <button
                    onClick={() => {
                      clearSelectedMarket();
                      setOpen(false);
                      setSearchQuery("");
                      router.push("/dashboard?tab=main&subtab=all");
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all group ${
                      !selectedMarket
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:bg-secondary/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-mono font-semibold text-sm">
                          All Markets
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          View aggregate data across all markets
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                )}

                {/* Recently Viewed */}
                {!searchQuery && recentMarkets.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 px-2 py-2 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recently Viewed</span>
                    </div>
                    <div className="space-y-1.5">
                      {recentMarkets.map((market) => (
                        <button
                          key={market.marketId}
                          onClick={() => {
                            setSelectedMarket(market);
                            setOpen(false);
                            // Navigate to market focus tab
                            router.push(
                              "/dashboard?tab=main&subtab=marketfocus",
                            );
                          }}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary/50 hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {market.icon && (
                              <img
                                src={market.icon}
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-mono font-semibold text-sm group-hover:text-primary transition-colors">
                                {market.eventTitle}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                {market.name}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />
                  </div>
                )}

                {/* Search Results / Top Markets */}
                {loading && (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-border animate-pulse"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                      <X className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="text-sm font-mono text-destructive font-semibold">
                      {error}
                    </div>
                    <button
                      onClick={() => {
                        setError(null);
                        setSearchQuery("");
                      }}
                      className="mt-3 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && markets.length === 0 && searchQuery && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mb-1">
                      No markets found
                    </div>
                    <div className="text-xs text-muted-foreground max-w-xs">
                      No markets match &quot;{searchQuery}&quot;. Try different
                      keywords or browse top markets.
                    </div>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-3 py-1.5 text-xs font-mono bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {!loading && !error && markets.length > 0 && (
                  <>
                    {!searchQuery && (
                      <div className="flex items-center gap-2 px-2 py-2 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wide">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Top Markets by Volume</span>
                      </div>
                    )}
                    {searchQuery && (
                      <div className="px-2 py-2 text-xs font-mono text-muted-foreground">
                        Found {markets.length} market
                        {markets.length !== 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {markets.map((eventOutcome) => {
                        const isMultiMarket = eventOutcome.markets.length > 1;
                        const primaryMarket = eventOutcome.markets[0];
                        const topOutcome = eventOutcome.summary?.topOutcome;
                        const isHovered =
                          hoveredEventId === eventOutcome.eventId;

                        return (
                          <div
                            key={eventOutcome.eventId}
                            className="relative"
                            onMouseEnter={() => {
                              if (hoverTimer) clearTimeout(hoverTimer);
                              if (isMultiMarket) {
                                const timer = setTimeout(() => {
                                  setHoveredEventId(eventOutcome.eventId);
                                }, 800);
                                setHoverTimer(timer);
                              } else {
                                setHoveredEventId(null);
                              }
                            }}
                          >
                            {/* Main Event Button */}
                            <button
                              onClick={() => {
                                if (isMultiMarket) {
                                  handleSelectEvent(eventOutcome);
                                } else {
                                  handleSelectForMarketFocus(
                                    primaryMarket,
                                    eventOutcome,
                                  );
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg border transition-all group ${
                                isHovered
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border hover:bg-secondary/50 hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {(primaryMarket?.icon ||
                                  primaryMarket?.image) && (
                                  <img
                                    src={
                                      primaryMarket.icon || primaryMarket.image
                                    }
                                    alt=""
                                    className="w-9 h-9 rounded-full flex-shrink-0 ring-1 ring-border"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-mono font-semibold text-sm group-hover:text-primary transition-colors">
                                      {eventOutcome.title}
                                    </div>
                                    {isMultiMarket && (
                                      <div className="flex items-center gap-1">
                                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-primary/20 text-primary rounded-full">
                                          {eventOutcome.markets.length}
                                        </span>
                                        <ChevronRight
                                          className={`w-3.5 h-3.5 text-muted-foreground transition-all ${
                                            isHovered
                                              ? "translate-x-1 text-primary"
                                              : "group-hover:translate-x-0.5"
                                          }`}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  {topOutcome && (
                                    <div className="flex items-center gap-1.5 text-xs mb-1">
                                      <span className="text-muted-foreground">
                                        {topOutcome.name}
                                      </span>
                                      <span className="font-mono font-bold text-foreground">
                                        {Math.round(
                                          topOutcome.probability * 100,
                                        )}
                                        %
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {eventOutcome.totalVolume !== undefined && (
                                      <span className="font-mono">
                                        Vol:{" "}
                                        {formatUSD(eventOutcome.totalVolume)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submarkets View */}
            {hoveredEvent && (
              <div className="w-1/2 border-l border-border overflow-y-auto animate-in slide-in-from-right-5 fade-in-25 duration-300">
                <div className="p-3 space-y-1.5">
                  <div className="px-3 py-2 text-xs font-mono font-bold text-primary sticky top-0 bg-background/95 backdrop-blur-sm border-b border-primary/20 mb-2 z-10 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <span>SELECT MARKET</span>
                      <span className="text-muted-foreground font-normal">
                        ({hoveredEvent.markets.length})
                      </span>
                    </div>
                  </div>
                  {hoveredEvent.markets.map((market) => {
                    const isSubmarketSelected =
                      selectedMarket?.marketId === market.id;
                    return (
                      <button
                        key={market.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectForMarketFocus(market, hoveredEvent);
                          setHoveredEventId(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                          isSubmarketSelected
                            ? "bg-primary/20 shadow-sm"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-mono truncate group-hover:text-primary transition-colors">
                            {market.displayName || market.title}
                          </span>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {market.primaryOutcome && (
                              <>
                                <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                                  {Math.round(
                                    market.primaryOutcome.probability * 100,
                                  )}
                                  %
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {formatUSD(market.primaryOutcome.probability)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
