"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: string;
  value: number;
  volume: number;
}

export function LiveChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");

  useEffect(() => {
    // Initialize with some data
    const initialData: DataPoint[] = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}s`,
      value: Math.random() * 100 + 50,
      volume: Math.random() * 50 + 10,
    }));
    setData(initialData);

    // Update data every second
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const lastValue = prevData[prevData.length - 1]?.value || 100;
        const change = (Math.random() - 0.5) * 20;
        const newValue = Math.max(10, Math.min(200, lastValue + change));

        newData.push({
          time: `${Date.now() % 1000}`,
          value: newValue,
          volume: Math.random() * 50 + 10,
        });

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="time"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#84cc16"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Volume"
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="time"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#84cc16"
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Price"
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorVolume)"
              name="Volume"
            />
          </AreaChart>
        );

      case "bar":
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="time"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }}
            />
            <Bar dataKey="value" fill="#84cc16" name="Price" />
            <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono font-bold text-neutral">
            LIVE MARKET DATA
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            Real-time updates every second
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
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              chartType === "bar"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            BAR
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
