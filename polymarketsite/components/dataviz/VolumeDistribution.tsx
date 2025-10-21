"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface DistributionBucket {
  range: string;
  count: number;
  totalVolume: number;
  markets: string[];
}

export function VolumeDistribution() {
  const [buckets, setBuckets] = useState<DistributionBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBucket, setHoveredBucket] = useState<DistributionBucket | null>(null);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 50,
        order: "volume",
        ascending: false,
        active: true,
        closed: false,
      });

      // Create volume buckets
      const ranges = [
        { min: 0, max: 10000, label: "$0-$10K" },
        { min: 10000, max: 50000, label: "$10K-$50K" },
        { min: 50000, max: 100000, label: "$50K-$100K" },
        { min: 100000, max: 500000, label: "$100K-$500K" },
        { min: 500000, max: 1000000, label: "$500K-$1M" },
        { min: 1000000, max: Infinity, label: "$1M+" },
      ];

      const distribution: DistributionBucket[] = ranges.map((range) => {
        const marketsInRange = events.filter(
          (e) => e.volume >= range.min && e.volume < range.max
        );

        return {
          range: range.label,
          count: marketsInRange.length,
          totalVolume: marketsInRange.reduce((sum, m) => sum + m.volume, 0),
          markets: marketsInRange.slice(0, 5).map((m) => m.ticker),
        };
      });

      setBuckets(distribution);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching distribution data:", error);
      setLoading(false);
    }
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getBarColor = (index: number) => {
    const colors = [
      "#FF3C3C",
      "#FF8C3C",
      "#FFD700",
      "#00FF9C",
      "#55AFFF",
      "#9D4EDD",
    ];
    return colors[index] || "#55AFFF";
  };

  if (loading || buckets.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading distribution data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm font-mono font-bold text-neutral">
          VOLUME DISTRIBUTION BY MARKET SIZE
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Distribution of active markets across volume ranges
        </p>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={buckets}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(data: any) => {
              if (data && data.activePayload && data.activePayload[0]) {
                setHoveredBucket(data.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredBucket(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="range"
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
            />
            <YAxis
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
              label={{
                value: "# of Markets",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: "11px", fontFamily: "monospace", fill: "#8b8b8b" },
              }}
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
                name === "count" ? value : formatVolume(value),
                name === "count" ? "Markets" : "Total Volume",
              ]}
            />
            <Bar dataKey="count" radius={[0, 0, 0, 0]}>
              {buckets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Total Markets
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {buckets.reduce((sum, b) => sum + b.count, 0)}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Total Volume
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {formatVolume(buckets.reduce((sum, b) => sum + b.totalVolume, 0))}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Avg Volume
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {formatVolume(
              buckets.reduce((sum, b) => sum + b.totalVolume, 0) /
                Math.max(buckets.reduce((sum, b) => sum + b.count, 0), 1)
            )}
          </p>
        </div>
      </div>

      {/* Hovered Bucket Details */}
      {hoveredBucket && hoveredBucket.count > 0 && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-bold text-neutral">
              {hoveredBucket.range}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {hoveredBucket.count} {hoveredBucket.count === 1 ? "market" : "markets"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">
                Total Volume
              </p>
              <p className="text-sm font-mono font-bold text-neutral">
                {formatVolume(hoveredBucket.totalVolume)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">
                Avg per Market
              </p>
              <p className="text-sm font-mono font-bold text-neutral">
                {formatVolume(hoveredBucket.totalVolume / Math.max(hoveredBucket.count, 1))}
              </p>
            </div>
          </div>
          {hoveredBucket.markets.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">
                Sample Markets
              </p>
              <div className="flex flex-wrap gap-1">
                {hoveredBucket.markets.map((ticker, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono bg-muted text-neutral px-2 py-1"
                  >
                    {ticker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
