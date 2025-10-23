"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3, Target, Globe, Activity, Crosshair, Bitcoin, Vote, Trophy, Film, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DESIGN 3: SIDEBAR NAVIGATION
 * 
 * UX Philosophy:
 * - App-style persistent navigation (Notion, Linear, Figma)
 * - Collapsible sidebar preserves screen real estate
 * - Nested navigation reduces top-bar clutter
 * - Visual grouping by function type
 * 
 * Key Improvements:
 * - Persistent context - always visible where you are
 * - Collapsible for focus mode
 * - Clear visual grouping of related functions
 * - More intuitive hierarchy than tabs
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const NAV_ITEMS = [
  {
    category: "Views",
    items: [
      { id: "main", label: "Dashboard", icon: LayoutDashboard, type: "main" as const },
      { id: "orderbook", label: "Orderbook", icon: BarChart3, type: "main" as const },
      { id: "trading", label: "Trading", icon: Target, type: "main" as const },
    ],
  },
  {
    category: "Markets",
    items: [
      { id: "all", label: "All Markets", icon: Globe, type: "filter" as const },
      { id: "livedata", label: "Live Data", icon: Activity, type: "filter" as const },
      { id: "marketfocus", label: "Market Focus", icon: Crosshair, type: "filter" as const },
      { id: "crypto", label: "Crypto", icon: Bitcoin, type: "filter" as const },
      { id: "politics", label: "Politics", icon: Vote, type: "filter" as const },
      { id: "sports", label: "Sports", icon: Trophy, type: "filter" as const },
      { id: "entertainment", label: "Entertainment", icon: Film, type: "filter" as const },
    ],
  },
];

export default function Design3() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleItemClick = (id: string, type: "main" | "filter") => {
    if (type === "main") {
      setMainTab(id as MainTab);
    } else {
      setMainTab("main");
      setMarketFilter(id as MarketFilter);
    }
  };

  const isActive = (id: string, type: "main" | "filter") => {
    if (type === "main") return mainTab === id;
    return mainTab === "main" && marketFilter === id;
  };

  const currentLabel = (() => {
    if (mainTab !== "main") {
      return NAV_ITEMS[0].items.find(i => i.id === mainTab)?.label;
    }
    return NAV_ITEMS[1].items.find(i => i.id === marketFilter)?.label;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 3: Sidebar Navigation
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            App-style persistent navigation with collapsible sidebar
          </p>
        </div>

        {/* Layout with Sidebar */}
        <div className="flex gap-0 border border-border bg-background">
          {/* Sidebar */}
          <div
            className={`${
              sidebarCollapsed ? "w-16" : "w-64"
            } flex-shrink-0 border-r border-border bg-secondary transition-all duration-200`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              {!sidebarCollapsed && (
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                  Navigation
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Navigation Items */}
            <div className="p-2">
              {NAV_ITEMS.map((section) => (
                <div key={section.category} className="mb-4">
                  {!sidebarCollapsed && (
                    <div className="px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-wide">
                      {section.category}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.id, item.type);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id, item.type)}
                          className={`w-full flex items-center gap-3 px-3 py-2 font-mono text-sm transition-all ${
                            active
                              ? "bg-neutral text-background"
                              : "text-foreground hover:bg-muted"
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[600px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <h3 className="font-mono text-lg text-foreground">
                {currentLabel}
              </h3>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-secondary border border-border font-mono text-xs text-muted-foreground">
                  {mainTab === "main" ? "Dashboard View" : mainTab === "orderbook" ? "Analysis View" : "Trading View"}
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-8">
              <div className="text-center p-12 bg-secondary border border-border">
                <div className="font-mono text-sm text-muted-foreground mb-2">
                  ACTIVE VIEW
                </div>
                <div className="font-mono text-2xl text-foreground mb-1">
                  {currentLabel}
                </div>
                <div className="font-mono text-sm text-neutral mt-4">
                  Main content would render here
                </div>
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
            <li>• Persistent navigation provides constant context</li>
            <li>• Collapsible sidebar adapts to user focus needs</li>
            <li>• Clear visual grouping by function type</li>
            <li>• Familiar pattern from popular productivity apps</li>
            <li>• More scalable for future feature additions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
