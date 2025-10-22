"use client";

import { useState, useEffect, useMemo } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { TradeFeed } from "@/components/TradeFeed";
import { OrderBook } from "@/components/OrderBook";
import { formatUSD } from "@/lib/crypto";
import { gammaAPI, type GammaEvent } from "@/services/gamma";
import type { NormalizedMarket } from "@/types/markets";
import { toSelectedMarketState } from "@/lib/marketSearch";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ExternalLink,
} from "lucide-react";

export function MarketFocus() {
  const selectedMarket = usePolymarketStore((state) => state.selectedMarket);
  const allTrades = usePolymarketStore((state) => state.trades);
  const orderbookDepth = usePolymarketStore((state) => state.orderbookDepth);
  const eventOutcomes = usePolymarketStore((state) => state.eventOutcomes);

  const [fullMarketData, setFullMarketData] = useState<NormalizedMarket | null>(
    null,
  );
  const [fullEventData, setFullEventData] = useState<GammaEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter trades for selected market
  const marketTrades = useMemo(() => {
    if (!selectedMarket) return [];

    console.log("[MarketFocus] Selected market:", {
      marketId: selectedMarket.marketId,
      conditionId: selectedMarket.conditionId,
      name: selectedMarket.name,
      eventTitle: selectedMarket.eventTitle,
      clobTokenIds: selectedMarket.clobTokenIds,
      yesTokenId: selectedMarket.yesTokenId,
    });

    const filtered = allTrades.filter((trade) => {
      // Try multiple matching strategies
      const matchByConditionId =
        selectedMarket.conditionId &&
        trade.market === selectedMarket.conditionId;
      const matchByMarketId = trade.market === selectedMarket.marketId;
      const matchByAsset =
        selectedMarket.clobTokenIds &&
        selectedMarket.clobTokenIds.some((tokenId) => trade.asset === tokenId);
      const matchByYesToken =
        selectedMarket.yesTokenId && trade.asset === selectedMarket.yesTokenId;
      const matchByNoToken =
        selectedMarket.noTokenId && trade.asset === selectedMarket.noTokenId;

      const matches =
        matchByConditionId ||
        matchByMarketId ||
        matchByAsset ||
        matchByYesToken ||
        matchByNoToken;

      return matches;
    });

    console.log(
      "[MarketFocus] Filtered trades:",
      filtered.length,
      "of",
      allTrades.length,
    );
    if (filtered.length === 0 && allTrades.length > 0) {
      console.log(
        "[MarketFocus] No matches found. Sample trade:",
        allTrades[0],
      );
      console.log("[MarketFocus] Looking for matches with:", {
        conditionId: selectedMarket.conditionId,
        marketId: selectedMarket.marketId,
        clobTokenIds: selectedMarket.clobTokenIds,
        yesTokenId: selectedMarket.yesTokenId,
        noTokenId: selectedMarket.noTokenId,
      });
    }

    return filtered;
  }, [allTrades, selectedMarket]);

  // Calculate market stats from recent trades
  const marketStats = useMemo(() => {
    if (marketTrades.length === 0) {
      return {
        totalVolume: 0,
        avgPrice: 0,
        priceChange: 0,
        tradeCount: 0,
        lastPrice: 0,
        buyVolume: 0,
        sellVolume: 0,
      };
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentTrades = marketTrades.filter((t) => t.timestamp > oneHourAgo);

    const totalVolume = marketTrades.reduce(
      (sum, t) => sum + parseFloat(t.price) * parseFloat(t.size),
      0,
    );

    const avgPrice =
      marketTrades.reduce((sum, t) => sum + parseFloat(t.price), 0) /
      marketTrades.length;

    const sortedByTime = [...marketTrades].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    const lastPrice = parseFloat(sortedByTime[0]?.price || "0");

    // Calculate price change (last vs 1 hour ago)
    const oldTrades = marketTrades.filter((t) => t.timestamp <= oneHourAgo);
    const oldPrice =
      oldTrades.length > 0
        ? parseFloat(oldTrades[oldTrades.length - 1].price)
        : lastPrice;
    const priceChange = ((lastPrice - oldPrice) / oldPrice) * 100;

    const buyVolume = recentTrades
      .filter((t) => t.side === "BUY")
      .reduce((sum, t) => sum + parseFloat(t.price) * parseFloat(t.size), 0);

    const sellVolume = recentTrades
      .filter((t) => t.side === "SELL")
      .reduce((sum, t) => sum + parseFloat(t.price) * parseFloat(t.size), 0);

    return {
      totalVolume,
      avgPrice,
      priceChange: isFinite(priceChange) ? priceChange : 0,
      tradeCount: marketTrades.length,
      lastPrice,
      buyVolume,
      sellVolume,
    };
  }, [marketTrades]);

  // Get orderbook stats
  const orderbookStats = useMemo(() => {
    if (!selectedMarket) return { bids: 0, asks: 0, spread: 0, midPrice: 0 };

    const tokenId =
      selectedMarket.clobTokenIds?.[0] || selectedMarket.yesTokenId;
    if (!tokenId) return { bids: 0, asks: 0, spread: 0, midPrice: 0 };

    const depth = orderbookDepth.get(tokenId);
    if (!depth || depth.bids.length === 0 || depth.asks.length === 0) {
      return { bids: 0, asks: 0, spread: 0, midPrice: 0 };
    }

    const bestBid = parseFloat(depth.bids[0].price);
    const bestAsk = parseFloat(depth.asks[0].price);
    const spread = ((bestAsk - bestBid) / bestBid) * 100;
    const midPrice = (bestBid + bestAsk) / 2;

    return {
      bids: depth.bids.length,
      asks: depth.asks.length,
      spread: isFinite(spread) ? spread : 0,
      midPrice: isFinite(midPrice) ? midPrice : 0,
    };
  }, [selectedMarket, orderbookDepth]);

  // Fetch full market data when selected market changes
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!selectedMarket) {
        setFullMarketData(null);
        setFullEventData(null);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        // Try to get from store first
        let found = false;
        eventOutcomes.forEach((eo) => {
          const match = eo.markets.find(
            (m) => m.id === selectedMarket.marketId,
          );
          if (match) {
            found = true;
            setFullMarketData(match);
          }
        });

        // If not in store, fetch from API
        if (!found && selectedMarket.eventSlug) {
          console.log(
            "[MarketFocus] Fetching event from API:",
            selectedMarket.eventSlug,
          );
          const event = await gammaAPI.fetchEventBySlug(
            selectedMarket.eventSlug,
          );

          if (event) {
            setFullEventData(event);
            const normalizedMarkets =
              gammaAPI.getNormalizedMarketsFromEvent(event);
            const market = normalizedMarkets.find(
              (m) => m.id === selectedMarket.marketId,
            );

            if (market) {
              setFullMarketData(market);
            } else {
              // Try by conditionId
              const byCondition = normalizedMarkets.find(
                (m) => m.conditionId === selectedMarket.conditionId,
              );
              if (byCondition) {
                setFullMarketData(byCondition);
              }
            }
          }
        }
      } catch (error: any) {
        console.error("[MarketFocus] Error fetching market data:", error);
        setFetchError("Failed to load complete market data");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedMarket, eventOutcomes]);

  // Check if this is an event-level view (multiple related markets in store)
  const relatedMarkets = useMemo(() => {
    if (!selectedMarket) return [];
    const markets: NormalizedMarket[] = [];
    eventOutcomes.forEach((eo) => {
      if (eo.eventId === selectedMarket.eventId) {
        markets.push(...eo.markets);
      }
    });
    return markets;
  }, [eventOutcomes, selectedMarket]);

  const isEventLevelView = relatedMarkets.length > 1;

  if (!selectedMarket) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-mono font-bold text-foreground">
            NO MARKET SELECTED
          </h2>
          <p className="text-muted-foreground font-mono text-sm max-w-md">
            Select a market from the header to view detailed market information,
            live trades, and orderbook depth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* Market Header */}
      <div className="panel flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {selectedMarket.icon && (
              <img
                src={selectedMarket.icon}
                alt=""
                className="w-16 h-16 rounded-full flex-shrink-0 border-2 border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-mono font-bold text-foreground break-words">
                  {selectedMarket.eventTitle}
                </h1>
                {isEventLevelView && (
                  <span className="px-2 py-1 text-xs font-mono bg-primary/20 text-primary rounded flex-shrink-0">
                    {relatedMarkets.length} MARKETS
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-mono mb-2 break-words">
                {isEventLevelView
                  ? `Viewing ${selectedMarket.name} and ${relatedMarkets.length - 1} other ${relatedMarkets.length - 1 === 1 ? "market" : "markets"}`
                  : selectedMarket.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedMarket.slug && (
                  <a
                    href={`https://polymarket.com/event/${selectedMarket.eventSlug || selectedMarket.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-mono border border-border bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    POLYMARKET
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Markets Panel (for event-level views) */}
      {isEventLevelView && relatedMarkets.length > 1 && (
        <div className="panel">
          <h3 className="text-sm font-mono font-bold mb-3">
            ALL MARKETS IN THIS EVENT
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {relatedMarkets.map((market) => (
              <button
                key={market.id}
                onClick={() => {
                  const syntheticEvent: GammaEvent = {
                    id: selectedMarket.eventId,
                    ticker: selectedMarket.eventTitle,
                    slug: selectedMarket.eventSlug,
                    title: selectedMarket.eventTitle,
                    description: "",
                    startDate: new Date().toISOString(),
                    creationDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    active: true,
                    closed: false,
                    archived: false,
                    featured: false,
                    restricted: false,
                    liquidity: 0,
                    volume: 0,
                    openInterest: 0,
                    commentCount: 0,
                    markets: [],
                    icon: market.icon,
                    image: market.image,
                  };
                  const selectedState = toSelectedMarketState(
                    market,
                    syntheticEvent,
                  );
                  usePolymarketStore
                    .getState()
                    .setSelectedMarket(selectedState);
                }}
                className={`text-left p-2 rounded border transition-colors ${
                  market.id === selectedMarket.marketId
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="text-xs font-mono font-semibold truncate">
                  {market.displayName || market.title}
                </div>
                {market.primaryOutcome && (
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    {Math.round(market.primaryOutcome.probability * 100)}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Market Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 flex-shrink-0">
        {/* Last Price */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1">
            LAST PRICE
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            ${marketStats.lastPrice.toFixed(3)}
          </div>
        </div>

        {/* Price Change */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1">
            1H CHANGE
          </div>
          <div
            className={`text-lg font-mono font-bold flex items-center gap-1 ${
              marketStats.priceChange >= 0 ? "text-buy" : "text-sell"
            }`}
          >
            {marketStats.priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {marketStats.priceChange >= 0 ? "+" : ""}
            {marketStats.priceChange.toFixed(2)}%
          </div>
        </div>

        {/* Total Volume */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            VOLUME
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {formatUSD(marketStats.totalVolume)}
          </div>
        </div>

        {/* Trade Count */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            TRADES
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {marketStats.tradeCount}
          </div>
        </div>

        {/* Buy Volume */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1">
            BUY (1H)
          </div>
          <div className="text-lg font-mono font-bold text-buy">
            {formatUSD(marketStats.buyVolume)}
          </div>
        </div>

        {/* Sell Volume */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1">
            SELL (1H)
          </div>
          <div className="text-lg font-mono font-bold text-sell">
            {formatUSD(marketStats.sellVolume)}
          </div>
        </div>

        {/* Spread */}
        <div className="panel">
          <div className="text-xs font-mono text-muted-foreground mb-1">
            SPREAD
          </div>
          <div className="text-lg font-mono font-bold text-foreground">
            {orderbookStats.spread.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Market Information */}
      {fullMarketData && (
        <div className="space-y-4">
          {/* Market Description */}
          {fullMarketData.description && (
            <div className="panel">
              <h3 className="text-sm font-mono font-bold mb-2">DESCRIPTION</h3>
              <p className="text-sm font-mono text-muted-foreground">
                {fullMarketData.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Outcomes & Probabilities */}
            {fullMarketData.outcomes && fullMarketData.outcomes.length > 0 && (
              <div className="panel">
                <h3 className="text-sm font-mono font-bold mb-3">
                  OUTCOMES & PRICES
                </h3>
                <div className="space-y-2">
                  {fullMarketData.outcomes.map((outcome) => (
                    <div
                      key={outcome.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-mono">{outcome.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold">
                          {(outcome.probability * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">
                          ${outcome.price.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Metadata */}
            <div className="panel">
              <h3 className="text-sm font-mono font-bold mb-3">MARKET INFO</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Volume:</span>
                  <span className="font-bold">
                    {formatUSD(fullMarketData.volume || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidity:</span>
                  <span className="font-bold">
                    {formatUSD(fullMarketData.liquidity || 0)}
                  </span>
                </div>
                {fullMarketData.endDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closes:</span>
                    <span className="font-bold">
                      {new Date(fullMarketData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {fetchError && (
        <div className="panel border-destructive">
          <p className="text-sm font-mono text-destructive">{fetchError}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Column - Trade Feed */}
        <div className="h-full min-h-[600px] lg:min-h-0 overflow-hidden">
          <TradeFeed overrideTrades={marketTrades} overrideFilters={{}} />
        </div>

        {/* Right Column - Order Book */}
        <div className="h-full min-h-[600px] lg:min-h-0 overflow-hidden">
          <OrderBook />
        </div>
      </div>
    </div>
  );
}
