"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { gammaAPI, GammaEvent } from "@/services/gamma";

interface CategoryData {
  name: string;
  value: number;
  count: number;
  color: string;
}

export function CategoryBreakdown() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [displayMode, setDisplayMode] = useState<"volume" | "count">("volume");

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 25000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const events = await gammaAPI.fetchEvents({
        limit: 100,
        order: "volume",
        ascending: false,
        active: true,
        closed: false,
      });

      // Group by tags/categories
      const categoryMap = new Map<string, { volume: number; count: number }>();

      events.forEach((event) => {
        if (event.tags && event.tags.length > 0) {
          event.tags.forEach((tag) => {
            const existing = categoryMap.get(tag.label) || { volume: 0, count: 0 };
            categoryMap.set(tag.label, {
              volume: existing.volume + event.volume,
              count: existing.count + 1,
            });
          });
        } else {
          const existing = categoryMap.get("Uncategorized") || { volume: 0, count: 0 };
          categoryMap.set("Uncategorized", {
            volume: existing.volume + event.volume,
            count: existing.count + 1,
          });
        }
      });

      // Convert to array and sort
      const colors = [
        "#55AFFF",
        "#00FF9C",
        "#FF3C3C",
        "#FFD700",
        "#9D4EDD",
        "#FF8C3C",
        "#00D9FF",
        "#FF6B9D",
        "#8BC34A",
        "#FF9800",
      ];

      const categoryData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, data], idx) => ({
          name,
          value: data.volume,
          count: data.count,
          color: colors[idx % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setCategories(categoryData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching category data:", error);
      setLoading(false);
    }
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / entry.total) * 100).toFixed(1);
    return `${entry.name} (${percent}%)`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Loading category data...
        </p>
      </div>
    );
  }

  const displayData = categories.map((cat) => ({
    ...cat,
    value: displayMode === "volume" ? cat.value : cat.count,
    total: displayMode === "volume"
      ? categories.reduce((sum, c) => sum + c.value, 0)
      : categories.reduce((sum, c) => sum + c.count, 0),
  }));

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono font-bold text-neutral">
            MARKET CATEGORY BREAKDOWN
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Distribution of markets by category tags
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDisplayMode("volume")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              displayMode === "volume"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            BY VOLUME
          </button>
          <button
            onClick={() => setDisplayMode("count")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              displayMode === "count"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            BY COUNT
          </button>
        </div>
      </div>

      {/* Pie Chart and Legend */}
      <div className="flex-1 min-h-[350px] flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(data) => setSelectedCategory(data)}
                onMouseLeave={() => setSelectedCategory(null)}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#0b0b0b"
                    strokeWidth={2}
                    style={{
                      filter:
                        selectedCategory?.name === entry.name
                          ? "brightness(1.2)"
                          : "brightness(1)",
                      transition: "filter 0.2s",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b0b0b",
                  border: "1px solid #2a2a2a",
                  borderRadius: "0",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
                formatter={(value: number) =>
                  displayMode === "volume" ? formatVolume(value) : value
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="w-full md:w-64 flex flex-col gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
          {categories.map((category, idx) => {
            const percent = displayMode === "volume"
              ? (category.value / categories.reduce((sum, c) => sum + c.value, 0)) * 100
              : (category.count / categories.reduce((sum, c) => sum + c.count, 0)) * 100;

            return (
              <div
                key={category.name}
                className={`panel p-3 cursor-pointer transition-all ${
                  selectedCategory?.name === category.name
                    ? "border-primary"
                    : "hover:border-border/80"
                }`}
                onMouseEnter={() => setSelectedCategory(category)}
                onMouseLeave={() => setSelectedCategory(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="text-xs font-mono font-bold text-neutral truncate">
                      {category.name}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground ml-2">
                    {percent.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    {category.count} {category.count === 1 ? "market" : "markets"}
                  </span>
                  <span className="text-neutral font-bold">
                    {formatVolume(category.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Categories
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {categories.length}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Total Volume
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {formatVolume(categories.reduce((sum, c) => sum + c.value, 0))}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Total Markets
          </p>
          <p className="text-xl font-mono font-bold text-neutral">
            {categories.reduce((sum, c) => sum + c.count, 0)}
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">
            Top Category
          </p>
          <p className="text-sm font-mono font-bold text-neutral truncate">
            {categories[0]?.name || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
