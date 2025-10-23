"use client";

import { useState } from "react";
import { Menu, X, Home, BarChart2, Wallet, ChevronRight } from "lucide-react";

/**
 * DESIGN 8: MOBILE-FIRST HAMBURGER
 * 
 * UX Philosophy:
 * - Mobile-first design that works everywhere
 * - Hamburger menu preserves screen space
 * - Progressive disclosure of options
 * - Familiar pattern from mobile apps
 * 
 * Key Improvements:
 * - Maximum content space on mobile
 * - Full-screen menu for easy tapping
 * - Quick access to recent views
 * - Works great on desktop too
 * - Gesture-friendly interactions
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const MAIN_VIEWS = [
  {
    id: "main" as MainTab,
    title: "Markets Dashboard",
    subtitle: "Live trading & market data",
    icon: Home,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "orderbook" as MainTab,
    title: "Orderbook Depth",
    subtitle: "Analyze market liquidity",
    icon: BarChart2,
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: "trading" as MainTab,
    title: "My Trading",
    subtitle: "Your positions & orders",
    icon: Wallet,
    color: "bg-purple-500/10 text-purple-500",
  },
];

const MARKET_OPTIONS = [
  { id: "all" as MarketFilter, label: "All Markets", emoji: "🌐", desc: "View all available markets" },
  { id: "livedata" as MarketFilter, label: "Live Data", emoji: "📊", desc: "Real-time market feeds" },
  { id: "marketfocus" as MarketFilter, label: "Market Focus", emoji: "🎯", desc: "Deep market analysis" },
  { id: "crypto" as MarketFilter, label: "Crypto", emoji: "₿", desc: "Cryptocurrency markets" },
  { id: "politics" as MarketFilter, label: "Politics", emoji: "🗳️", desc: "Political prediction markets" },
  { id: "sports" as MarketFilter, label: "Sports", emoji: "⚽", desc: "Sports betting markets" },
  { id: "entertainment" as MarketFilter, label: "Entertainment", emoji: "🎬", desc: "Pop culture & media" },
];

export default function Design8() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentViews] = useState<string[]>(["all", "crypto", "livedata"]);

  const currentView = MAIN_VIEWS.find(v => v.id === mainTab);
  const currentMarket = MARKET_OPTIONS.find(m => m.id === marketFilter);

  const handleViewSelect = (viewId: MainTab, marketId?: MarketFilter) => {
    setMainTab(viewId);
    if (marketId) setMarketFilter(marketId);
    setMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 8: Mobile-First Hamburger
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Space-efficient menu design optimized for mobile and touch interfaces
          </p>
        </div>

        {/* Main Navigation Bar */}
        <div className="relative">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-background border border-border px-4 py-3">
            {/* Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -ml-2 hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Current View */}
            <div className="flex-1 text-center px-4">
              <div className="font-mono text-sm font-bold text-foreground">
                {currentView?.title}
              </div>
              {mainTab === "main" && (
                <div className="font-mono text-xs text-neutral mt-0.5">
                  {currentMarket?.label}
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-buy animate-pulse" />
            </div>
          </div>

          {/* Full Screen Menu */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={() => setMenuOpen(false)}
              />

              {/* Menu Panel */}
              <div className="fixed inset-y-0 left-0 w-full sm:w-96 bg-card border-r border-border z-50 overflow-y-auto">
                {/* Menu Header */}
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-lg font-bold text-foreground">
                      Navigation
                    </h3>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="p-6">
                  {/* Quick Access */}
                  {recentViews.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-3">
                        Recent
                      </h4>
                      <div className="space-y-2">
                        {recentViews.map(viewId => {
                          const market = MARKET_OPTIONS.find(m => m.id === viewId);
                          if (!market) return null;
                          return (
                            <button
                              key={viewId}
                              onClick={() => handleViewSelect("main", viewId as MarketFilter)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-muted border border-border transition-colors"
                            >
                              <span className="text-xl">{market.emoji}</span>
                              <span className="font-mono text-sm text-foreground">
                                {market.label}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Main Views */}
                  <div className="mb-8">
                    <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-3">
                      Views
                    </h4>
                    <div className="space-y-3">
                      {MAIN_VIEWS.map((view) => {
                        const Icon = view.icon;
                        const isActive = mainTab === view.id;
                        return (
                          <button
                            key={view.id}
                            onClick={() => handleViewSelect(view.id)}
                            className={`w-full text-left transition-all ${
                              isActive
                                ? "bg-neutral text-background"
                                : "bg-secondary hover:bg-muted border border-border"
                            }`}
                          >
                            <div className="flex items-center gap-4 p-4">
                              <div className={`flex items-center justify-center w-12 h-12 ${
                                isActive ? "bg-background/20" : view.color
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className={`font-mono text-sm font-bold mb-1 ${
                                  isActive ? "text-background" : "text-foreground"
                                }`}>
                                  {view.title}
                                </div>
                                <div className={`font-mono text-xs ${
                                  isActive ? "text-background/80" : "text-muted-foreground"
                                }`}>
                                  {view.subtitle}
                                </div>
                              </div>
                              {isActive && (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Market Filters */}
                  <div>
                    <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wide mb-3">
                      Market Filters
                    </h4>
                    <div className="space-y-2">
                      {MARKET_OPTIONS.map((option) => {
                        const isActive = mainTab === "main" && marketFilter === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleViewSelect("main", option.id)}
                            className={`w-full text-left px-4 py-3 transition-all ${
                              isActive
                                ? "bg-neutral text-background"
                                : "hover:bg-secondary border border-transparent hover:border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{option.emoji}</span>
                              <div className="flex-1">
                                <div className={`font-mono text-sm font-medium ${
                                  isActive ? "text-background" : "text-foreground"
                                }`}>
                                  {option.label}
                                </div>
                                <div className={`font-mono text-xs ${
                                  isActive ? "text-background/70" : "text-muted-foreground"
                                }`}>
                                  {option.desc}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview Content */}
        <div className="mt-4 p-8 bg-secondary border border-border">
          <div className="text-center">
            <div className="font-mono text-sm text-muted-foreground mb-2">
              ACTIVE VIEW
            </div>
            <div className="font-mono text-2xl text-foreground mb-1">
              {currentView?.title}
            </div>
            {mainTab === "main" && (
              <div className="font-mono text-lg text-neutral">
                {currentMarket?.label}
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
            <li>• Mobile-first approach maximizes content space</li>
            <li>• Full-screen menu easy to tap on mobile</li>
            <li>• Recent views for quick navigation</li>
            <li>• Familiar hamburger pattern reduces learning</li>
            <li>• Works equally well on desktop</li>
            <li>• Progressive disclosure keeps UI clean</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
