"use client";

import { useEffect, useState } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
} from "lucide-react";
import { buildEventOutcomes } from "@/lib/markets";
import type { NormalizedMarket, Outcome } from "@/types/markets";
import { gammaAPI } from "@/services/gamma";
import { Badge } from "@/components/ui/badge";

interface CryptoMarket {
  id: string;
  question: string;
  markets: NormalizedMarket[];
  volume: number;
  liquidity: number;
  change24h?: number;
}

export function CryptoMarkets() {
  const [markets, setMarkets] = useState<CryptoMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const trades = usePolymarketStore((state) => state.trades);
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);

  useEffect(() => {
    fetchCryptoMarkets();
  }, []);

  const fetchCryptoMarkets = async () => {
    try {
      setLoading(true);
      const events = await gammaAPI.fetchEvents({
        limit: 50,
        order: "volume",
        ascending: false,
        closed: false,
        active: true,
        archived: false,
      });

      const cryptoMarkets: CryptoMarket[] = events
        .filter((event) => {
          const question = event.title?.toLowerCase() ?? "";
          return (
            question.includes("bitcoin") ||
            question.includes("btc") ||
            question.includes("ethereum") ||
            question.includes("eth") ||
            question.includes("crypto") ||
            question.includes("solana") ||
            question.includes("sol") ||
            question.includes("dogecoin") ||
            question.includes("xrp") ||
            question.includes("cardano")
          );
        })
        .map((event) => {
          const normalized = buildEventOutcomes(event);

          return {
            id: event.id,
            question: event.title,
            markets: normalized?.markets ?? [],
            volume: Number(event.volume ?? 0),
            liquidity: Number(event.liquidity ?? 0),
            change24h: Math.random() * 20 - 10, // Mock data - would need historical data
          } satisfies CryptoMarket;
        });

      setMarkets(cryptoMarkets.slice(0, 20));
    } catch (error) {
      console.error("Error fetching crypto markets:", error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const formatPrice = (outcome: Outcome | undefined) => {
    if (!outcome) return "$0.00";
    return `$${outcome.price.toFixed(2)}`;
  };

  return (
    <div className="panel h-full min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-secondary">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground font-mono text-[11px] sm:text-sm lg:text-base font-bold tracking-tight">
            ₿ CRYPTO MARKETS
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-[11px] sm:text-xs">
              {markets.length} Active Markets
            </span>
            <button
              onClick={fetchCryptoMarkets}
              className="text-neutral hover:text-neutral/80 text-[11px] sm:text-xs font-mono"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Live Crypto Prices Bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-muted">
        <div className="flex items-center gap-4 overflow-x-auto">
          {Object.entries(cryptoPrices)
            .slice(0, 5)
            .map(([symbol, price]) => (
              <div
                key={symbol}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-muted-foreground font-mono text-[11px] sm:text-xs">
                  {symbol}:
                </span>
                <span className="text-foreground font-mono text-[11px] sm:text-xs font-bold">
                  ${typeof price === "number" ? price.toFixed(2) : price}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Markets List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-mono text-xs sm:text-sm">
                Loading crypto markets...
              </p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-mono text-xs sm:text-sm">
                No crypto markets found
              </p>
            </div>
          ) : (
            markets.map((market) => (
              <div
                key={market.id}
                className="bg-muted border border-border hover:border-neutral/30 transition-all p-3 cursor-pointer group"
              >
                {/* Market Question */}
                <div className="mb-2">
                  <h3 className="text-foreground font-mono text-[11px] sm:text-xs font-semibold group-hover:text-neutral transition-colors line-clamp-2">
                    {market.question}
                  </h3>
                </div>

                {/* Price Info */}
                <div className="grid gap-2 mb-2">
                  {market.markets.map((normalizedMarket) => {
                    const outcome =
                      normalizedMarket.outcomes.find(
                        (o) => o.name.toLowerCase() === "yes",
                      ) || normalizedMarket.outcomes[0];
                    return (
                      <div
                        key={normalizedMarket.id}
                        className="bg-muted border border-border p-2 flex items-center justify-between"
                      >
                        <div className="font-mono text-[10px] font-semibold text-muted-foreground">
                          {normalizedMarket.primaryOutcome?.name ??
                            normalizedMarket.title}
                        </div>
                        <div className="flex items-center gap-2">
                          {outcome?.spreadWarning && (
                            <Badge variant="warning">Wide Spread</Badge>
                          )}
                          <div className="font-mono text-xs sm:text-sm font-bold text-buy">
                            {formatPrice(outcome)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] md:text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatVolume(market.volume)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{formatVolume(market.liquidity)}</span>
                    </div>
                  </div>
                  {market.change24h !== undefined && (
                    <div
                      className={`flex items-center gap-1 ${
                        market.change24h >= 0 ? "text-success" : "text-sell"
                      }`}
                    >
                      {market.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(market.change24h).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-secondary">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-muted-foreground">
          <span>
            Total Volume:{" "}
            {formatVolume(markets.reduce((sum, m) => sum + m.volume, 0))}
          </span>
          <span>Live Trades: {trades.length}</span>
        </div>
      </div>
    </div>
  );
}
