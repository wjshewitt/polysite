"use client";

import { useState } from "react";
import { Zap, BarChart3, Target, Bitcoin, Vote, Trophy, Film } from "lucide-react";

/**
 * DESIGN 1: SEGMENTED CONTROL
 * 
 * UX Philosophy:
 * - Clean, iOS-inspired segmented control reduces visual clutter
 * - Primary tabs are prominent with secondary filters as pills
 * - Single-row layout maximizes vertical space for content
 * - Clear visual hierarchy: Main action > Context > Filters
 * 
 * Key Improvements:
 * - No left/right arrows - all options visible at once
 * - Icon + text for better scannability
 * - Smooth animations for state changes
 * - Compact design leaves more room for data
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const MAIN_TABS = [
  { id: "main" as MainTab, label: "Dashboard", icon: Zap },
  { id: "orderbook" as MainTab, label: "Orderbook", icon: BarChart3 },
  { id: "trading" as MainTab, label: "Trading", icon: Target },
];

const MARKET_FILTERS = [
  { id: "all" as MarketFilter, label: "All Markets", icon: "🌐" },
  { id: "livedata" as MarketFilter, label: "Live Data", icon: "📊" },
  { id: "marketfocus" as MarketFilter, label: "Market Focus", icon: "🎯" },
  { id: "crypto" as MarketFilter, label: "Crypto", icon: "₿" },
  { id: "politics" as MarketFilter, label: "Politics", icon: "🗳️" },
  { id: "sports" as MarketFilter, label: "Sports", icon: "⚽" },
  { id: "entertainment" as MarketFilter, label: "Entertainment", icon: "🎬" },
];

export default function Design1() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 1: Segmented Control
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            iOS-inspired design with unified control surface and clear visual hierarchy
          </p>
        </div>

        {/* Main Navigation */}
        <div className="space-y-4">
          {/* Primary Tabs - Segmented Control */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              View
            </span>
            <div className="flex bg-secondary p-1 gap-1">
              {MAIN_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMainTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all ${
                      mainTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Filters - Only show for main tab */}
          {mainTab === "main" && (
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                Filter
              </span>
              <div className="flex flex-wrap gap-2">
                {MARKET_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setMarketFilter(filter.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs transition-all border ${
                      marketFilter === filter.id
                        ? "bg-neutral text-background border-neutral"
                        : "bg-background text-foreground border-border hover:border-neutral/50"
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="mt-8 p-8 bg-secondary border border-border">
          <div className="text-center">
            <div className="font-mono text-sm text-muted-foreground mb-2">
              ACTIVE VIEW
            </div>
            <div className="font-mono text-2xl text-foreground mb-1">
              {MAIN_TABS.find((t) => t.id === mainTab)?.label}
            </div>
            {mainTab === "main" && (
              <div className="font-mono text-lg text-neutral">
                {MARKET_FILTERS.find((f) => f.id === marketFilter)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-secondary/50 border border-border">
          <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
            Design Philosophy
          </h3>
          <ul className="space-y-1 font-mono text-xs text-foreground">
            <li>• Single-row layout maximizes content space</li>
            <li>• All options visible - no hidden navigation</li>
            <li>• Clear visual states prevent confusion</li>
            <li>• Filters only appear when relevant</li>
            <li>• Icons + text for faster recognition</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
