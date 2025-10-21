"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

export interface LiveDataFilterState {
  // Trade filters
  minTradeValue: number;
  maxTradeValue: number;
  tradeSide: "ALL" | "BUY" | "SELL";
  highConviction: boolean;

  // Orderbook filters
  minOrderSize: number;
  maxSpreadPercent: number;

  // Market filters
  searchQuery: string;
  sortBy: "value" | "time" | "size" | "price";
  sortDirection: "asc" | "desc";

  // Advanced filters
  minPrice: number;
  maxPrice: number;
  timeRange: "1m" | "5m" | "15m" | "1h" | "all";
  showLargeOnly: boolean;
  hideSmallTrades: boolean;
}

interface LiveDataFiltersProps {
  filters: LiveDataFilterState;
  onFiltersChange: (filters: LiveDataFilterState) => void;
  tradeCount: number;
  orderbookLevels: { bids: number; asks: number };
}

export const defaultFilters: LiveDataFilterState = {
  minTradeValue: 0,
  maxTradeValue: 0,
  tradeSide: "ALL",
  highConviction: false,
  minOrderSize: 0,
  maxSpreadPercent: 0,
  searchQuery: "",
  sortBy: "time",
  sortDirection: "desc",
  minPrice: 0,
  maxPrice: 1,
  timeRange: "all",
  showLargeOnly: false,
  hideSmallTrades: false,
};

