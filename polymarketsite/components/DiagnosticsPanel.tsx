"use client";

import { useEffect, useState } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export function DiagnosticsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { connected, connecting, error, trades, comments, cryptoPrices } = usePolymarketStore();

  useEffect(() => {
    // Log connection state changes
    if (connected) {
      addLog("success", "✅ Connected to Polymarket Real-Time Service");
    } else if (connecting) {
      addLog("info", "🔄 Connecting to Polymarket Real-Time Service...");
    } else if (error) {
      addLog("error", `❌ Connection error: ${error}`);
    }
  }, [connected, connecting, error]);

  useEffect(() => {
    // Log new trades
    if (trades.length > 0) {
      const latestTrade = trades[0];
      addLog(
        "success",
        `📊 New trade: ${latestTrade.marketTitle} - ${latestTrade.side} ${latestTrade.size} @ $${latestTrade.price}`
      );
    }
  }, [trades.length]);

  useEffect(() => {
    // Log new comments
    if (comments.length > 0) {
      addLog("info", `💬 New comment received`);
    }
  }, [comments.length]);

  useEffect(() => {
    // Log crypto price updates
    if (cryptoPrices.size > 0) {
      const prices = Array.from(cryptoPrices.values());
      if (prices.length > 0) {
        addLog("info", `₿ Crypto price update: ${prices.length} symbols`);
      }
    }
  }, [cryptoPrices.size]);

  const addLog = (type: LogEntry["type"], message: string) => {
    const log: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
    };
    setLogs((prev) => [log, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const getStatusIcon = () => {
    if (connected) return <Wifi className="w-4 h-4 text-buy" />;
    if (connecting) return <Activity className="w-4 h-4 text-neutral animate-pulse" />;
    return <WifiOff className="w-4 h-4 text-sell" />;
  };

  const getStatusText = () => {
    if (connected) return "CONNECTED";
    if (connecting) return "CONNECTING...";
    return "DISCONNECTED";
  };

  const getStatusColor = () => {
    if (connected) return "text-buy";
    if (connecting) return "text-neutral";
    return "text-sell";
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-buy" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-sell" />;
      case "warning":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <Activity className="w-3 h-3 text-neutral" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-buy";
      case "error":
        return "text-sell";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="panel">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-muted transition-colors p-2 -m-2"
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h2 className="text-sm font-mono font-bold tracking-tight">
            DIAGNOSTICS
          </h2>
          <span className={`text-xs font-mono ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Trades:</span>
            <span className="text-buy font-bold">{trades.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Comments:</span>
            <span className="text-neutral font-bold">{comments.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Prices:</span>
            <span className="text-foreground font-bold">{cryptoPrices.size}</span>
          </div>
          <span className="text-muted-foreground">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </button>

      {/* Expandable Logs */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              ACTIVITY LOG
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              CLEAR
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-mono">
              No activity logged yet...
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 text-xs font-mono"
                  >
                    <span className="text-muted-foreground flex-shrink-0 w-20">
                      {formatTime(log.timestamp)}
                    </span>
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.type)}
                    </div>
                    <span className={`flex-1 ${getLogColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="bg-sell/10 border border-sell p-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-sell flex-shrink-0" />
              <span className="text-xs font-mono text-sell">{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
