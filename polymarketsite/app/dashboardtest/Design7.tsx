"use client";

import { useState } from "react";
import { Layers, Filter, Eye, ChevronDown } from "lucide-react";

/**
 * DESIGN 7: CARD-BASED NAVIGATION
 * 
 * UX Philosophy:
 * - Cards create visual separation and breathing room
 * - Market-style inspiration (like trading cards)
 * - Quick-scan design with large hit targets
 * - More tactile, less "software-y" feel
 * 
 * Key Improvements:
 * - Visual separation makes options distinct
 * - Large targets reduce mis-clicks
 * - Card metaphor feels more tangible
 * - Stats preview on hover
 * - Modern "dashboard" aesthetic
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const VIEW_CARDS = [
  {
    id: "main" as MainTab,
    title: "Markets",
    subtitle: "Live trading data",
    icon: Layers,
    color: "text-neutral",
    stats: "247 active",
  },
  {
    id: "orderbook" as MainTab,
    title: "Orderbook",
    subtitle: "Depth analysis",
    icon: Filter,
    color: "text-buy",
    stats: "$2.8M volume",
  },
  {
    id: "trading" as MainTab,
    title: "Trading",
    subtitle: "Your positions",
    icon: Eye,
    color: "text-sell",
    stats: "12 orders",
  },
];

const MARKET_CARDS = [
  {
    id: "all" as MarketFilter,
    title: "All Markets",
    icon: "🌐",
    count: "247",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    id: "livedata" as MarketFilter,
    title: "Live Data",
    icon: "📊",
    count: "143/min",
    gradient: "from-green-500/10 to-transparent",
  },
  {
    id: "marketfocus" as MarketFilter,
    title: "Market Focus",
    icon: "🎯",
    count: "Deep dive",
    gradient: "from-purple-500/10 to-transparent",
  },
  {
    id: "crypto" as MarketFilter,
    title: "Crypto",
    icon: "₿",
    count: "45",
    gradient: "from-orange-500/10 to-transparent",
  },
  {
    id: "politics" as MarketFilter,
    title: "Politics",
    icon: "🗳️",
    count: "89",
    gradient: "from-red-500/10 to-transparent",
  },
  {
    id: "sports" as MarketFilter,
    title: "Sports",
    icon: "⚽",
    count: "67",
    gradient: "from-green-500/10 to-transparent",
  },
  {
    id: "entertainment" as MarketFilter,
    title: "Entertainment",
    icon: "🎬",
    count: "46",
    gradient: "from-pink-500/10 to-transparent",
  },
];

export default function Design7() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const currentView = VIEW_CARDS.find(v => v.id === mainTab);
  const currentMarket = MARKET_CARDS.find(m => m.id === marketFilter);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 7: Card-Based Navigation
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Trading card inspired design with visual separation and large targets
          </p>
        </div>

        {/* Card-Based Navigation */}
        <div className="space-y-6">
          {/* View Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                Select View
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VIEW_CARDS.map((card) => {
                const Icon = card.icon;
                const isActive = mainTab === card.id;
                const isHovered = hoveredCard === card.id;

                return (
                  <button
                    key={card.id}
                    onClick={() => setMainTab(card.id)}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`group relative p-4 text-left transition-all border-2 ${
                      isActive
                        ? "bg-secondary border-neutral shadow-lg"
                        : "bg-background border-border hover:border-neutral/50 hover:shadow-md"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-10 h-10 mb-3 bg-secondary border border-border transition-colors ${
                      isActive ? card.color : "text-muted-foreground"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="font-mono text-sm font-bold text-foreground mb-1">
                      {card.title}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      {card.subtitle}
                    </div>

                    {/* Stats */}
                    <div className={`font-mono text-xs transition-opacity ${
                      isActive || isHovered ? "opacity-100" : "opacity-0"
                    }`}>
                      <span className={isActive ? "text-neutral" : "text-foreground"}>
                        {card.stats}
                      </span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 rounded-full bg-neutral animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Cards - Only for Main View */}
          {mainTab === "main" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                  Filter Markets
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {MARKET_CARDS.map((card) => {
                  const isActive = marketFilter === card.id;
                  const isHovered = hoveredCard === card.id;

                  return (
                    <button
                      key={card.id}
                      onClick={() => setMarketFilter(card.id)}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`relative p-4 text-center transition-all border overflow-hidden ${
                        isActive
                          ? "bg-neutral text-background border-neutral shadow-lg scale-105"
                          : "bg-background text-foreground border-border hover:border-neutral/50 hover:shadow-md hover:scale-102"
                      }`}
                    >
                      {/* Gradient Background */}
                      {!isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      )}

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="text-3xl mb-2">{card.icon}</div>
                        <div className={`font-mono text-xs font-medium mb-1 ${
                          isActive ? "text-background" : "text-foreground"
                        }`}>
                          {card.title}
                        </div>
                        <div className={`font-mono text-xs ${
                          isActive ? "text-background/80" : "text-muted-foreground"
                        }`}>
                          {card.count}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Selection Display */}
        <div className="mt-6 p-6 bg-secondary border border-border">
          <div className="text-center">
            <div className="font-mono text-sm text-muted-foreground mb-3">
              ACTIVE SELECTION
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              {currentView && (
                <div className={`font-mono text-xl ${currentView.color}`}>
                  {currentView.title}
                </div>
              )}
              {mainTab === "main" && currentMarket && (
                <>
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                  <div className="font-mono text-xl text-neutral">
                    {currentMarket.title}
                  </div>
                </>
              )}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {currentView?.subtitle}
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-secondary/50 border border-border">
          <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
            Design Philosophy
          </h3>
          <ul className="space-y-1 font-mono text-xs text-foreground">
            <li>• Card metaphor creates clear visual separation</li>
            <li>• Large targets reduce accidental clicks</li>
            <li>• Hover effects provide visual feedback</li>
            <li>• Stats appear on interaction for discovery</li>
            <li>• Trading card aesthetic feels tangible</li>
            <li>• Grid layout scales well responsively</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
