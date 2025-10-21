"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { useEffect, useState } from "react";

export function CryptoTicker() {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  const [isScrolling, setIsScrolling] = useState(true);

  const prices = Array.from(cryptoPrices.values());

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

  // Sort by symbol for consistent ordering
  const sortedPrices = prices.sort((a, b) => a.symbol.localeCompare(b.symbol));

  // Format price with appropriate precision
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

  // Format percentage change
  const formatPercentage = (value: string): string => {
    const num = parseFloat(value) * 100;
    if (isNaN(num)) return "0.00%";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  if (sortedPrices.length === 0) {
    return null;
  }

  // Duplicate prices array for seamless loop
  const duplicatedPrices = [...sortedPrices, ...sortedPrices];

  return (
    <div className="bg-card border border-border overflow-hidden relative">
      {/* Ticker Label */}
      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-background via-background to-transparent px-4 flex items-center z-10 border-r border-border">
        <span className="text-foreground font-mono text-xs font-bold tracking-wider">
          LIVE CRYPTO
        </span>
      </div>

      {/* Scrolling Container */}
      <div
        className="flex items-center gap-8 py-3 pl-40"
        onMouseEnter={() => setIsScrolling(false)}
        onMouseLeave={() => setIsScrolling(true)}
      >
        <div
          className={`flex items-center gap-8 ${isScrolling ? "animate-scroll" : ""}`}
        >
          {duplicatedPrices.map((crypto, index) => {
            const change = parseFloat(crypto.change24h) * 100;
            const isPositive = change >= 0;
            const displayName =
              symbolMap[crypto.symbol] ||
              crypto.symbol.replace("USDT", "").replace("-USD", "");

            return (
              <div
                key={`${crypto.symbol}-${index}`}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div className="font-mono font-bold text-sm text-foreground">
                    {displayName}
                  </div>
                  <div className="font-mono text-sm text-foreground">
                    {formatPrice(crypto.price)}
                  </div>
                  <div
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isPositive ? "text-buy bg-buy/10" : "text-sell bg-sell/10"
                    }`}
                  >
                    {formatPercentage(crypto.change24h)}
                  </div>
                </div>
                <div className="w-px h-4 bg-border"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add scroll animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
