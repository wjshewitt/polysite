"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { useEffect, useState, useRef } from "react";
import { clobService } from "@/services/clob";
import { formatTimestamp } from "@/lib/utils";

interface OrderbookDepthProps {
  tokenId?: string;
  overrideFilters?: {
    minSize?: number;
    maxSpread?: number;
  };
}

export function OrderbookDepth({
  tokenId,
  overrideFilters,
}: OrderbookDepthProps) {
  const orderbookDepth = usePolymarketStore((state) => state.orderbookDepth);
  const marketMetadata = usePolymarketStore((state) => state.marketMetadata);
  const selectedMarket = usePolymarketStore((state) => state.selectedMarket);
  const updateOrderbookDepth = usePolymarketStore(
    (state) => state.updateOrderbookDepth,
  );
  const updateMarketMetadata = usePolymarketStore(
    (state) => state.updateMarketMetadata,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter states (use override if provided)
  const [minSize, setMinSize] = useState<number>(overrideFilters?.minSize || 0);
  const [maxSpread, setMaxSpread] = useState<number>(
    overrideFilters?.maxSpread || 0,
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const asksScrollRef = useRef<HTMLDivElement>(null);
  const bidsScrollRef = useRef<HTMLDivElement>(null);

  // Hide filters when using override
  const hideFilters = !!overrideFilters;

  // Extract token ID from selectedMarket if it's a SelectedMarketState object
  const selectedTokenId =
    selectedMarket?.clobTokenIds?.[0] || selectedMarket?.yesTokenId;
  const currentTokenId = tokenId || selectedTokenId;
  const depth = currentTokenId ? orderbookDepth.get(currentTokenId) : undefined;
  const metadata = depth?.market ? marketMetadata.get(depth.market) : undefined;

  // Sync override filter values
  useEffect(() => {
    if (overrideFilters?.minSize !== undefined) {
      setMinSize(overrideFilters.minSize);
    }
    if (overrideFilters?.maxSpread !== undefined) {
      setMaxSpread(overrideFilters.maxSpread);
    }
  }, [overrideFilters]);

  useEffect(() => {
    if (!currentTokenId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch orderbook depth
        const depthData = await clobService.getOrderbook(currentTokenId);
        if (depthData) {
          updateOrderbookDepth(depthData);
        }

        // Fetch market metadata if we have a market ID
        if (depthData?.market) {
          const metadataData = await clobService.getMarketMetadata(
            depthData.market,
          );
          if (metadataData) {
            updateMarketMetadata(metadataData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch orderbook data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 5 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [currentTokenId, autoRefresh, updateOrderbookDepth, updateMarketMetadata]);

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0.0000";
    return num.toFixed(4);
  };

  const formatSize = (size: string): string => {
    const num = parseFloat(size);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const calculateTotal = (
    levels: Array<{ price: string; size: string }>,
  ): string => {
    const total = levels.reduce((sum, level) => {
      return sum + parseFloat(level.price) * parseFloat(level.size);
    }, 0);
    return total.toFixed(2);
  };

  const getMaxSize = (
    levels: Array<{ price: string; size: string }>,
  ): number => {
    return Math.max(...levels.map((l) => parseFloat(l.size)));
  };

  const calculateDepth = (size: string, maxSize: number): number => {
    const num = parseFloat(size);
    if (isNaN(num) || maxSize === 0) return 0;
    return (num / maxSize) * 100;
  };

  // Filter orderbook levels based on criteria
  const filterLevels = (
    levels: Array<{ price: string; size: string }>,
  ): Array<{ price: string; size: string }> => {
    if (minSize <= 0) return levels;
    return levels.filter((level) => parseFloat(level.size) >= minSize);
  };

  if (!currentTokenId) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground font-mono text-sm mb-2">
            No market selected
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            Select a market to view orderbook depth
          </div>
        </div>
      </div>
    );
  }

  if (loading && !depth) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm">
          Loading orderbook depth...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-center">
          <div className="text-sell font-mono text-sm mb-2">
            Error loading orderbook
          </div>
          <div className="text-muted-foreground font-mono text-xs">{error}</div>
        </div>
      </div>
    );
  }

  if (!depth) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm">
          No orderbook data available
        </div>
      </div>
    );
  }

  // Apply filters
  const filteredBids = filterLevels(depth.bids);
  const filteredAsks = filterLevels(depth.asks);

  const maxBidSize = getMaxSize(filteredBids);
  const maxAskSize = getMaxSize(filteredAsks);
  const maxSize = Math.max(maxBidSize, maxAskSize);

  const spread =
    filteredAsks.length > 0 && filteredBids.length > 0
      ? parseFloat(filteredAsks[0].price) - parseFloat(filteredBids[0].price)
      : 0;
  const spreadPercent =
    filteredBids.length > 0
      ? (spread / parseFloat(filteredBids[0].price)) * 100
      : 0;

  // Check if spread filter should hide the book
  const spreadTooWide = maxSpread > 0 && spreadPercent > maxSpread;

  const activeFiltersCount = (minSize > 0 ? 1 : 0) + (maxSpread > 0 ? 1 : 0);

  return (
    <div className="h-full bg-card border border-border flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-foreground font-mono text-base sm:text-lg font-semibold">
            ORDERBOOK DEPTH
          </h2>
          <div className="flex items-center gap-2">
            {!hideFilters && (
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className={`px-3 py-1.5 text-sm font-mono transition-colors border ${
                  activeFiltersCount > 0
                    ? "border-buy text-buy"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
                title="Toggle filters"
              >
                FILTER {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            )}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 font-mono text-sm border transition-colors ${
                autoRefresh
                  ? "border-buy text-buy"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {autoRefresh ? "AUTO ✓" : "MANUAL"}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {!hideFilters && filtersExpanded && (
          <div className="mb-2 pb-2 border-b border-border space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Minimum Size Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-mono text-muted-foreground whitespace-nowrap font-semibold">
                  MIN SIZE:
                </label>
                <input
                  type="number"
                  value={minSize}
                  onChange={(e) =>
                    setMinSize(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-20 px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="0"
                  step="10"
                  min="0"
                />
                {minSize > 0 && (
                  <button
                    onClick={() => setMinSize(0)}
                    className="text-sm font-mono text-muted-foreground hover:text-foreground"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Max Spread Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-mono text-muted-foreground whitespace-nowrap font-semibold">
                  MAX SPREAD:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={maxSpread}
                    onChange={(e) =>
                      setMaxSpread(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-16 px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                    placeholder="0"
                    step="0.5"
                    min="0"
                  />
                  <span className="text-sm font-mono text-muted-foreground">
                    %
                  </span>
                </div>
                {maxSpread > 0 && (
                  <button
                    onClick={() => setMaxSpread(0)}
                    className="text-sm font-mono text-muted-foreground hover:text-foreground"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Clear All */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setMinSize(0);
                    setMaxSpread(0);
                  }}
                  className="text-sm font-mono text-muted-foreground hover:text-foreground underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
          </div>
        )}

        {/* Market Info */}
        {metadata && (
          <div className="space-y-1">
            <div className="text-foreground font-mono text-sm">
              {metadata.description.slice(0, 60)}...
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-mono text-sm">
              <span>
                Tick:{" "}
                <span className="text-foreground">{metadata.tickSize}</span>
              </span>
              <span>
                Min: <span className="text-foreground">{metadata.minSize}</span>
              </span>
              {metadata.negRisk && <span className="text-sell">NEG-RISK</span>}
              {metadata.closed && (
                <span className="text-muted-foreground">CLOSED</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spread Warning */}
      {spreadTooWide && (
        <div className="px-4 py-2 bg-sell/10 border-b border-border">
          <div className="text-sm font-mono text-sell">
            ⚠ SPREAD TOO WIDE: {spreadPercent.toFixed(2)}% exceeds{" "}
            {maxSpread.toFixed(2)}% threshold
          </div>
        </div>
      )}

      {/* Orderbook */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-0">
        {/* Asks (Sell Orders) */}
        <div className="border-r border-border flex flex-col min-h-0">
          <div className="border-b border-border px-3 py-2 bg-card flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 font-mono text-sm font-semibold text-muted-foreground">
              <div className="text-right">PRICE</div>
              <div className="text-right">SIZE</div>
              <div className="text-right">TOTAL</div>
            </div>
          </div>
          <div ref={asksScrollRef} className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-3 space-y-1 pb-4">
              {(spreadTooWide ? [] : filteredAsks.slice(0, 20)).map(
                (ask, index) => {
                  const depthPercent = calculateDepth(ask.size, maxSize);
                  const total = (
                    parseFloat(ask.price) * parseFloat(ask.size)
                  ).toFixed(2);
                  return (
                    <div key={index} className="relative group">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-sell/10"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <div className="relative grid grid-cols-3 gap-2 font-mono text-sm py-1 hover:bg-muted transition-colors">
                        <div className="text-right text-sell font-semibold">
                          {formatPrice(ask.price)}
                        </div>
                        <div className="text-right text-foreground">
                          {formatSize(ask.size)}
                        </div>
                        <div className="text-right text-muted-foreground">
                          {total}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex flex-col min-h-0">
          <div className="border-b border-border px-3 py-2 bg-card flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 font-mono text-sm font-semibold text-muted-foreground">
              <div className="text-right">PRICE</div>
              <div className="text-right">SIZE</div>
              <div className="text-right">TOTAL</div>
            </div>
          </div>
          <div ref={bidsScrollRef} className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-3 space-y-1 pb-4">
              {(spreadTooWide ? [] : filteredBids.slice(0, 20)).map(
                (bid, index) => {
                  const depthPercent = calculateDepth(bid.size, maxSize);
                  const total = (
                    parseFloat(bid.price) * parseFloat(bid.size)
                  ).toFixed(2);
                  return (
                    <div key={index} className="relative group">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-buy/10"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <div className="relative grid grid-cols-3 gap-2 font-mono text-sm py-1 hover:bg-muted transition-colors">
                        <div className="text-right text-buy font-semibold">
                          {formatPrice(bid.price)}
                        </div>
                        <div className="text-right text-foreground">
                          {formatSize(bid.size)}
                        </div>
                        <div className="text-right text-muted-foreground">
                          {total}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Spread Info */}
      <div className="border-t border-border px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between font-mono text-sm">
          <div className="text-muted-foreground">
            Spread:{" "}
            <span className="text-foreground font-semibold">
              {spread.toFixed(4)}
            </span>{" "}
            <span className="text-muted-foreground">
              ({spreadPercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-muted-foreground">
            Levels:{" "}
            <span className="text-buy">
              {filteredBids.length}
              {minSize > 0 && `/${depth.bids.length}`}
            </span>{" "}
            /{" "}
            <span className="text-sell">
              {filteredAsks.length}
              {minSize > 0 && `/${depth.asks.length}`}
            </span>
          </div>
          <div className="text-muted-foreground">
            {formatTimestamp(depth.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}
