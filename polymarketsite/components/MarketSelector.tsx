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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

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
          flex items-center gap-2 px-4 py-2 rounded-md border transition-colors font-mono text-sm
          ${
            selectedMarket
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
              : "border-border bg-background hover:bg-secondary/50"
          }
        `}
      >
        {selectedMarket ? (
          <>
            {selectedMarket.icon && (
              <img
                src={selectedMarket.icon}
                alt=""
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="max-w-[200px] truncate">
              {selectedMarket.name}
            </span>
            <div
              onClick={handleClearSelection}
              className="ml-1 hover:bg-primary/30 rounded-full p-0.5 cursor-pointer"
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
            <Search className="w-4 h-4" />
            <span>All Markets</span>
          </>
        )}
      </button>

      {/* Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl">
              Select Market
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md font-mono text-sm focus:outline-none focus:border-foreground"
              autoFocus
            />
          </div>

          {/* Markets List */}
          <div className="flex-1 -mx-6 px-6 overflow-y-auto">
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
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    !selectedMarket
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="font-mono font-semibold">All Markets</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    View aggregate data from all markets
                  </div>
                </button>
              )}

              {/* Recently Viewed */}
              {!searchQuery && recentMarkets.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>RECENTLY VIEWED</span>
                  </div>
                  {recentMarkets.map((market) => (
                    <button
                      key={market.marketId}
                      onClick={() => {
                        setSelectedMarket(market);
                        setOpen(false);
                        // Navigate to market focus tab
                        router.push("/dashboard?tab=main&subtab=marketfocus");
                      }}
                      className="w-full text-left p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {market.icon && (
                          <img
                            src={market.icon}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-semibold text-sm">
                            {market.eventTitle}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {market.name}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="h-2 border-b border-border my-2" />
                </div>
              )}

              {/* Search Results / Top Markets */}
              {loading && (
                <div className="text-center py-8 text-sm text-muted-foreground font-mono">
                  Loading markets...
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-sm text-destructive font-mono">
                  {error}
                </div>
              )}

              {!loading && !error && markets.length === 0 && searchQuery && (
                <div className="text-center py-8 text-sm text-muted-foreground font-mono">
                  No markets found for &quot;{searchQuery}&quot;
                </div>
              )}

              {!loading && !error && markets.length > 0 && (
                <>
                  {!searchQuery && (
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>TOP MARKETS BY VOLUME</span>
                    </div>
                  )}
                  {markets.map((eventOutcome) => {
                    const isMultiMarket = eventOutcome.markets.length > 1;
                    const primaryMarket = eventOutcome.markets[0];
                    const topOutcome = eventOutcome.summary?.topOutcome;
                    const isHovered = hoveredEventId === eventOutcome.eventId;

                    return (
                      <div
                        key={eventOutcome.eventId}
                        className="relative"
                        onMouseEnter={(e) => {
                          if (isMultiMarket) {
                            setHoveredEventId(eventOutcome.eventId);
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const spaceBelow = viewportHeight - rect.bottom;
                            const dropdownMaxHeight = 400;

                            // If not enough space below, position above
                            if (
                              spaceBelow < dropdownMaxHeight &&
                              rect.top > dropdownMaxHeight
                            ) {
                              setDropdownStyle({
                                bottom: "100%",
                                top: "auto",
                                marginBottom: "4px",
                                marginTop: "0",
                              });
                            } else {
                              setDropdownStyle({
                                top: "100%",
                                bottom: "auto",
                                marginTop: "4px",
                                marginBottom: "0",
                              });
                            }
                          }
                        }}
                        onMouseLeave={() =>
                          isMultiMarket && setHoveredEventId(null)
                        }
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
                          className="w-full text-left p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {(primaryMarket?.icon || primaryMarket?.image) && (
                              <img
                                src={primaryMarket.icon || primaryMarket.image}
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-mono font-semibold text-sm">
                                  {eventOutcome.title}
                                </div>
                                {isMultiMarket && (
                                  <div className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 text-xs font-mono bg-primary/20 text-primary rounded">
                                      {eventOutcome.markets.length}
                                    </span>
                                    <ChevronRight
                                      className={`w-3 h-3 text-muted-foreground transition-transform ${
                                        isHovered ? "rotate-90" : ""
                                      }`}
                                    />
                                  </div>
                                )}
                              </div>
                              {topOutcome && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {topOutcome.name}:{" "}
                                  {Math.round(topOutcome.probability * 100)}%
                                </div>
                              )}
                              {eventOutcome.totalVolume !== undefined && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Vol: {formatUSD(eventOutcome.totalVolume)}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Submarkets Dropdown (shown on hover for multi-market events) */}
                        {isMultiMarket && isHovered && (
                          <div
                            className="absolute left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-2 border-primary/30 rounded-lg shadow-2xl max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                            style={dropdownStyle}
                          >
                            <div className="p-2 space-y-1">
                              <div className="px-2 py-1 text-xs font-mono font-bold text-primary sticky top-0 bg-background/95 backdrop-blur-sm border-b border-primary/20 mb-1 z-10">
                                SELECT MARKET:
                              </div>
                              {eventOutcome.markets.map((market) => (
                                <button
                                  key={market.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectForMarketFocus(
                                      market,
                                      eventOutcome,
                                    );
                                    setHoveredEventId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-md hover:bg-primary/10 hover:border-l-2 hover:border-primary transition-all duration-150"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-mono truncate">
                                      {market.displayName || market.title}
                                    </span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {market.primaryOutcome && (
                                        <span className="text-xs font-mono font-bold">
                                          {Math.round(
                                            market.primaryOutcome.probability *
                                              100,
                                          )}
                                          %
                                        </span>
                                      )}
                                      {market.volume !== undefined && (
                                        <span className="text-xs font-mono text-muted-foreground">
                                          {formatUSD(market.volume)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
