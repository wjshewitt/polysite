"use client";

import { useState, useMemo } from "react";
import { TradeFeed } from "@/components/TradeFeed";
import { OrderbookDepth } from "@/components/OrderbookDepth";
import {
  LiveDataFilters,
  LiveDataFilterState,
  defaultFilters,
} from "@/components/LiveDataFilters";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { Trade } from "@/types/polymarket";

export function LiveData() {
  const [filters, setFilters] = useState<LiveDataFilterState>(defaultFilters);
  const allTrades = usePolymarketStore((state) => state.trades);
  const orderbookDepth = usePolymarketStore((state) => state.orderbookDepth);
  const selectedMarket = usePolymarketStore((state) => state.selectedMarket);
  const connected = usePolymarketStore((state) => state.connected);
  const error = usePolymarketStore((state) => state.error);

  // Get current orderbook levels count
  const orderbookLevels = useMemo(() => {
    if (!selectedMarket) return { bids: 0, asks: 0 };
    // Extract token ID from selectedMarket
    const tokenId =
      selectedMarket.clobTokenIds?.[0] || selectedMarket.yesTokenId;
    if (!tokenId) return { bids: 0, asks: 0 };
    const depth = orderbookDepth.get(tokenId);
    if (!depth) return { bids: 0, asks: 0 };

    // Apply filters to orderbook
    let bids = depth.bids;
    let asks = depth.asks;

    if (filters.minOrderSize > 0) {
      bids = bids.filter((b) => parseFloat(b.size) >= filters.minOrderSize);
      asks = asks.filter((a) => parseFloat(a.size) >= filters.minOrderSize);
    }

    return { bids: bids.length, asks: asks.length };
  }, [selectedMarket, orderbookDepth, filters.minOrderSize]);

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    let filtered = [...allTrades];

    // Trade side filter
    if (filters.tradeSide !== "ALL") {
      filtered = filtered.filter((trade) => trade.side === filters.tradeSide);
    }

    // Value filters
    if (filters.minTradeValue > 0 || filters.maxTradeValue > 0) {
      filtered = filtered.filter((trade) => {
        const value = parseFloat(trade.price) * parseFloat(trade.size);
        if (filters.minTradeValue > 0 && value < filters.minTradeValue)
          return false;
        if (filters.maxTradeValue > 0 && value > filters.maxTradeValue)
          return false;
        return true;
      });
    }

    // High conviction filter
    if (filters.highConviction) {
      filtered = filtered.filter((trade) => {
        const price = parseFloat(trade.price);
        return price <= 0.15 || price >= 0.85;
      });
    }

    // Price range filters
    if (filters.minPrice > 0 || filters.maxPrice < 1) {
      filtered = filtered.filter((trade) => {
        const price = parseFloat(trade.price);
        return price >= filters.minPrice && price <= filters.maxPrice;
      });
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = Date.now();
      const timeMap = {
        "1m": 60 * 1000,
        "5m": 5 * 60 * 1000,
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
      };
      const timeLimit = timeMap[filters.timeRange];
      filtered = filtered.filter((trade) => now - trade.timestamp < timeLimit);
    }

    // Large trades only
    if (filters.showLargeOnly) {
      filtered = filtered.filter((trade) => {
        const value = parseFloat(trade.price) * parseFloat(trade.size);
        return value >= 500; // Consider $500+ as "large"
      });
    }

    // Hide small trades (dust)
    if (filters.hideSmallTrades) {
      filtered = filtered.filter((trade) => {
        const value = parseFloat(trade.price) * parseFloat(trade.size);
        return value >= 10; // Hide trades under $10
      });
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trade) =>
          trade.marketTitle.toLowerCase().includes(query) ||
          trade.outcome.toLowerCase().includes(query),
      );
    }

    // Sort trades
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (filters.sortBy) {
        case "value":
          aValue = parseFloat(a.price) * parseFloat(a.size);
          bValue = parseFloat(b.price) * parseFloat(b.size);
          break;
        case "size":
          aValue = parseFloat(a.size);
          bValue = parseFloat(b.size);
          break;
        case "price":
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case "time":
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
      }

      return filters.sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });

    return filtered;
  }, [allTrades, filters]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* Subtle error indicator */}
      {!connected && error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive flex items-center justify-between">
          <span>
            Live data unavailable:{" "}
            {error.includes("1006") ? "Network connection lost" : error}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-destructive/20 hover:bg-destructive/30 px-2 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      <LiveDataFilters
        filters={filters}
        onFiltersChange={setFilters}
        tradeCount={filteredTrades.length}
        orderbookLevels={orderbookLevels}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Column - Trade Feed */}
        <div className="h-full min-h-[600px] lg:min-h-0 overflow-hidden">
          <TradeFeed
            overrideTrades={filteredTrades}
            overrideFilters={{
              minValue: filters.minTradeValue,
              highConvictionOnly: filters.highConviction,
            }}
          />
        </div>

        {/* Right Column - Orderbook Depth */}
        <div className="h-full min-h-[600px] lg:min-h-0 overflow-hidden">
          <OrderbookDepth
            overrideFilters={{
              minSize: filters.minOrderSize,
              maxSpread: filters.maxSpreadPercent,
            }}
          />
        </div>
      </div>
    </div>
  );
}
