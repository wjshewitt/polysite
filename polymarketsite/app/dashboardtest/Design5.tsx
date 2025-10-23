"use client";

import React, { useState } from "react";
import { TrendingUp, BarChart3, Wallet, Activity, Eye, Target, Bitcoin, Vote, Trophy, Film, Clock, Users, DollarSign } from "lucide-react";

/**
 * DESIGN 5: CONTEXT RIBBON
 * 
 * UX Philosophy:
 * - Bloomberg Terminal / professional trading platform inspired
 * - Dense information display for power users
 * - Multiple context levels: View + Filter + Stats
 * - Everything visible at once, no hidden menus
 * 
 * Key Improvements:
 * - Information-dense design for serious traders
 * - Real-time stats integrated into navigation
 * - Color-coded sections for quick scanning
 * - Professional aesthetic matches trading mindset
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const VIEW_TABS = [
  { id: "main" as MainTab, label: "MARKETS", icon: TrendingUp, color: "text-buy" },
  { id: "orderbook" as MainTab, label: "DEPTH", icon: BarChart3, color: "text-neutral" },
  { id: "trading" as MainTab, label: "ORDERS", icon: Wallet, color: "text-sell" },
];

const MARKET_CATEGORIES = [
  { id: "all" as MarketFilter, label: "ALL", icon: Activity },
  { id: "livedata" as MarketFilter, label: "LIVE", icon: Activity },
  { id: "marketfocus" as MarketFilter, label: "FOCUS", icon: Target },
  { id: "crypto" as MarketFilter, label: "CRYPTO", icon: Bitcoin },
  { id: "politics" as MarketFilter, label: "POLITICS", icon: Vote },
  { id: "sports" as MarketFilter, label: "SPORTS", icon: Trophy },
  { id: "entertainment" as MarketFilter, label: "MEDIA", icon: Film },
];

export default function Design5() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");

  const currentView = VIEW_TABS.find(v => v.id === mainTab);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 5: Context Ribbon
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Bloomberg-inspired information-dense professional interface
          </p>
        </div>

        {/* Context Ribbon - Multi-level */}
        <div className="bg-background border border-border">
          {/* Top Level - View Selection + Stats */}
          <div className="flex items-stretch border-b border-border">
            {/* View Tabs */}
            <div className="flex">
              {VIEW_TABS.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setMainTab(view.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-mono text-xs font-bold border-r border-border transition-colors ${
                      mainTab === view.id
                        ? `bg-secondary ${view.color}`
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {view.label}
                  </button>
                );
              })}
            </div>

            {/* Stats Bar */}
            <div className="flex-1 flex items-center justify-end gap-6 px-6 bg-secondary/30">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-xs text-foreground">
                  <span className="text-muted-foreground">TIME:</span> 14:23:45
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-xs text-foreground">
                  <span className="text-muted-foreground">USERS:</span> 12.4K
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-xs text-foreground">
                  <span className="text-muted-foreground">VOL:</span> $2.8M
                </span>
              </div>
            </div>
          </div>

          {/* Second Level - Category Selection (Only for Markets view) */}
          {mainTab === "main" && (
            <div className="flex items-stretch bg-secondary/50 border-b border-border">
              {MARKET_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setMarketFilter(category.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-xs font-medium border-r border-border last:border-r-0 transition-all ${
                      marketFilter === category.id
                        ? "bg-neutral text-background"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Third Level - Context Info */}
          <div className="flex items-center justify-between px-6 py-2 bg-card">
            <div className="flex items-center gap-4">
              <div className="font-mono text-xs">
                <span className="text-muted-foreground">VIEW:</span>{" "}
                <span className="text-foreground font-bold">
                  {currentView?.label}
                  {mainTab === "main" && 
                    ` / ${MARKET_CATEGORIES.find(c => c.id === marketFilter)?.label}`
                  }
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="font-mono text-xs text-muted-foreground">
                LAST UPDATE: 2s ago
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-buy animate-pulse" />
              <span className="font-mono text-xs text-buy">LIVE</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-4 bg-background border border-border min-h-[500px] p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary border border-border mb-4">
              {React.createElement(currentView?.icon || TrendingUp, {
                className: `w-8 h-8 ${currentView?.color || "text-foreground"}`
              })}
            </div>
            <div className="font-mono text-sm text-muted-foreground mb-2">
              ACTIVE WORKSPACE
            </div>
            <div className="font-mono text-2xl text-foreground mb-1">
              {currentView?.label}
            </div>
            {mainTab === "main" && (
              <div className="font-mono text-lg text-neutral">
                {MARKET_CATEGORIES.find(c => c.id === marketFilter)?.label}
              </div>
            )}
            
            {/* Market Stats Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="p-4 bg-secondary border border-border">
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  ACTIVE MARKETS
                </div>
                <div className="font-mono text-2xl text-foreground">247</div>
              </div>
              <div className="p-4 bg-secondary border border-border">
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  24H VOLUME
                </div>
                <div className="font-mono text-2xl text-buy">$2.8M</div>
              </div>
              <div className="p-4 bg-secondary border border-border">
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  TRADES/MIN
                </div>
                <div className="font-mono text-2xl text-neutral">143</div>
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
            <li>• Information-dense layout for professional traders</li>
            <li>• Multi-level hierarchy shows all context at once</li>
            <li>• Color-coded sections enable rapid scanning</li>
            <li>• Integrated stats reduce need for separate panels</li>
            <li>• Terminal aesthetic conveys seriousness and power</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
