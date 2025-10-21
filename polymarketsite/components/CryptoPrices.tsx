"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CryptoPriceDisplay {
  symbol: string;
  displayName: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  timestamp: number;
}

export function CryptoPrices() {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  const [prices, setPrices] = useState<CryptoPriceDisplay[]>([]);

  useEffect(() => {
    console.log("🔍 CryptoPrices: cryptoPrices Map size:", cryptoPrices.size);
    console.log(
      "🔍 CryptoPrices: cryptoPrices keys:",
      Array.from(cryptoPrices.keys()),
    );

    const priceArray: CryptoPriceDisplay[] = [];

    // Map of symbols to display names
    const symbolMap: Record<string, string> = {
      BTCUSDT: "BTC",
      ETHUSDT: "ETH",
      SOLUSDT: "SOL",
      XRPUSDT: "XRP",
      ADAUSDT: "ADA",
      DOGEUSDT: "DOGE",
      MATICUSDT: "MATIC",
      AVAXUSDT: "AVAX",
      DOTUSDT: "DOT",
      LINKUSDT: "LINK",
      "MATIC-USD": "MATIC",
      "ETH-USD": "ETH",
      "USDC-USD": "USDC",
    };

    cryptoPrices.forEach((price, symbol) => {
      const displayName = symbolMap[symbol] || symbol.replace("USDT", "");
      console.log(`🔍 Processing ${symbol} -> ${displayName}: $${price.price}`);
      priceArray.push({
        symbol,
        displayName,
        price: price.price,
        change24h: price.change24h,
        volume24h: price.volume24h,
        marketCap: price.marketCap,
        timestamp: price.timestamp,
      });
    });

    // Sort by display name
    priceArray.sort((a, b) => a.displayName.localeCompare(b.displayName));
    console.log("🔍 CryptoPrices: Final priceArray length:", priceArray.length);
    setPrices(priceArray);
  }, [cryptoPrices]);

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num)) return "$0.00";

    if (num >= 1000) {
      return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (num >= 1) {
      return `$${num.toFixed(2)}`;
    } else if (num >= 0.01) {
      return `$${num.toFixed(4)}`;
    } else {
      return `$${num.toFixed(6)}`;
    }
  };

  const formatChange = (
    change: string,
  ): { text: string; positive: boolean } => {
    const num = parseFloat(change);
    if (isNaN(num)) return { text: "0.00%", positive: false };

    const positive = num >= 0;
    const sign = positive ? "+" : "";
    return {
      text: `${sign}${(num * 100).toFixed(2)}%`,
      positive,
    };
  };

  const formatVolume = (volume: string): string => {
    const num = parseFloat(volume);
    if (isNaN(num)) return "$0";

    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const formatMarketCap = (marketCap: string): string => {
    const num = parseFloat(marketCap);
    if (isNaN(num)) return "$0";

    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    return `$${num.toFixed(0)}`;
  };

  const getTimeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (prices.length === 0) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-muted-foreground font-mono text-sm">
            ⏳ Connecting to crypto price feed...
          </div>
          <div className="text-muted-foreground/80 font-mono text-xs">
            Live prices via Polymarket WebSocket
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border border-border flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex-shrink-0 bg-gradient-to-r from-background to-muted/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-buy rounded-full animate-pulse"></div>
            <h2 className="text-foreground font-mono text-sm font-semibold tracking-wider">
              CRYPTO MARKETS
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground font-mono text-xs">
              {prices.length} assets
            </div>
            <div className="text-muted-foreground/80 font-mono text-xs">• Live feed</div>
          </div>
        </div>
      </div>

      {/* Prices Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {prices.map((price) => {
              const change = formatChange(price.change24h);
              return (
                <div
                  key={price.symbol}
                  className="bg-muted border border-border p-4 hover:border-neutral transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-neutral/10"
                >
                  {/* Header: Symbol & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-foreground font-mono text-base font-bold tracking-wide">
                      {price.displayName}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {getTimeSince(price.timestamp)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
                      {formatPrice(price.price)}
                    </span>
                  </div>

                  {/* 24h Change */}
                  <div className="mb-3">
                    <span
                      className={`font-mono text-sm font-semibold px-2 py-1 rounded ${
                        change.positive
                          ? "text-buy bg-buy/10"
                          : "text-sell bg-sell/10"
                      }`}
                    >
                      {change.text}
                    </span>
                  </div>

                  {/* Sparkline Placeholder */}
                  <div className="mb-3 h-8 bg-background border border-border flex items-center justify-center">
                    <span className="text-muted-foreground/80 font-mono text-xs">
                      Chart
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-1.5 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-mono text-xs">
                        Volume 24h
                      </span>
                      <span className="text-foreground font-mono text-xs font-semibold">
                        {formatVolume(price.volume24h)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-mono text-xs">
                        Market Cap
                      </span>
                      <span className="text-foreground font-mono text-xs font-semibold">
                        {formatMarketCap(price.marketCap)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex-shrink-0 bg-gradient-to-r from-muted/60 to-background">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground font-mono text-xs">
            💰 Live prices via Polymarket WebSocket API
          </div>
          <div className="text-muted-foreground/80 font-mono text-xs">
            Updates every ~3s
          </div>
        </div>
      </div>
    </div>
  );
}
