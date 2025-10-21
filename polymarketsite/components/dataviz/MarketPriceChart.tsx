"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { gammaAPI, GammaEvent, GammaMarket } from "@/services/gamma";

interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
  liquidity: number;
}

interface MarketPriceChartProps {
  marketSlug?: string;
  eventSlug?: string;
  height?: number;
  showVolume?: boolean;
  showLiquidity?: boolean;
}

export function MarketPriceChart({
  marketSlug,
  eventSlug,
  height = 400,
  showVolume = true,
  showLiquidity = true,
}: MarketPriceChartProps) {
  const [market, setMarket] = useState<GammaEvent | null>(null);
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(updatePriceData, 15000);
    return () => clearInterval(interval);
  }, [marketSlug, eventSlug]);

  const fetchMarketData = async () => {
    try {
      setError(null);
      
      // Fetch market by slug or get a top market as example
      let marketData: GammaEvent;
      
      if (eventSlug) {
        marketData = await gammaAPI.fetchEventBySlug(eventSlug);
      } else {
        // Get a top market as demo
        const events = await gammaAPI.fetchEvents({
          limit: 1,
          order: "volume",
          ascending: false,
          active: true,
          closed: false,
        });
        
        if (events.length === 0) {
          throw new Error("No active markets found");
        }
        
        marketData = events[0];
      }

      setMarket(marketData);

      // Initialize with historical data (simulated)
      const initialData: PricePoint[] = [];
      const now = Date.now();
      const primaryMarket = marketData.markets[0];
      
      if (!primaryMarket) {
        throw new Error("No market data available");
      }

      // Parse outcome prices
      const outcomes = primaryMarket.outcomes.split(",");
      const prices = primaryMarket.outcomePrices.split(",").map(parseFloat);
      const currentPrice = prices[0] || 0.5;

      // Generate 30 historical points with realistic variation
      for (let i = 29; i >= 0; i--) {
        const timeAgo = now - i * 60000; // 1 minute intervals
        const variation = (Math.random() - 0.5) * 0.1;
        const historicalPrice = Math.max(0.01, Math.min(0.99, currentPrice + variation * (i / 30)));
        
        const volumeVariation = 1 + (Math.random() - 0.5) * 0.3;
        const liquidityVariation = 1 + (Math.random() - 0.5) * 0.2;
        
        initialData.push({
          timestamp: new Date(timeAgo).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: historicalPrice,
          volume: parseFloat(primaryMarket.volume) * volumeVariation / 30,
          liquidity: parseFloat(primaryMarket.liquidity) * liquidityVariation,
        });
      }

      setPriceData(initialData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError(err instanceof Error ? err.message : "Failed to load market data");
      setLoading(false);
    }
  };

  const updatePriceData = async () => {
    if (!market) return;

    try {
      // Fetch updated market data
      const updatedMarket = await gammaAPI.fetchEventBySlug(market.slug);
      setMarket(updatedMarket);

      const primaryMarket = updatedMarket.markets[0];
      if (!primaryMarket) return;

      const prices = primaryMarket.outcomePrices.split(",").map(parseFloat);
      const currentPrice = prices[0] || 0.5;

      const newPoint: PricePoint = {
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: currentPrice,
        volume: parseFloat(primaryMarket.volume) / 30,
        liquidity: parseFloat(primaryMarket.liquidity),
      };

      setPriceData((prev) => [...prev.slice(-29), newPoint]);
    } catch (err) {
      console.error("Error updating price data:", err);
    }
  };

  const formatPrice = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div style={{ width: "100%", height }} className="flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading market data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: "100%", height }} className="flex items-center justify-center">
        <p className="text-sm font-mono text-destructive">{error}</p>
      </div>
    );
  }

  if (!market || priceData.length === 0) {
    return (
      <div style={{ width: "100%", height }} className="flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">No data available</p>
      </div>
    );
  }

  const primaryMarket = market.markets[0];
  const outcomes = primaryMarket.outcomes.split(",");
  const currentPrice = priceData[priceData.length - 1]?.price || 0.5;
  const priceChange = priceData.length > 1 
    ? ((currentPrice - priceData[0].price) / priceData[0].price) * 100 
    : 0;

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Market Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-mono font-bold text-neutral mb-1">
            {market.ticker || market.title}
          </p>
          <p className="text-xs font-mono text-muted-foreground line-clamp-2">
            {market.title}
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-mono font-bold text-neutral">
            {formatPrice(currentPrice)}
          </p>
          <p
            className={`text-xs font-mono font-bold ${
              priceChange >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: height - 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={priceData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#55AFFF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#55AFFF" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="timestamp"
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 1]}
              stroke="#8b8b8b"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
              tickFormatter={formatPrice}
            />
            {(showVolume || showLiquidity) && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#8b8b8b"
                style={{ fontSize: "11px", fontFamily: "monospace" }}
                tickFormatter={formatVolume}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0b0b",
                border: "1px solid #2a2a2a",
                borderRadius: "0",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "price") return [formatPrice(value), "Probability"];
                if (name === "volume") return [formatVolume(value), "Volume"];
                if (name === "liquidity") return [formatVolume(value), "Liquidity"];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: "11px",
                paddingTop: "10px",
              }}
              formatter={(value: string) => {
                if (value === "price") return "Probability";
                if (value === "volume") return "Volume";
                if (value === "liquidity") return "Liquidity";
                return value;
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#55AFFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
              name="price"
            />
            {showVolume && (
              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="#00FF9C"
                opacity={0.3}
                name="volume"
              />
            )}
            {showLiquidity && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="liquidity"
                stroke="#FFD700"
                strokeWidth={1}
                dot={false}
                name="liquidity"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Current
          </p>
          <p className="text-sm font-mono font-bold text-neutral">
            {formatPrice(currentPrice)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Volume
          </p>
          <p className="text-sm font-mono font-bold text-neutral">
            {formatVolume(parseFloat(primaryMarket.volume))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Liquidity
          </p>
          <p className="text-sm font-mono font-bold text-neutral">
            {formatVolume(parseFloat(primaryMarket.liquidity))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">
            Outcome
          </p>
          <p className="text-sm font-mono font-bold text-neutral truncate">
            {outcomes[0] || "Yes"}
          </p>
        </div>
      </div>
    </div>
  );
}
