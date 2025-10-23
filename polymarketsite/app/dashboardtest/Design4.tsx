"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3, Target, Layers, ChevronDown } from "lucide-react";

/**
 * DESIGN 4: FLOATING TOOLBAR
 * 
 * UX Philosophy:
 * - Minimal, non-intrusive design inspired by modern editors
 * - Floating toolbar doesn't occupy fixed vertical space
 * - Context menu for secondary options reduces clutter
 * - Focus on content, controls fade when not needed
 * 
 * Key Improvements:
 * - Maximum content visibility
 * - Reduced visual weight
 * - Smooth animations and transitions
 * - Contextual disclosure of options
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const MAIN_VIEWS = [
  { id: "main" as MainTab, label: "Dashboard", icon: LayoutDashboard },
  { id: "orderbook" as MainTab, label: "Orderbook", icon: BarChart3 },
  { id: "trading" as MainTab, label: "Trading", icon: Target },
];

const MARKET_FILTERS = [
  { id: "all" as MarketFilter, label: "All Markets", emoji: "🌐" },
  { id: "livedata" as MarketFilter, label: "Live Data", emoji: "📊" },
  { id: "marketfocus" as MarketFilter, label: "Market Focus", emoji: "🎯" },
  { id: "crypto" as MarketFilter, label: "Crypto", emoji: "₿" },
  { id: "politics" as MarketFilter, label: "Politics", emoji: "🗳️" },
  { id: "sports" as MarketFilter, label: "Sports", emoji: "⚽" },
  { id: "entertainment" as MarketFilter, label: "Entertainment", emoji: "🎬" },
];

export default function Design4() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const currentView = MAIN_VIEWS.find(v => v.id === mainTab);
  const currentFilter = MARKET_FILTERS.find(f => f.id === marketFilter);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 4: Floating Toolbar
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Minimal floating controls with maximum content visibility
          </p>
        </div>

        {/* Main Content Area with Floating Controls */}
        <div className="relative bg-background border border-border min-h-[700px]">
          {/* Floating Toolbar */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-card border border-border shadow-lg px-2 py-1.5">
              {/* View Selector */}
              <div className="flex items-center gap-1 pr-2 border-r border-border">
                {MAIN_VIEWS.map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => setMainTab(view.id)}
                      className={`p-2 transition-all ${
                        mainTab === view.id
                          ? "bg-neutral text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                      title={view.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Market Filter - Only show for main view */}
              {mainTab === "main" && (
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentFilter?.label}</span>
                    <span className="sm:hidden">{currentFilter?.emoji}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {filterMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setFilterMenuOpen(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border shadow-xl z-20">
                        <div className="p-2 border-b border-border">
                          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                            Market Filter
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {MARKET_FILTERS.map((filter) => (
                            <button
                              key={filter.id}
                              onClick={() => {
                                setMarketFilter(filter.id);
                                setFilterMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-4 py-2.5 font-mono text-sm transition-colors ${
                                marketFilter === filter.id
                                  ? "bg-neutral text-background"
                                  : "text-foreground hover:bg-secondary"
                              }`}
                            >
                              <span>{filter.emoji}</span>
                              <span>{filter.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Current View Label */}
              <div className="pl-2 border-l border-border">
                <div className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {currentView?.label}
                </div>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex items-center justify-center h-full min-h-[700px]">
            <div className="text-center">
              <div className="font-mono text-sm text-muted-foreground mb-4">
                ACTIVE VIEW
              </div>
              <div className="font-mono text-3xl text-foreground mb-2">
                {currentView?.label}
              </div>
              {mainTab === "main" && (
                <div className="flex items-center justify-center gap-2 font-mono text-lg text-neutral">
                  <span>{currentFilter?.emoji}</span>
                  <span>{currentFilter?.label}</span>
                </div>
              )}
              <div className="mt-8 font-mono text-xs text-muted-foreground">
                Main dashboard content appears here
              </div>
            </div>
          </div>

          {/* Floating Info Pills (Bottom) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border shadow-lg font-mono text-xs text-muted-foreground">
                Live Updates: ON
              </div>
              <div className="px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border shadow-lg font-mono text-xs text-muted-foreground">
                Markets: 247
              </div>
              <div className="px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border shadow-lg font-mono text-xs text-muted-foreground">
                Active Trades: 1,523
              </div>
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-secondary/50 border border-border">
          <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
            Design Philosophy
          </h3>
          <ul className="space-y-1 font-mono text-xs text-foreground">
            <li>• Floating controls maximize content visibility</li>
            <li>• Icon-first design reduces visual noise</li>
            <li>• Contextual menus reveal options on demand</li>
            <li>• Minimal chrome lets data take center stage</li>
            <li>• Modern aesthetic with subtle shadows and blur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
