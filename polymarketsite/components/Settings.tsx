"use client";

import { useState } from "react";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { WebSocketDebug } from "@/components/WebSocketDebug";
import { WebSocketDiagnostics } from "@/components/WebSocketDiagnostics";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings as SettingsIcon,
  Activity,
  Wifi,
  Database,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function Settings() {
  const [connectionExpanded, setConnectionExpanded] = useState(true);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [detailedExpanded, setDetailedExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral" />
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold tracking-tight">
              SETTINGS & DIAGNOSTICS
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-1">
              System monitoring, connection status, and configuration
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 pr-4">
          {/* Connection Diagnostics Section */}
          <section>
            <div
              onClick={() => setConnectionExpanded(!connectionExpanded)}
              className="w-full flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {connectionExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral" />
              )}
              <Wifi className="w-4 h-4 text-neutral" />
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                CONNECTION DIAGNOSTICS
              </h3>
            </div>
            {connectionExpanded && (
              <div className="space-y-4">
                <DiagnosticsPanel />
              </div>
            )}
          </section>

          {/* WebSocket Debug Section */}
          <section>
            <div
              onClick={() => setDebugExpanded(!debugExpanded)}
              className="w-full flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {debugExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral" />
              )}
              <Activity className="w-4 h-4 text-neutral" />
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                WEBSOCKET DEBUG
              </h3>
            </div>
            {debugExpanded && (
              <div className="space-y-4">
                <WebSocketDebug />
              </div>
            )}
          </section>

          {/* WebSocket Diagnostics Section */}
          <section>
            <div
              onClick={() => setDetailedExpanded(!detailedExpanded)}
              className="w-full flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {detailedExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral" />
              )}
              <Database className="w-4 h-4 text-neutral" />
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                DETAILED DIAGNOSTICS
              </h3>
            </div>
            {detailedExpanded && (
              <div className="space-y-4">
                <WebSocketDiagnostics />
              </div>
            )}
          </section>

          {/* System Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-neutral" />
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                SYSTEM INFORMATION
              </h3>
            </div>
            <div className="panel">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-1">
                      FRAMEWORK
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold">
                      Next.js 15
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-1">
                      LANGUAGE
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold">
                      TypeScript
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-1">
                      STATE MANAGEMENT
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold">
                      Zustand
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-1">
                      STYLING
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold">
                      Tailwind CSS
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-2">
                    DATA SOURCES
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                      <span className="text-muted-foreground">
                        Polymarket Real-Time WebSocket
                      </span>
                      <span className="text-buy">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                      <span className="text-muted-foreground">
                        Gamma REST API
                      </span>
                      <span className="text-buy">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                      <span className="text-muted-foreground">CLOB Client</span>
                      <span className="text-buy">Active</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mb-2">
                    FEATURES
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Live Trade Feed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Real-Time Order Books
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Crypto Price Tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Market Comments
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Market Detail Modals
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Category Filtering
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        Advanced Order Depth
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-buy">✓</span>
                      <span className="text-xs sm:text-sm font-mono text-foreground">
                        CLOB Authentication
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <SettingsIcon className="w-4 h-4 text-neutral" />
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                CONFIGURATION
              </h3>
            </div>
            <div className="panel">
              <div className="space-y-3">
                <div className="text-xs sm:text-sm font-mono text-muted-foreground">
                  Configuration options coming soon. This section will include:
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm font-mono text-muted-foreground ml-2">
                  <li>Display density (Compact / Comfortable / Spacious)</li>
                  <li>Auto-refresh intervals</li>
                  <li>Notification preferences</li>
                  <li>Data persistence settings</li>
                  <li>Theme customization</li>
                  <li>Default market filters</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="pb-4">
            <div className="panel bg-secondary border border-border/60">
              <div className="text-center space-y-2">
                <h3 className="text-base sm:text-lg font-mono font-bold text-neutral">
                  POLYMARKET LIVE MONITOR
                </h3>
                <p className="text-[11px] sm:text-xs font-mono text-muted-foreground">
                  Version 1.0.0 | Built with Next.js 15 + TypeScript + Zustand
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-muted-foreground">
                  Real-time data powered by Polymarket WebSocket API + CLOB
                  Client
                </p>
                <div className="pt-2 text-[11px] sm:text-xs font-mono text-muted-foreground">
                  © 2024 | 100% Real-Time Market Data
                </div>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
