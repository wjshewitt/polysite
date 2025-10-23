"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  Target, 
  Globe, 
  Activity, 
  Crosshair, 
  Bitcoin, 
  Vote, 
  Trophy, 
  Film, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { usePolymarketStore } from "@/store/usePolymarketStore";

export type TabView = "main" | "orderbook" | "trading";
export type SubTabView =
  | "all"
  | "livedata"
  | "marketfocus"
  | "crypto"
  | "politics"
  | "sports"
  | "entertainment";

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

interface DashboardSidebarProps {
  children: React.ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const currentTab = (searchParams?.get("tab") || "main") as TabView;
  const currentSubTab = (searchParams?.get("subtab") || "all") as SubTabView;
  const clobAuth = usePolymarketStore((state) => state.clobAuth);

  const handleItemClick = (id: string, type: "main" | "filter") => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (type === "main") {
      params.set("tab", id);
      // Reset subtab when changing main tabs
      if (id !== "main") {
        params.delete("subtab");
      }
    } else {
      params.set("tab", "main");
      params.set("subtab", id);
    }
    
    router.push(`/dashboard?${params.toString()}`);
  };

  const isActive = (id: string, type: "main" | "filter") => {
    if (type === "main") return currentTab === id;
    return currentTab === "main" && currentSubTab === id;
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } flex-shrink-0 border-r border-border bg-card transition-all duration-200`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          {!sidebarCollapsed && (
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              Navigation
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-2 overflow-y-auto" style={{ height: "calc(100vh - 10rem)" }}>
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
                  const disabled = item.id === "trading" && !clobAuth.isAuthenticated;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => !disabled && handleItemClick(item.id, item.type)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 px-3 py-2 font-mono text-sm transition-all ${
                        active
                          ? "bg-neutral text-background"
                          : disabled
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-foreground hover:bg-muted"
                      }`}
                      title={sidebarCollapsed ? item.label : disabled ? "Authentication required" : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="truncate">
                          {item.label}
                          {disabled && <span className="ml-1">🔒</span>}
                        </span>
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
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
