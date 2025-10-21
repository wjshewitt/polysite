"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface LiquidityData {
  range: string;
  high: number;
  medium: number;
  low: number;
}

export function LiquidityDepth() {
  const [markets, setMarkets] = useState<GammaEvent[]>([]);
  const [liquidityData, setLiquidityData] = useState<LiquidityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 50,
        order: "liquidity",
        ascending: false,
        active: true,
        closed: false,
      });

      setMarkets(events);

      // Create liquidity depth buckets
      const ranges = [
        { min: 0, max: 10000, label: "$0-10K" },
        { min: 10000, max: 50000, label: "$10K-50K" },
        { min: 50000, max: 100000, label: "$50K-100K" },
        { min: 100000, max: 500000, label: "$100K-500K" },
        { min: 500000, max: 1000000, label: "$500K-1M" },
        { min: 1000000, max: Infinity, label: "$1M+" },
      ];

      const depthData: LiquidityData[] = ranges.map((range) => {
        const marketsInRange = events.filter(
          (e) => e.liquidity >= range.min && e.liquidity < range.max
        );

        // Split into high/medium/low volume markets within this liquidity range
        const sorted = marketsInRange.sort((a, b) => b.volume - a.volume);
        const third = Math.ceil(sorted.length / 3);

        const high = sorted.slice(0, third).reduce((sum, m) => sum + m.liquidity, 0);
        const medium = sorted.slice(third, third * 2).reduce((sum, m) => sum + m.liquidity, 0);
        const low = sorted.slice(third * 2).reduce((sum, m) => sum + m.liquidity, 0);

        return {
          range: range.label,
          high,
          medium,
          low,
        };
      });

      setLiquidityData(depthData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching liquidity data:", error);
      setLoading(false);
    }
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading || liquidityData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading liquidity depth data...
        </p>
      </div>
    );
  }

  const totalLiquidity = markets.reduce((sum, m) => sum + m.liquidity, 0);
  const avgLiquidity = totalLiquidity / Math.max(markets.length, 1);
  const topLiquidityMarkets = markets.slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm font-mono font-bold text-neutral">
          LIQUIDITY DEPTH ANALYSIS
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Distribution of market liquidity by trading volume tiers
        </p>
      </div>

      {/* Stacked Area Chart */}
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={liquidityData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(data: any) => {
              if (data && data.activeLabel) {
                setSelectedRange(data.activeLabel);
              }
            }}
            onMouseLeave={() => setSelectedRange(null)}
          >
            <defs>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00FF9C" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#55AFFF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#55AFFF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="range"
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
            />
            <YAxis
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
              tickFormatter={formatVolume}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: "0",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => [
                formatVolume(value),
                name === "high" ? "High Volume" : name === "medium" ? "Medium Volume" : "Low Volume",
              ]}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: "11px",
                paddingTop: "10px",
              }}
              formatter={(value: string) =>
                value === "high" ? "High Volume" : value === "medium" ? "Medium Volume" : "Low Volume"
              }
            />
            <Area
              type="monotone"
              dataKey="high"
              stackId="1"
              stroke="#00FF9C"
              fill="url(#colorHigh)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="medium"
              stackId="1"
              stroke="#55AFFF"
              fill="url(#colorMedium)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="low"
              stackId="1"
              stroke="#FFD700"
              fill="url(#colorLow)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Total Liquidity
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {formatVolume(totalLiquidity)}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Avg Liquidity
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {formatVolume(avgLiquidity)}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Markets Tracked
          </p>
          <p className="text-xl font-mono font-bold text-neutral">{markets.length}</p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Deepest Market
          </p>
          <p className="text-sm font-mono font-bold text-neutral truncate">
            {formatVolume(markets[0]?.liquidity || 0)}
          </p>
        </div>
      </div>

      {/* Selected Range Details */}
      {selectedRange && (
        <div className="panel p-4">
          <p className="text-sm font-mono font-bold text-neutral mb-3">
            Liquidity Range: {selectedRange}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {liquidityData
              .filter((d) => d.range === selectedRange)
              .map((data) => (
                <>
                  <div key="high">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
                      High Volume
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#00FF9C]" />
                      <p className="text-sm font-mono font-bold text-neutral">
                        {formatVolume(data.high)}
                      </p>
                    </div>
                  </div>
                  <div key="medium">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
                      Medium Volume
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#55AFFF]" />
                      <p className="text-sm font-mono font-bold text-neutral">
                        {formatVolume(data.medium)}
                      </p>
                    </div>
                  </div>
                  <div key="low">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
                      Low Volume
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFD700]" />
                      <p className="text-sm font-mono font-bold text-neutral">
                        {formatVolume(data.low)}
                      </p>
                    </div>
                  </div>
                </>
              ))}
          </div>
        </div>
      )}

      {/* Top Liquidity Markets */}
      <div className="panel p-4">
        <p className="text-sm font-mono font-bold text-neutral mb-3">
          TOP 5 MARKETS BY LIQUIDITY
        </p>
        <div className="space-y-2">
          {topLiquidityMarkets.map((market, idx) => (
            <div
              key={market.id}
              className="flex items-center justify-between p-2 border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono font-bold text-muted-foreground w-6">
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-neutral truncate">
                    {market.ticker}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">
                    {market.title}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-mono font-bold text-neutral">
                  {formatVolume(market.liquidity)}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Vol: {formatVolume(market.volume)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
