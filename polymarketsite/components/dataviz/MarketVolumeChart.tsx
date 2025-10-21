"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface VolumeData {
  timestamp: string;
  [key: string]: string | number;
}

export function MarketVolumeChart() {
  const [markets, setMarkets] = useState<GammaEvent[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "area">("area");

  useEffect(() => {
    fetchMarketsAndInitialize();
    const interval = setInterval(updateData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketsAndInitialize = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 5,
        order: "volume",
        ascending: false,
        active: true,
        closed: false,
      });

      setMarkets(events);

      // Initialize with 20 historical data points
      const initialData: VolumeData[] = [];
      const now = Date.now();
      
      for (let i = 19; i >= 0; i--) {
        const timestamp = new Date(now - i * 30000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        
        const dataPoint: VolumeData = { timestamp };
        
        events.forEach((event, idx) => {
          if (idx < 3) {
            // Add slight variation to simulate historical data
            const variation = 1 + (Math.random() - 0.5) * 0.1;
            dataPoint[event.ticker] = Math.max(0, event.volume * variation);
          }
        });
        
        initialData.push(dataPoint);
      }

      setVolumeData(initialData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching market data:", error);
      setLoading(false);
    }
  };

  const updateData = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 5,
        order: "volume",
        ascending: false,
        active: true,
        closed: false,
      });

      setMarkets(events);

      const now = Date.now();
      const newDataPoint: VolumeData = {
        timestamp: new Date(now).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      events.forEach((event, idx) => {
        if (idx < 3) {
          newDataPoint[event.ticker] = event.volume;
        }
      });

      setVolumeData((prev) => [...prev.slice(-19), newDataPoint]);
    } catch (error) {
      console.error("Error updating market data:", error);
    }
  };

  const colors = ["#55AFFF", "#00FF9C", "#FF3C3C"];

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading || volumeData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading market data...
        </p>
      </div>
    );
  }

  const lines = markets.slice(0, 3).map((market, idx) => ({
    dataKey: market.ticker,
    stroke: colors[idx],
    name: market.ticker,
  }));

  const commonProps = {
    data: volumeData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono font-bold text-neutral">
            TOP MARKETS • VOLUME TRENDS
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Real-time volume tracking • Updates every 10s
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              chartType === "line"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            LINE
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              chartType === "area"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            AREA
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: "350px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart {...commonProps}>
              <defs>
                {lines.map((line, idx) => (
                  <linearGradient key={idx} id={`gradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.stroke} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={line.stroke} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="timestamp"
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
                formatter={(value: number) => formatVolume(value)}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  paddingTop: "10px",
                }}
              />
              {lines.map((line, idx) => (
                <Area
                  key={idx}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient${idx})`}
                  name={line.name}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="timestamp"
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
                formatter={(value: number) => formatVolume(value)}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  paddingTop: "10px",
                }}
              />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={2}
                  dot={false}
                  name={line.name}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
        {markets.slice(0, 3).map((market, idx) => (
          <div key={market.id} className="panel p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs font-mono font-bold text-neutral truncate">
                  {market.ticker}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground truncate mt-1">
                  {market.title}
                </p>
              </div>
              <div
                className="w-3 h-3 mt-0.5 ml-2 flex-shrink-0"
                style={{ backgroundColor: colors[idx] }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Volume:</span>
              <span className="text-neutral font-bold">
                {formatVolume(market.volume)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-1">
              <span className="text-muted-foreground">Liquidity:</span>
              <span className="text-neutral">
                {formatVolume(market.liquidity)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
