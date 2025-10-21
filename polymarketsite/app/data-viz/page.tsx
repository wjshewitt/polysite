"use client";

import { useState } from "react";
import { MarketVolumeChart } from "@/components/dataviz/MarketVolumeChart";
import { MarketHeatmap } from "@/components/dataviz/MarketHeatmap";
import { VolumeDistribution } from "@/components/dataviz/VolumeDistribution";
import { CategoryBreakdown } from "@/components/dataviz/CategoryBreakdown";
import { PriceCorrelation } from "@/components/dataviz/PriceCorrelation";
import { LiquidityDepth } from "@/components/dataviz/LiquidityDepth";
import { MarketPriceChart } from "@/components/dataviz/MarketPriceChart";
import { TrendingUp, BarChart3, Grid3x3, PieChart, Activity, Layers, LineChart } from "lucide-react";

export default function DataVizPage() {
  const [selectedViz, setSelectedViz] = useState<string | null>(null);

  const visualizations = [
    {
      id: "single",
      name: "Individual Market Chart",
      component: MarketPriceChart,
      icon: LineChart,
      description: "Price history and volume for a single market (reusable component)"
    },
    {
      id: "volume",
      name: "Market Volume Trends",
      component: MarketVolumeChart,
      icon: TrendingUp,
      description: "Real-time volume tracking across top markets"
    },
    {
      id: "heatmap",
      name: "Price Movement Heatmap",
      component: MarketHeatmap,
      icon: Grid3x3,
      description: "Visualize price changes across all active markets"
    },
    {
      id: "distribution",
      name: "Volume Distribution",
      component: VolumeDistribution,
      icon: BarChart3,
      description: "Distribution of trading volume by market size"
    },
    {
      id: "category",
      name: "Category Breakdown",
      component: CategoryBreakdown,
      icon: PieChart,
      description: "Market activity breakdown by category tags"
    },
    {
      id: "correlation",
      name: "Price Correlation Matrix",
      component: PriceCorrelation,
      icon: Activity,
      description: "Correlation between related market outcomes"
    },
    {
      id: "liquidity",
      name: "Liquidity Depth Analysis",
      component: LiquidityDepth,
      icon: Layers,
      description: "Market liquidity distribution and depth"
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold tracking-tight text-neutral mb-2">
            📊 DATA VISUALIZATION LAB
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            Real-time Polymarket analytics and visual insights
          </p>
        </div>

        {/* Visualization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {visualizations.map((viz) => {
            const Icon = viz.icon;
            return (
              <button
                key={viz.id}
                onClick={() => setSelectedViz(selectedViz === viz.id ? null : viz.id)}
                className={`panel p-6 text-left transition-all hover:border-primary ${
                  selectedViz === viz.id ? "border-primary bg-muted" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Icon className="w-5 h-5 text-neutral mt-0.5 flex-shrink-0" />
                  <h3 className="font-mono font-bold text-neutral">{viz.name}</h3>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  {viz.description}
                </p>
                <div className="mt-3 text-xs font-mono text-primary">
                  {selectedViz === viz.id ? "[CLOSE]" : "[VIEW]"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Visualization Display */}
        {selectedViz && (
          <div className="panel p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const viz = visualizations.find((v) => v.id === selectedViz);
                  const Icon = viz?.icon;
                  return Icon ? <Icon className="w-6 h-6 text-neutral" /> : null;
                })()}
                <h2 className="text-xl font-mono font-bold text-neutral">
                  {visualizations.find((v) => v.id === selectedViz)?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedViz(null)}
                className="text-xs font-mono text-muted-foreground hover:text-neutral transition-colors"
              >
                [CLOSE]
              </button>
            </div>
            <div className="min-h-[500px]">
              {(() => {
                const Component = visualizations.find((v) => v.id === selectedViz)?.component;
                return Component ? <Component /> : null;
              })()}
            </div>
          </div>
        )}

        {/* Full Dashboard View */}
        <div className="panel p-6">
          <h2 className="text-xl font-mono font-bold text-neutral mb-6">
            FULL DASHBOARD - ALL VISUALIZATIONS
          </h2>
          <div className="space-y-8">
            {visualizations.map((viz) => {
              const Component = viz.component;
              const Icon = viz.icon;
              return (
                <div key={viz.id} className="border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5 text-neutral" />
                    <h3 className="text-sm font-mono font-bold text-neutral">
                      {viz.name}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-6">
                    {viz.description}
                  </p>
                  <div className="min-h-[400px]">
                    <Component />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 panel text-center">
          <p className="text-xs font-mono text-muted-foreground">
            Live data from Polymarket Gamma API • Updates automatically
          </p>
        </div>
      </div>
    </main>
  );
}