export function LiveDataFilters({
  filters,
  onFiltersChange,
  tradeCount,
  orderbookLevels,
}: LiveDataFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const updateFilter = useCallback(
    (key: keyof LiveDataFilterState, value: any) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const resetFilters = useCallback(() => {
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "sortBy" || key === "sortDirection") return false;
    if (key === "tradeSide" && value === "ALL") return false;
    if (key === "timeRange" && value === "all") return false;
    if (key === "maxPrice" && value === 1) return false;
    if (typeof value === "boolean") return value === true;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") return value !== "";
    return false;
  }).length;

  return (
    <div className="panel mb-4 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-base sm:text-lg font-mono font-bold hover:text-neutral transition-colors"
          >
            <Filter className="w-5 h-5" />
            ADVANCED FILTERS
            {activeFilterCount > 0 && (
              <span className="text-buy text-sm">({activeFilterCount})</span>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm font-mono text-muted-foreground hidden sm:block">
            {tradeCount} TRADES | {orderbookLevels.bids}B /{" "}
            {orderbookLevels.asks}A
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm font-mono text-muted-foreground hover:text-foreground underline"
            >
              RESET ALL
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {expanded && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Quick Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {/* Trade Side */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                SIDE
              </label>
              <select
                value={filters.tradeSide}
                onChange={(e) =>
                  updateFilter(
                    "tradeSide",
                    e.target.value as "ALL" | "BUY" | "SELL",
                  )
                }
                className="px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
              >
                <option value="ALL">ALL</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                TIME
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  updateFilter(
                    "timeRange",
                    e.target.value as "1m" | "5m" | "15m" | "1h" | "all",
                  )
                }
                className="px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
              >
                <option value="all">ALL TIME</option>
                <option value="1m">1 MIN</option>
                <option value="5m">5 MIN</option>
                <option value="15m">15 MIN</option>
                <option value="1h">1 HOUR</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                SORT BY
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter(
                    "sortBy",
                    e.target.value as "value" | "time" | "size" | "price",
                  )
                }
                className="px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
              >
                <option value="time">TIME</option>
                <option value="value">VALUE</option>
                <option value="size">SIZE</option>
                <option value="price">PRICE</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                ORDER
              </label>
              <select
                value={filters.sortDirection}
                onChange={(e) =>
                  updateFilter(
                    "sortDirection",
                    e.target.value as "asc" | "desc",
                  )
                }
                className="px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
              >
                <option value="desc">DESC ↓</option>
                <option value="asc">ASC ↑</option>
              </select>
            </div>

            {/* High Conviction Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                CONVICTION
              </label>
              <button
                onClick={() =>
                  updateFilter("highConviction", !filters.highConviction)
                }
                className={`px-2 py-1.5 text-sm font-mono border transition-colors ${
                  filters.highConviction
                    ? "border-buy text-buy bg-buy/5"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {filters.highConviction ? "HIGH ✓" : "ALL"}
              </button>
            </div>

            {/* Large Only Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                SIZE
              </label>
              <button
                onClick={() =>
                  updateFilter("showLargeOnly", !filters.showLargeOnly)
                }
                className={`px-2 py-1.5 text-sm font-mono border transition-colors ${
                  filters.showLargeOnly
                    ? "border-buy text-buy bg-buy/5"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {filters.showLargeOnly ? "LARGE ✓" : "ALL"}
              </button>
            </div>
          </div>

          {/* Value Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Min Trade Value */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                MIN VALUE ($)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={filters.minTradeValue || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minTradeValue",
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="0"
                  step="10"
                  min="0"
                />
                {filters.minTradeValue > 0 && (
                  <button
                    onClick={() => updateFilter("minTradeValue", 0)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Max Trade Value */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                MAX VALUE ($)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={filters.maxTradeValue || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxTradeValue",
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="∞"
                  step="10"
                  min="0"
                />
                {filters.maxTradeValue > 0 && (
                  <button
                    onClick={() => updateFilter("maxTradeValue", 0)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Min Order Size */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                MIN ORDER SIZE
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={filters.minOrderSize || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minOrderSize",
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="0"
                  step="10"
                  min="0"
                />
                {filters.minOrderSize > 0 && (
                  <button
                    onClick={() => updateFilter("minOrderSize", 0)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Max Spread */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-mono text-muted-foreground font-semibold">
                MAX SPREAD (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={filters.maxSpreadPercent || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxSpreadPercent",
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                  placeholder="∞"
                  step="0.5"
                  min="0"
                />
                {filters.maxSpreadPercent > 0 && (
                  <button
                    onClick={() => updateFilter("maxSpreadPercent", 0)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="border-t border-border pt-3">
            <button
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-2 font-semibold"
            >
              {advancedExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              ADVANCED OPTIONS
            </button>

            {advancedExpanded && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {/* Min Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-mono text-muted-foreground font-semibold">
                    MIN PRICE ($)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minPrice",
                        Math.max(
                          0,
                          Math.min(1, parseFloat(e.target.value) || 0),
                        ),
                      )
                    }
                    className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="1"
                  />
                </div>

                {/* Max Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-mono text-muted-foreground font-semibold">
                    MAX PRICE ($)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxPrice",
                        Math.max(
                          0,
                          Math.min(1, parseFloat(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                    placeholder="1.00"
                    step="0.01"
                    min="0"
                    max="1"
                  />
                </div>

                {/* Market Search */}
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-sm font-mono text-muted-foreground font-semibold">
                    SEARCH MARKETS
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={filters.searchQuery}
                      onChange={(e) =>
                        updateFilter("searchQuery", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm font-mono bg-background border border-border text-foreground focus:border-foreground focus:outline-none"
                      placeholder="Type to filter markets..."
                    />
                    {filters.searchQuery && (
                      <button
                        onClick={() => updateFilter("searchQuery", "")}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hide Small Trades */}
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="hideSmallTrades"
                    checked={filters.hideSmallTrades}
                    onChange={(e) =>
                      updateFilter("hideSmallTrades", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="hideSmallTrades"
                    className="text-sm font-mono text-muted-foreground cursor-pointer hover:text-foreground"
                  >
                    HIDE DUST TRADES
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Filter Presets */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-muted-foreground font-semibold">
                PRESETS:
              </span>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...defaultFilters,
                    minTradeValue: 100,
                    highConviction: false,
                  })
                }
                className="px-3 py-1.5 text-sm font-mono border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                $100+ TRADES
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...defaultFilters,
                    highConviction: true,
                    minTradeValue: 50,
                  })
                }
                className="px-3 py-1.5 text-sm font-mono border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                HIGH CONVICTION
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...defaultFilters,
                    minTradeValue: 1000,
                    showLargeOnly: true,
                  })
                }
                className="px-3 py-1.5 text-sm font-mono border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                WHALE WATCH
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...defaultFilters,
                    maxSpreadPercent: 2,
                    minOrderSize: 50,
                  })
                }
                className="px-3 py-1.5 text-sm font-mono border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                TIGHT SPREADS
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...defaultFilters,
                    tradeSide: "BUY",
                    sortBy: "value",
                  })
                }
                className="px-3 py-1.5 text-sm font-mono border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                BUY FLOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
