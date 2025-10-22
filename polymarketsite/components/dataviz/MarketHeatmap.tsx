"use client";

import { useEffect, useState } from "react";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface HeatmapCell {
  id: string;
  ticker: string;
  title: string;
  volume: number;
  priceChange: number;
  liquidity: number;
}

export function MarketHeatmap() {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [sortBy, setSortBy] = useState<"volume" | "liquidity">("volume");

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000);
    return () => clearInterval(interval);
  }, [sortBy]);

  const fetchMarkets = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 20,
        order: sortBy,
        ascending: false,
        active: true,
        closed: false,
      });

      const heatmapCells: HeatmapCell[] = events.map((event) => {
        // Calculate simulated price change based on volume/liquidity ratio
        const ratio = event.volume / Math.max(event.liquidity, 1);
        const priceChange = (ratio * 10) - 5; // Range roughly -5% to +5%

        return {
          id: event.id,
          ticker: event.ticker,
          title: event.title,
          volume: event.volume,
          priceChange: Math.max(-10, Math.min(10, priceChange)),
          liquidity: event.liquidity,
        };
      });

      setCells(heatmapCells);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching markets:", error);
      setLoading(false);
    }
  };

  const getColor = (priceChange: number) => {
    // Negative = red, Positive = green, Near zero = neutral
    if (priceChange > 0) {
      const intensity = Math.min(priceChange / 10, 1);
      const r = Math.floor(0 * intensity);
      const g = Math.floor(255 * intensity);
      const b = Math.floor(156 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (priceChange < 0) {
      const intensity = Math.min(Math.abs(priceChange) / 10, 1);
      const r = Math.floor(255 * intensity);
      const g = Math.floor(60 * intensity);
      const b = Math.floor(60 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return "rgb(85, 175, 255)"; // neutral blue
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading market heatmap...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono font-bold text-neutral">
            MARKET PRICE MOVEMENT HEATMAP
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Color intensity shows relative price momentum • Click cells for details
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("volume")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              sortBy === "volume"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            BY VOLUME
          </button>
          <button
            onClick={() => setSortBy("liquidity")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              sortBy === "liquidity"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            BY LIQUIDITY
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="relative aspect-square border border-border cursor-pointer transition-all hover:scale-105 hover:z-10 hover:shadow-lg"
            style={{
              backgroundColor: getColor(cell.priceChange),
            }}
            onMouseEnter={() => setHoveredCell(cell)}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="absolute inset-0 p-2 flex flex-col justify-between bg-black/30 hover:bg-black/50 transition-colors">
              <div>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {cell.ticker}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-white">
                  {cell.priceChange > 0 ? "+" : ""}
                  {cell.priceChange.toFixed(1)}%
                </p>
                <p className="text-[10px] font-mono text-white/70">
                  {formatVolume(cell.volume)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1">
            {[-10, -5, 0, 5, 10].map((value) => (
              <div
                key={value}
                className="w-8 h-4 border border-border"
                style={{ backgroundColor: getColor(value) }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            -10% → +10%
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {cells.length} active markets
        </div>
      </div>

      {/* Hovered Cell Info */}
      {hoveredCell && (
        <div className="panel p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-mono font-bold text-neutral mb-1">
                {hoveredCell.ticker}
              </p>
              <p className="text-xs font-mono text-muted-foreground mb-3 line-clamp-2">
                {hoveredCell.title}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Volume
                  </p>
                  <p className="text-sm font-mono font-bold text-neutral">
                    {formatVolume(hoveredCell.volume)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Liquidity
                  </p>
                  <p className="text-sm font-mono font-bold text-neutral">
                    {formatVolume(hoveredCell.liquidity)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Momentum
                  </p>
                  <p
                    className="text-sm font-mono font-bold"
                    style={{ color: hoveredCell.priceChange >= 0 ? "#00FF9C" : "#FF3C3C" }}
                  >
                    {hoveredCell.priceChange > 0 ? "+" : ""}
                    {hoveredCell.priceChange.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
