"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type TabView = "main" | "orderbook" | "trading";
export type SubTabView =
  | "all"
  | "livedata"
  | "crypto"
  | "politics"
  | "sports"
  | "entertainment";

interface Tab {
  id: TabView;
  label: string;
  description: string;
  hasSubTabs?: boolean;
}

interface SubTab {
  id: SubTabView;
  label: string;
  description: string;
  emoji: string;
}

const TABS: Tab[] = [
  {
    id: "main",
    label: "MAIN DASHBOARD",
    description: "Live markets, trades & crypto prices",
    hasSubTabs: true,
  },
  {
    id: "orderbook",
    label: "ORDERBOOK DEPTH",
    description: "Advanced market depth & liquidity",
  },
  {
    id: "trading",
    label: "MY ORDERS",
    description: "User positions & order management",
  },
];

const SUB_TABS: SubTab[] = [
  {
    id: "all",
    label: "ALL MARKETS",
    description: "All active markets",
    emoji: "🌐",
  },
  {
    id: "livedata",
    label: "LIVE DATA",
    description: "Live trades & order book",
    emoji: "📊",
  },
  {
    id: "crypto",
    label: "CRYPTO",
    description: "Cryptocurrency markets",
    emoji: "₿",
  },
  {
    id: "politics",
    label: "POLITICS",
    description: "Political prediction markets",
    emoji: "🗳️",
  },
  {
    id: "sports",
    label: "SPORTS",
    description: "Sports betting markets",
    emoji: "⚽",
  },
  {
    id: "entertainment",
    label: "ENTERTAINMENT",
    description: "Pop culture & entertainment",
    emoji: "🎬",
  },
];

interface TabNavigationProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
  currentSubTab?: SubTabView;
  onSubTabChange?: (subTab: SubTabView) => void;
  isAuthenticated?: boolean;
  rightContent?: React.ReactNode;
}

export function TabNavigation({
  currentTab,
  onTabChange,
  currentSubTab = "all",
  onSubTabChange,
  isAuthenticated = false,
  rightContent,
}: TabNavigationProps) {
  const currentIndex = TABS.findIndex((tab) => tab.id === currentTab);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < TABS.length - 1;

  const goLeft = () => {
    if (canGoLeft) {
      onTabChange(TABS[currentIndex - 1].id);
    }
  };

  const goRight = () => {
    if (canGoRight) {
      onTabChange(TABS[currentIndex + 1].id);
    }
  };

  const showSubTabs = TABS[currentIndex].hasSubTabs && currentTab === "main";

  return (
    <div className="bg-card border border-border">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Arrow */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft}
          className={`p-1 transition-colors ${
            canGoLeft
              ? "text-foreground hover:text-neutral hover:bg-muted"
              : "text-muted-foreground/60 cursor-not-allowed"
          }`}
          aria-label="Previous tab"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Tab Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-foreground font-mono text-base sm:text-lg font-bold tracking-tight">
              {TABS[currentIndex].label}
            </h2>
            <p className="text-muted-foreground font-mono text-sm mt-0.5">
              {TABS[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goRight}
          disabled={!canGoRight}
          className={`p-1 transition-colors ${
            canGoRight
              ? "text-foreground hover:text-neutral hover:bg-muted"
              : "text-muted-foreground/60 cursor-not-allowed"
          }`}
          aria-label="Next tab"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Right Content (Settings, etc.) */}
        {rightContent && (
          <div className="ml-4 flex items-center gap-2">{rightContent}</div>
        )}
      </div>

      {/* Tab Indicators */}
      <div className="flex items-center justify-center gap-2 pb-2">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.id === "trading" && !isAuthenticated}
            className={`group relative px-4 py-1.5 font-mono text-sm transition-all ${
              currentTab === tab.id
                ? "text-neutral"
                : tab.id === "trading" && !isAuthenticated
                  ? "text-muted-foreground/60 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
            }`}
            title={
              tab.id === "trading" && !isAuthenticated
                ? "Authentication required"
                : tab.description
            }
          >
            {tab.label.split(" ")[0]}
            {currentTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral" />
            )}
            {tab.id === "trading" && !isAuthenticated && (
              <span className="ml-1 text-sell">🔒</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tabs (only show for main tab) */}
      {showSubTabs && onSubTabChange && (
        <div className="border-t border-border bg-secondary">
          <div className="flex items-center justify-center gap-1 px-4 py-2 overflow-x-auto">
            {SUB_TABS.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => onSubTabChange(subTab.id)}
                className={`group relative px-4 py-2 font-mono text-sm whitespace-nowrap transition-all rounded ${
                  currentSubTab === subTab.id
                    ? "bg-muted text-neutral border border-neutral/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
                title={subTab.description}
              >
                <span className="mr-1.5">{subTab.emoji}</span>
                {subTab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
