"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { realtimeService } from "@/services/realtime";
import { clobService } from "@/services/clob";
import { AppShell } from "@/components/AppShell";
import { TradeFeed } from "@/components/TradeFeed";
import { CryptoTicker } from "@/components/CryptoTicker";
import { OrderBook } from "@/components/OrderBook";
import { LiveStats } from "@/components/LiveStats";
import { TopMarkets } from "@/components/TopMarkets";
import { TabNavigation, TabView, SubTabView } from "@/components/TabNavigation";
import { OrderbookDepth } from "@/components/OrderbookDepth";
import { MyOrders } from "@/components/MyOrders";
import { ClobAuth } from "@/components/ClobAuth";
import { CryptoMarkets } from "@/components/CryptoMarkets";
import { LiveData } from "@/components/LiveData";
import { MarketFocus } from "@/components/MarketFocus";
import { SettingsModal } from "@/components/SettingsModal";
import { DiagnosticsModal } from "@/components/DiagnosticsModal";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { Settings, Activity } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState<TabView>("main");
  const [currentSubTab, setCurrentSubTab] = useState<SubTabView>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const clobAuth = usePolymarketStore((state) => state.clobAuth);

  // Handle URL parameters for tab/subtab
  useEffect(() => {
    const tab = searchParams?.get("tab");
    const subtab = searchParams?.get("subtab");

    if (tab && (tab === "main" || tab === "orderbook" || tab === "trading")) {
      setCurrentTab(tab as TabView);
    }

    if (
      subtab &&
      (subtab === "all" ||
        subtab === "livedata" ||
        subtab === "marketfocus" ||
        subtab === "crypto" ||
        subtab === "politics" ||
        subtab === "sports" ||
        subtab === "entertainment")
    ) {
      setCurrentSubTab(subtab as SubTabView);
    }
  }, [searchParams]);

  return (
    <>
      {/* Consolidated Header with Tab Navigation - Fixed */}
      <div className="mb-3 flex-shrink-0">
        <TabNavigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentSubTab={currentSubTab}
          onSubTabChange={setCurrentSubTab}
          isAuthenticated={clobAuth.isAuthenticated}
          rightContent={
            <>
              <button
                onClick={() => setDiagnosticsOpen(true)}
                className="p-2 hover:bg-muted transition-colors border border-border"
                title="Diagnostics"
              >
                <Activity className="w-4 h-4 text-muted-foreground hover:text-neutral transition-colors" />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 hover:bg-muted transition-colors border border-border"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-muted-foreground hover:text-neutral transition-colors" />
              </button>
            </>
          }
        />
      </div>

      {/* CLOB Authentication - Fixed (hide on livedata and marketfocus subtabs) */}
      {!(
        currentTab === "main" &&
        (currentSubTab === "livedata" || currentSubTab === "marketfocus")
      ) && (
        <div className="mb-4 flex-shrink-0">
          <ClobAuth />
        </div>
      )}

      {/* Crypto Ticker - Fixed (hide on livedata and marketfocus subtabs) */}
      {!(
        currentTab === "main" &&
        (currentSubTab === "livedata" || currentSubTab === "marketfocus")
      ) && (
        <div className="mb-4 flex-shrink-0">
          <CryptoTicker />
        </div>
      )}

      {/* Main Dashboard View */}
      {currentTab === "main" && (
        <>
          {currentSubTab === "all" && (
            <>
              {/* Stats Bar - Fixed */}
              <div className="mb-4 flex-shrink-0">
                <LiveStats />
              </div>

              {/* Main Grid - Scrollable content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0 overflow-auto lg:overflow-auto">
                {/* Left Column - Top Markets */}
                <div className="lg:col-span-1 h-full min-h-[600px] lg:min-h-0 overflow-hidden">
                  <TopMarkets />
                </div>

                {/* Middle Column - Trade Feed */}
                <div className="lg:col-span-2 h-full min-h-[600px] lg:min-h-0 overflow-hidden">
                  <TradeFeed />
                </div>

                {/* Right Column - Order Book */}
                <div className="lg:col-span-1 h-full min-h-[600px] lg:min-h-0 overflow-hidden">
                  <OrderBook />
                </div>
              </div>
            </>
          )}

          {currentSubTab === "livedata" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <LiveData />
            </div>
          )}

          {currentSubTab === "marketfocus" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <MarketFocus />
            </div>
          )}

          {currentSubTab === "crypto" && (
            <div className="flex-1 min-h-0 overflow-auto">
              <CryptoMarkets />
            </div>
          )}

          {currentSubTab === "politics" && (
            <div className="flex-1 min-h-0 overflow-auto p-8 text-center">
              <h2 className="text-foreground font-mono text-2xl mb-4">
                🗳️ POLITICS MARKETS
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Coming soon...
              </p>
            </div>
          )}

          {currentSubTab === "sports" && (
            <div className="flex-1 min-h-0 overflow-auto p-8 text-center">
              <h2 className="text-foreground font-mono text-2xl mb-4">
                ⚽ SPORTS MARKETS
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Coming soon...
              </p>
            </div>
          )}

          {currentSubTab === "entertainment" && (
            <div className="flex-1 min-h-0 overflow-auto p-8 text-center">
              <h2 className="text-foreground font-mono text-2xl mb-4">
                🎬 ENTERTAINMENT MARKETS
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Coming soon...
              </p>
            </div>
          )}
        </>
      )}

      {/* Orderbook Depth View */}
      {currentTab === "orderbook" && (
        <div className="flex-1 min-h-0 overflow-auto">
          <OrderbookDepth />
        </div>
      )}

      {/* My Orders View */}
      {currentTab === "trading" && (
        <div className="flex-1 min-h-0 overflow-auto">
          <MyOrders />
        </div>
      )}

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <DiagnosticsModal
        open={diagnosticsOpen}
        onOpenChange={setDiagnosticsOpen}
      />

      {/* Footer - Fixed */}
      <div className="mt-4 panel text-center flex-shrink-0">
        <p className="text-[11px] sm:text-xs font-mono text-muted-foreground">
          Real-time data powered by Polymarket WebSocket API + CLOB Client |
          Built with Next.js 15 + TypeScript + Zustand
        </p>
      </div>
    </>
  );
}

export default function Home() {
  useEffect(() => {
    // Connect to Polymarket Real-Time Service
    // Subscriptions are handled automatically in the service
    realtimeService.connect();

    // Initialize CLOB client in read-only mode
    clobService.initializeReadOnly();

    // Cleanup on unmount
    return () => {
      realtimeService.disconnect();
      clobService.disconnect();
    };
  }, []);

  return (
    <AppShell>
      <main className="min-h-[calc(100vh-4rem)] flex flex-col p-4 bg-background overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse text-muted-foreground font-mono text-sm">
                  LOADING...
                </div>
              </div>
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
