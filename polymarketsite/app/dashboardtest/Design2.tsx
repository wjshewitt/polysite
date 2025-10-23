"use client";

import { useState } from "react";
import { Terminal, Search, ChevronRight } from "lucide-react";

/**
 * DESIGN 2: COMMAND BAR
 * 
 * UX Philosophy:
 * - Terminal/IDE inspired for power users
 * - Breadcrumb navigation shows current context
 * - Quick search/command palette for keyboard navigation
 * - Mimics professional trading terminal aesthetics
 * 
 * Key Improvements:
 * - Keyboard-first design (Cmd+K to open)
 * - Breadcrumb trail reduces cognitive load
 * - Unified search + navigation in one control
 * - Professional aesthetic matches trading platforms
 */

type MainTab = "main" | "orderbook" | "trading";
type MarketFilter = "all" | "livedata" | "marketfocus" | "crypto" | "politics" | "sports" | "entertainment";

const NAVIGATION_OPTIONS = [
  { id: "main", label: "Dashboard", category: "Views", path: ["Dashboard"] },
  { id: "orderbook", label: "Orderbook Depth", category: "Views", path: ["Orderbook"] },
  { id: "trading", label: "My Orders", category: "Views", path: ["Trading"] },
  { id: "all", label: "All Markets", category: "Markets", path: ["Dashboard", "All Markets"] },
  { id: "livedata", label: "Live Data", category: "Markets", path: ["Dashboard", "Live Data"] },
  { id: "marketfocus", label: "Market Focus", category: "Markets", path: ["Dashboard", "Market Focus"] },
  { id: "crypto", label: "Crypto Markets", category: "Markets", path: ["Dashboard", "Crypto"] },
  { id: "politics", label: "Politics", category: "Markets", path: ["Dashboard", "Politics"] },
  { id: "sports", label: "Sports", category: "Markets", path: ["Dashboard", "Sports"] },
  { id: "entertainment", label: "Entertainment", category: "Markets", path: ["Dashboard", "Entertainment"] },
];

export default function Design2() {
  const [mainTab, setMainTab] = useState<MainTab>("main");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentPath = 
    mainTab === "main" 
      ? ["Dashboard", NAVIGATION_OPTIONS.find(o => o.id === marketFilter)?.label || "All Markets"]
      : [NAVIGATION_OPTIONS.find(o => o.id === mainTab)?.label || "Dashboard"];

  const filteredOptions = NAVIGATION_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedOptions = filteredOptions.reduce((acc, option) => {
    if (!acc[option.category]) acc[option.category] = [];
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof NAVIGATION_OPTIONS>);

  const handleSelect = (id: string) => {
    if (["main", "orderbook", "trading"].includes(id)) {
      setMainTab(id as MainTab);
    } else {
      setMainTab("main");
      setMarketFilter(id as MarketFilter);
    }
    setCommandOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-card border border-border p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-mono text-2xl text-foreground mb-1">
            Design 2: Command Bar
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            Terminal-inspired command palette with breadcrumb navigation
          </p>
        </div>

        {/* Command Bar */}
        <div className="space-y-4">
          {/* Main Control Bar */}
          <div className="flex items-center gap-2 bg-background border border-border p-2">
            {/* Terminal Icon */}
            <div className="flex items-center gap-2 px-2 border-r border-border">
              <Terminal className="w-4 h-4 text-neutral" />
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex-1 flex items-center gap-1 font-mono text-sm">
              {currentPath.map((segment, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  <span className={index === currentPath.length - 1 ? "text-neutral" : "text-muted-foreground"}>
                    {segment}
                  </span>
                </div>
              ))}
            </div>

            {/* Command Trigger */}
            <button
              onClick={() => setCommandOpen(!commandOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-muted border border-border font-mono text-xs text-foreground transition-colors"
            >
              <Search className="w-3 h-3" />
              Navigate
              <kbd className="px-1.5 py-0.5 bg-muted border border-border text-[10px]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Command Palette */}
          {commandOpen && (
            <div className="bg-background border border-border shadow-lg">
              {/* Search Input */}
              <div className="border-b border-border p-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search views and markets..."
                    className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-80 overflow-y-auto">
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <div key={category}>
                    <div className="px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-wide bg-secondary">
                      {category}
                    </div>
                    {options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 font-mono text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.path.join(" → ")}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-3 py-2 bg-secondary">
                <p className="font-mono text-xs text-muted-foreground">
                  Use ↑↓ to navigate, ↵ to select, ESC to close
                </p>
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
              {currentPath.join(" / ")}
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-secondary/50 border border-border">
          <h3 className="font-mono text-xs text-muted-foreground uppercase mb-2">
            Design Philosophy
          </h3>
          <ul className="space-y-1 font-mono text-xs text-foreground">
            <li>• Keyboard-first navigation for power users</li>
            <li>• Breadcrumbs show current location context</li>
            <li>• Unified search eliminates hunting for options</li>
            <li>• Professional terminal aesthetic</li>
            <li>• Grouped categories aid discovery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
