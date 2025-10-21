"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { WebSocketDebug } from "@/components/WebSocketDebug";
import { WebSocketDiagnostics } from "@/components/WebSocketDiagnostics";
import {
  Activity,
  Wifi,
  Database,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface DiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiagnosticsModal({
  open,
  onOpenChange,
}: DiagnosticsModalProps) {
  const [connectionExpanded, setConnectionExpanded] = useState(true);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [detailedExpanded, setDetailedExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border max-w-4xl max-h-[90vh] p-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-neutral" />
              <DialogTitle className="text-xl font-mono font-bold text-foreground">
                DIAGNOSTICS
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
            Developer tools for monitoring WebSocket connections and system
            diagnostics
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0 max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
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

            {/* Info Section */}
            <section className="pb-2">
              <div className="p-4 bg-card border border-border">
                <div className="text-xs font-mono text-muted-foreground mb-2">
                  DEVELOPER TOOLS
                </div>
                <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                  <li>
                    • Monitor real-time WebSocket connection status and messages
                  </li>
                  <li>• Track data subscriptions and message counts</li>
                  <li>• View detailed connection logs and error messages</li>
                  <li>
                    • Manual reconnection controls and troubleshooting tools
                  </li>
                  <li>
                    • Inspect crypto prices, trades, and orderbook updates
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-end flex-shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-neutral text-background font-mono text-xs font-bold hover:bg-neutral/80 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
