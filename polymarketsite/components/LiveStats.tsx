"use client";

import { useMemo } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { formatLargeNumber, formatPrice } from "@/lib/utils";
import { TrendingUp, Activity, DollarSign, BarChart3 } from "lucide-react";

export function LiveStats() {
  const trades = usePolymarketStore((state) => state.trades);
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);

  const stats = useMemo(() => {
    // Calculate total volume
    const totalVolume = trades.reduce((sum, trade) => {
      const size = parseFloat(trade.size);
      const price = parseFloat(trade.price);
      return sum + size * price;
    }, 0);

    // Calculate average trade size
    const avgTradeSize =
      trades.length > 0
        ? trades.reduce((sum, trade) => sum + parseFloat(trade.size), 0) / trades.length
        : 0;

    // Count unique markets
    const uniqueMarkets = new Set(trades.map((t) => t.market)).size;

    // Buy vs Sell ratio
    const buyCount = trades.filter((t) => t.side === "BUY").length;
    const sellCount = trades.filter((t) => t.side === "SELL").length;
    const buyRatio = trades.length > 0 ? (buyCount / trades.length) * 100 : 50;

    return {
      totalVolume,
      avgTradeSize,
      uniqueMarkets,
      buyRatio,
      totalTrades: trades.length,
    };
  }, [trades]);

  const statCards = [
    {
      label: "TOTAL VOLUME",
      value: `$${formatLargeNumber(stats.totalVolume)}`,
      icon: DollarSign,
      color: "text-neutral",
    },
    {
      label: "ACTIVE MARKETS",
      value: stats.uniqueMarkets.toString(),
      icon: BarChart3,
      color: "text-neutral",
    },
    {
      label: "TOTAL TRADES",
      value: stats.totalTrades.toString(),
      icon: Activity,
      color: "text-neutral",
    },
    {
      label: "AVG TRADE SIZE",
      value: formatLargeNumber(stats.avgTradeSize),
      icon: TrendingUp,
      color: "text-neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="panel">
          <div className="flex items-start justify-between mb-3">
            <div className="text-xs font-mono text-muted-foreground">{stat.label}</div>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="text-2xl font-mono font-bold">{stat.value}</div>

          {/* Buy/Sell Ratio Bar */}
          {stat.label === "TOTAL TRADES" && trades.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-buy">BUY {stats.buyRatio.toFixed(0)}%</span>
                <span className="text-sell">SELL {(100 - stats.buyRatio).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-secondary flex">
                <div
                  className="bg-buy"
                  style={{ width: `${stats.buyRatio}%` }}
                />
                <div
                  className="bg-sell"
                  style={{ width: `${100 - stats.buyRatio}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
