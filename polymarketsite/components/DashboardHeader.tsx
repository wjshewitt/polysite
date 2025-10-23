"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, SignedIn, useUser } from "@clerk/nextjs";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { realtimeService } from "@/services/realtime";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketSelector } from "@/components/MarketSelector";
import {
  User,
  Settings,
  Activity,
  BarChart3,
  FlaskConical,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { connected, connecting, error, selectedMarket } = usePolymarketStore();

  const handleReconnect = () => {
    realtimeService.connect();
  };

  const isMockData =
    error?.includes("mock data") || error?.includes("Mock data");

  const getConnectionStatus = () => {
    if (connected) {
      return isMockData ? "MOCK" : "LIVE";
    }
    if (connecting) return "CONNECTING";
    return "OFFLINE";
  };

  const getConnectionColor = () => {
    if (connected) return isMockData ? "text-neutral" : "text-buy";
    if (connecting) return "text-neutral";
    return "text-sell";
  };

  const getConnectionIcon = () => {
    if (connected) {
      return <Wifi className="w-4 h-4" />;
    }
    return <WifiOff className="w-4 h-4" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-2">
        <div className="flex h-14 items-center gap-4">
          {/* Left: Logo - Always far left */}
          <Link
            href="/dashboard"
            className="text-lg font-mono font-bold hover:text-primary transition-colors flex-shrink-0"
          >
            betterPoly
          </Link>

          {/* Center: Dynamic content based on market selection */}
          {selectedMarket ? (
            /* When market selected: Show market info in center */
            <div className="flex-1 flex items-center justify-center min-w-0">
              <div className="flex items-center gap-3 max-w-2xl">
                <div className="font-mono text-xs text-muted-foreground flex-shrink-0">
                  VIEWING
                </div>
                {selectedMarket.icon && (
                  <img
                    src={selectedMarket.icon}
                    alt=""
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold truncate">
                    {selectedMarket.eventTitle || selectedMarket.name}
                  </div>
                  {selectedMarket.eventTitle &&
                    selectedMarket.name !== selectedMarket.eventTitle && (
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {selectedMarket.name}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            /* When no market selected: Show Market Selector centered */
            <div className="flex-1 flex items-center justify-center min-w-0">
              <MarketSelector />
            </div>
          )}

          {/* Divider (only when market selected) */}
          {selectedMarket && (
            <div className="w-px h-6 bg-border flex-shrink-0" />
          )}

          {/* Right: Controls - Always far right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Market Search Button (only when market selected) */}
            {selectedMarket && (
              <div className="flex-shrink-0">
                <MarketSelector />
              </div>
            )}

            {/* Live Data Status Button */}
            <button
              onClick={!connected && !connecting ? handleReconnect : undefined}
              disabled={connected || connecting}
              className={`flex items-center gap-1.5 px-3 py-1.5 border border-border transition-colors font-mono text-xs ${
                connected || connecting
                  ? "bg-card cursor-default"
                  : "bg-card hover:bg-muted cursor-pointer"
              } ${getConnectionColor()}`}
              title={
                connected
                  ? isMockData
                    ? "Mock data mode"
                    : "Live data connected"
                  : connecting
                    ? "Connecting..."
                    : "Click to reconnect"
              }
            >
              {getConnectionIcon()}
              <span className="hidden sm:inline">{getConnectionStatus()}</span>
            </button>

            {/* Theme Toggle - Compact */}
            <ThemeToggle />

            {/* Profile Button with Dropdown */}
            <SignedIn>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border bg-card hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline font-mono text-xs">
                    {user?.firstName || "Profile"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 w-56 bg-card border border-border shadow-lg z-50"
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    {/* User Info Section */}
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10">
                          <UserButton
                            appearance={{
                              elements: {
                                avatarBox: "w-10 h-10",
                                userButtonPopoverCard: "font-mono",
                                userButtonPopoverActionButton:
                                  "font-mono text-xs",
                              },
                            }}
                            afterSignOutUrl="/"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-semibold text-sm truncate">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/dashboard?settings=true");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs">Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/dashboard?diagnostics=true");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs">Diagnostics</span>
                      </button>
                    </div>

                    {/* Temporary Links */}
                    <div className="border-t border-border p-2 space-y-1">
                      <div className="px-3 py-1 text-xs font-mono text-muted-foreground">
                        TEMPORARY
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/data-viz");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs">Analytics</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/test");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <FlaskConical className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs">Test</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
