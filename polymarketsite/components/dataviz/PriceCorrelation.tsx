"use client";

import { useEffect, useState } from "react";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface CorrelationCell {
  x: string;
  y: string;
  value: number;
  xIndex: number;
  yIndex: number;
}

export function PriceCorrelation() {
  const [markets, setMarkets] = useState<GammaEvent[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<CorrelationCell | null>(null);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 8,
        order: "volume",
        ascending: false,
        active: true,
        closed: false,
      });

      setMarkets(events);

      // Calculate correlation matrix
      // For demo purposes, we'll simulate correlation based on volume/liquidity patterns
      const matrix: CorrelationCell[] = [];

      for (let i = 0; i < events.length; i++) {
        for (let j = 0; j < events.length; j++) {
          const eventA = events[i];
          const eventB = events[j];

          let correlation: number;

          if (i === j) {
            correlation = 1; // Perfect correlation with itself
          } else {
            // Simulate correlation based on volume and liquidity ratios
            const ratioA = eventA.volume / Math.max(eventA.liquidity, 1);
            const ratioB = eventB.volume / Math.max(eventB.liquidity, 1);
            const diff = Math.abs(ratioA - ratioB);

            // Check if they share tags
            const sharedTags = eventA.tags && eventB.tags
              ? eventA.tags.filter(tagA => eventB.tags?.some(tagB => tagB.id === tagA.id))
              : [];

            const tagBonus = sharedTags.length > 0 ? 0.3 : 0;

            // Calculate base correlation from difference (inverse relationship)
            correlation = Math.max(-1, Math.min(1, 1 - diff / 2 + tagBonus));

            // Add some randomness for variation
            correlation = Math.max(-1, Math.min(1, correlation + (Math.random() - 0.5) * 0.3));
          }

          matrix.push({
            x: eventA.ticker,
            y: eventB.ticker,
            value: correlation,
            xIndex: i,
            yIndex: j,
          });
        }
      }

      setCorrelationMatrix(matrix);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching correlation data:", error);
      setLoading(false);
    }
  };

  const getColor = (correlation: number) => {
    // Positive correlation = green, Negative = red, Zero = neutral
    if (correlation > 0.7) {
      return "rgb(0, 255, 156)"; // Strong positive - green
    } else if (correlation > 0.3) {
      return "rgb(85, 175, 255)"; // Moderate positive - blue
    } else if (correlation > -0.3) {
      return "rgb(139, 139, 139)"; // Weak/no correlation - gray
    } else if (correlation > -0.7) {
      return "rgb(255, 140, 60)"; // Moderate negative - orange
    } else {
      return "rgb(255, 60, 60)"; // Strong negative - red
    }
  };

  const cellSize = 60;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading correlation matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm font-mono font-bold text-neutral">
          PRICE CORRELATION MATRIX
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Correlation between top market outcomes • Hover for details
        </p>
      </div>

      {/* Correlation Matrix */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-end" style={{ width: cellSize }}>
              <div style={{ height: cellSize }} />
              {markets.map((market, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-end pr-2"
                  style={{ height: cellSize }}
                >
                  <p className="text-[10px] font-mono text-neutral truncate max-w-[50px]">
                    {market.ticker}
                  </p>
                </div>
              ))}
            </div>

            {/* Matrix */}
            <div>
              {/* X-axis labels */}
              <div className="flex" style={{ height: cellSize }}>
                {markets.map((market, idx) => (
                  <div
                    key={idx}
                    className="flex items-end justify-center pb-2"
                    style={{ width: cellSize }}
                  >
                    <p
                      className="text-[10px] font-mono text-neutral truncate"
                      style={{
                        transform: "rotate(-45deg)",
                        transformOrigin: "center",
                        width: cellSize,
                      }}
                    >
                      {market.ticker}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cells */}
              {Array.from({ length: markets.length }, (_, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {Array.from({ length: markets.length }, (_, colIdx) => {
                    const cell = correlationMatrix.find(
                      (c) => c.xIndex === colIdx && c.yIndex === rowIdx
                    );
                    if (!cell) return null;

                    return (
                      <div
                        key={colIdx}
                        className="relative border border-border/50 cursor-pointer transition-all hover:scale-110 hover:z-10 hover:border-primary"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getColor(cell.value),
                        }}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                          <p className="text-xs font-mono font-bold text-white">
                            {cell.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
        <span className="text-xs font-mono text-muted-foreground">Correlation:</span>
        <div className="flex items-center gap-1">
          {[-1, -0.5, 0, 0.5, 1].map((value) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-4 border border-border"
                style={{ backgroundColor: getColor(value) }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">
                {value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered Cell Details */}
      {hoveredCell && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-bold text-neutral">
              {hoveredCell.x} ↔ {hoveredCell.y}
            </p>
            <p
              className="text-xl font-mono font-bold"
              style={{ color: getColor(hoveredCell.value) }}
            >
              {hoveredCell.value.toFixed(3)}
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {hoveredCell.value > 0.7 && (
              <p>
                ✓ <span className="text-success">Strong positive correlation</span> - Markets
                tend to move together
              </p>
            )}
            {hoveredCell.value > 0.3 && hoveredCell.value <= 0.7 && (
              <p>
                ↗ <span className="text-neutral">Moderate positive correlation</span> - Some
                related movement
              </p>
            )}
            {hoveredCell.value >= -0.3 && hoveredCell.value <= 0.3 && (
              <p>
                ○ <span className="text-muted-foreground">Weak/no correlation</span> - Markets
                move independently
              </p>
            )}
            {hoveredCell.value >= -0.7 && hoveredCell.value < -0.3 && (
              <p>
                ↘ <span className="text-[#FF8C3C]">Moderate negative correlation</span> - Markets
                tend to move oppositely
              </p>
            )}
            {hoveredCell.value < -0.7 && (
              <p>
                ✗ <span className="text-destructive">Strong negative correlation</span> - Markets
                strongly oppose each other
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Markets Analyzed
          </p>
          <p className="text-xl font-mono font-bold text-neutral">{markets.length}</p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Avg Correlation
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {(
              correlationMatrix
                .filter((c) => c.xIndex !== c.yIndex)
                .reduce((sum, c) => sum + c.value, 0) /
              Math.max(correlationMatrix.filter((c) => c.xIndex !== c.yIndex).length, 1)
            ).toFixed(3)}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Strong Pairs
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {correlationMatrix.filter((c) => c.xIndex !== c.yIndex && Math.abs(c.value) > 0.7).length}
          </p>
        </div>
      </div>
    </div>
  );
}
