"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DESIGN 6: ENHANCED CURRENT DESIGN
 * 
 * UX Philosophy:
 * - Keeps familiar structure users already know
 * - Removes arrow navigation confusion
 * - Adds visual polish and clarity
 * - Improves sub-tab organization
 * 
 * Key Improvements:
 * - All main tabs visible with visual indicators
 * - Better sub-tab grouping with categories
 * - Improved visual hierarchy and spacing
 * - Cleaner, more modern aesthetic
 * - Smoother transitions and hover states
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const MAIN_TABS = [
  { id: "main" as MainTab, label: "MAIN DASHBOARD", short: "DASHBOARD", desc: "Live markets & trades" },
  { id: "orderbook" as MainTab, label: "ORDERBOOK DEPTH", short: "ORDERBOOK", desc: "Market depth analysis" },
  { id: "trading" as MainTab, label: "MY ORDERS", short: "TRADING", desc: "Your positions" },
];

const SUB_TAB_CATEGORIES = [
  {
    category: "VIEWS",
    items: [
      { id: "all" as MarketFilter, label: "ALL MARKETS", emoji: "🌐" },
      { id: "livedata" as MarketFilter, label: "LIVE DATA", emoji: "📊" },
      { id: "marketfocus" as MarketFilter, label: "MARKET FOCUS", emoji: "🎯" },
    ],
  },
  {
    category: "CATEGORIES",
    items: [
      { id: "crypto" as MarketFilter, label: "CRYPTO", emoji: "₿" },
      { id: "politics" as MarketFilter, label: "POLITICS", emoji: "🗳️" },
      { id: "sports" as MarketFilter, label: "SPORTS", emoji: "⚽" },
      { id: "entertainment" as MarketFilter, label: "ENTERTAINMENT", emoji: "🎬" },
    ],
  },
];

export default function Design6() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");

  const currentTab = MAIN_TABS.find(t => t.id === mainTab);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 6: Enhanced Current Design
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Refined version of existing layout with improved clarity and polish
          </p>
        </div>

        {/* Main Navigation - Improved */}
        <div className="bg-background border border-border">
          {/* Main Tabs - All Visible */}
          <div className="flex items-stretch border-b border-border">
            {MAIN_TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex-1 px-6 py-4 border-r border-border last:border-r-0 transition-all ${
                  mainTab === tab.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div className="text-center">
                  <div className={`font-mono text-sm font-bold tracking-tight mb-1 ${
                    mainTab === tab.id ? "text-neutral" : "text-foreground"
                  }`}>
                    {tab.short}
                  </div>
                  <div className={`font-mono text-xs ${
                    mainTab === tab.id ? "text-muted-foreground" : "text-muted-foreground/70"
                  }`}>
                    {tab.desc}
                  </div>
                </div>
                {/* Active Indicator */}
                {mainTab === tab.id && (
                  <div className="h-1 bg-neutral mt-3 -mb-4" />
                )}
              </button>
            ))}
          </div>

          {/* Current Tab Info Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-secondary/30 border-b border-border">
            <div className="font-mono text-sm">
              <span className="text-muted-foreground">VIEWING:</span>{" "}
              <span className="text-foreground font-bold">{currentTab?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-buy animate-pulse" />
              <span className="font-mono text-xs text-buy">LIVE</span>
            </div>
          </div>

          {/* Sub-Tabs - Only for Main Dashboard */}
          {mainTab === "main" && (
            <div className="p-4">
              {SUB_TAB_CATEGORIES.map((category, catIndex) => (
                <div key={category.category} className={catIndex > 0 ? "mt-4" : ""}>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-2 px-1">
                    {category.category}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setMarketFilter(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 font-mono text-xs transition-all border ${
                          marketFilter === item.id
                            ? "bg-neutral text-background border-neutral shadow-sm"
                            : "bg-background text-foreground border-border hover:border-neutral/50 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-sm">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="mt-4 p-8 bg-secondary border border-border">
          <div className="text-center">
            <div className="font-mono text-sm text-muted-foreground mb-2">
              ACTIVE VIEW
            </div>
            <div className="font-mono text-2xl text-foreground mb-1">
              {currentTab?.label}
            </div>
            {mainTab === "main" && (
              <div className="font-mono text-lg text-neutral">
                {SUB_TAB_CATEGORIES.flatMap(c => c.items).find(i => i.id === marketFilter)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-secondary/50 border border-border">
          <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
            What Changed From Original
          </h3>
          <ul className="space-y-1 font-mono text-xs text-foreground">
            <li>• <span className="text-sell">REMOVED</span>: Arrow navigation (confusing)</li>
            <li>• <span className="text-buy">ADDED</span>: All tabs visible at once</li>
            <li>• <span className="text-buy">IMPROVED</span>: Grouped sub-tabs by category</li>
            <li>• <span className="text-buy">IMPROVED</span>: Visual hierarchy and spacing</li>
            <li>• <span className="text-buy">ADDED</span>: Active indicator bar</li>
            <li>• <span className="text-buy">ADDED</span>: Current view context</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
