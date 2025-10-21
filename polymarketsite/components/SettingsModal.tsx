"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings as SettingsIcon,
  Info,
  Bell,
  Eye,
  Palette,
  RefreshCw,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border max-w-2xl max-h-[90vh] p-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-neutral" />
              <DialogTitle className="text-xl font-mono font-bold text-foreground">
                SETTINGS
              </DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-2">
            Configure your Polymarket Live Monitor preferences
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0 max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Display Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-neutral" />
                <h3 className="text-base font-mono font-bold text-foreground">
                  DISPLAY
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card border border-border">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-foreground mb-1">
                      Compact Mode
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Reduce spacing and padding for more data on screen
                    </div>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={`relative w-12 h-6 transition-colors border ${
                      compactMode
                        ? "bg-neutral border-neutral"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-foreground transition-transform ${
                        compactMode ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-card border border-border">
                  <div className="text-sm font-mono text-foreground mb-3">
                    Theme
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme("dark")}
                      className={`px-4 py-2 font-mono text-xs transition-colors flex items-center justify-center gap-2 ${
                        theme === "dark"
                          ? "bg-neutral/20 border border-neutral text-neutral"
                          : "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-border/70"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      DARK
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`px-4 py-2 font-mono text-xs transition-colors flex items-center justify-center gap-2 ${
                        theme === "light"
                          ? "bg-neutral/20 border border-neutral text-neutral"
                          : "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-border/70"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      LIGHT
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Settings */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-neutral" />
                <h3 className="text-base font-mono font-bold text-foreground">
                  DATA & REFRESH
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card border border-border">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-foreground mb-1">
                      Auto-Refresh Markets
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Automatically refresh market data
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`relative w-12 h-6 transition-colors border ${
                      autoRefresh
                        ? "bg-buy border-buy"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-foreground transition-transform ${
                        autoRefresh ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {autoRefresh && (
                  <div className="p-3 bg-card border border-border">
                    <div className="text-sm font-mono text-foreground mb-3">
                      Refresh Interval
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max="120"
                        step="10"
                        value={refreshInterval}
                        onChange={(e) =>
                          setRefreshInterval(parseInt(e.target.value))
                        }
                        className="flex-1 h-1 bg-border/40 appearance-none cursor-pointer"
                        style={{
                          accentColor: "rgb(var(--neutral))",
                        }}
                      />
                      <div className="text-sm font-mono text-neutral font-bold w-16 text-right">
                        {refreshInterval}s
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                      Market data will refresh every {refreshInterval} seconds
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Notifications */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-neutral" />
                <h3 className="text-base font-mono font-bold text-foreground">
                  NOTIFICATIONS
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card border border-border">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-foreground mb-1">
                      Enable Notifications
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Get notified about important market events
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-12 h-6 transition-colors border ${
                      notifications
                        ? "bg-buy border-buy"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-foreground transition-transform ${
                        notifications ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-muted border border-border">
                  <div className="text-xs font-mono text-muted-foreground">
                    <span className="text-neutral">Note:</span> Browser
                    notifications require permission. Click &quot;Enable
                    Notifications&quot; to grant access.
                  </div>
                </div>
              </div>
            </section>

            {/* System Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-neutral" />
                <h3 className="text-base font-mono font-bold text-foreground">
                  SYSTEM INFO
                </h3>
              </div>

              <div className="p-4 bg-card border border-border">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">
                        VERSION
                      </div>
                      <div className="text-sm font-mono font-bold text-foreground">
                        1.0.0
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">
                        FRAMEWORK
                      </div>
                      <div className="text-sm font-mono font-bold text-foreground">
                        Next.js 15
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="text-xs font-mono text-muted-foreground mb-2">
                      DATA SOURCES
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">
                          Polymarket WebSocket
                        </span>
                        <span className="text-buy">● Live</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Gamma API</span>
                        <span className="text-buy">● Live</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">
                          CLOB Client
                        </span>
                        <span className="text-buy">● Live</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="text-xs font-mono text-muted-foreground">
                      Built with TypeScript + Zustand + Tailwind CSS
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="pb-2">
              <div className="p-4 bg-secondary border border-border/60 text-center">
                <div className="text-base font-mono font-bold text-neutral mb-2">
                  POLYMARKET LIVE MONITOR
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Real-time market data powered by Polymarket
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-2">
                  © 2024 | 100% Live Data
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => {
              setAutoRefresh(true);
              setRefreshInterval(30);
              setNotifications(false);
              setCompactMode(false);
            }}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            RESET TO DEFAULTS
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/80 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
