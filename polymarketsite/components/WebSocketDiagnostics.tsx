"use client";

import { useEffect, useState } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface DiagnosticLog {
  id: string;
  timestamp: number;
  level: "info" | "success" | "warning" | "error";
  message: string;
  data?: any;
}

export function WebSocketDiagnostics() {
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const { connected, connecting, error, trades, comments, cryptoPrices } =
    usePolymarketStore();

  const addLog = (
    level: DiagnosticLog["level"],
    message: string,
    data?: any
  ) => {
    const log: DiagnosticLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      level,
      message,
      data,
    };
    setLogs((prev) => [log, ...prev].slice(0, 200));
  };

  useEffect(() => {
    // Monitor connection state changes
    if (connected) {
      addLog("success", "WebSocket connected successfully");
    } else if (connecting) {
      addLog("info", "Attempting to connect to WebSocket...");
    } else if (error) {
      addLog("error", `Connection error: ${error}`);
    }
  }, [connected, connecting, error]);

  useEffect(() => {
    // Monitor data flow
    if (trades.length > 0) {
      const latestTrade = trades[0];
      addLog(
        "success",
        `Trade received: ${latestTrade.marketTitle}`,
        latestTrade
      );
    }
  }, [trades.length]);

  useEffect(() => {
    if (comments.length > 0) {
      addLog("success", `Comment received`);
    }
  }, [comments.length]);

  useEffect(() => {
    if (cryptoPrices.size > 0) {
      const prices = Array.from(cryptoPrices.values());
      addLog(
        "success",
        `Crypto prices updated: ${prices.length} symbols`,
        prices
      );
    }
  }, [cryptoPrices.size]);

  const getStatusIcon = () => {
    if (connected)
      return <Wifi className="w-5 h-5 text-buy animate-pulse" />;
    if (connecting)
      return <Activity className="w-5 h-5 text-neutral animate-spin" />;
    return <WifiOff className="w-5 h-5 text-sell" />;
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

  const getLevelIcon = (level: DiagnosticLog["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-buy" />;
      case "error":
        return <XCircle className="w-3 h-3 text-sell" />;
      case "warning":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <Activity className="w-3 h-3 text-neutral" />;
    }
  };

  const getLevelColor = (level: DiagnosticLog["level"]) => {
    switch (level) {
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
      fractionalSecondDigits: 3,
    });
  };

  const testConnection = () => {
    addLog("info", "Manual connection test triggered");
    // Force reload to reconnect
    window.location.reload();
  };

  return (
    <div className="panel">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:bg-muted transition-colors p-2 -m-2"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <h2 className="text-lg font-mono font-bold tracking-tight">
            WEBSOCKET DIAGNOSTICS
          </h2>
          <span className={`text-sm font-mono ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              testConnection();
            }}
            className="px-3 py-1 text-xs font-mono bg-neutral/20 text-neutral hover:bg-neutral/30 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            RECONNECT
          </button>
          <span className="text-muted-foreground text-sm">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Connection Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-border p-3">
              <div className="text-xs font-mono text-muted-foreground mb-1">
                Status
              </div>
              <div className={`text-sm font-mono font-bold ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
            <div className="border border-border p-3">
              <div className="text-xs font-mono text-muted-foreground mb-1">
                Trades
              </div>
              <div className="text-sm font-mono font-bold text-buy">
                {trades.length}
              </div>
            </div>
            <div className="border border-border p-3">
              <div className="text-xs font-mono text-muted-foreground mb-1">
                Comments
              </div>
              <div className="text-sm font-mono font-bold text-neutral">
                {comments.length}
              </div>
            </div>
            <div className="border border-border p-3">
              <div className="text-xs font-mono text-muted-foreground mb-1">
                Crypto Prices
              </div>
              <div className="text-sm font-mono font-bold text-foreground">
                {cryptoPrices.size}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="border border-sell bg-sell/10 p-3">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-sell flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-mono font-bold text-sell mb-1">
                    {error.includes("1006") ? "ABNORMAL CLOSURE (1006)" : "CONNECTION ERROR"}
                  </div>
                  <div className="text-xs font-mono text-sell/80">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold">
                ACTIVITY LOG ({logs.length})
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                CLEAR
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs font-mono border border-border">
                No activity logged yet...
              </div>
            ) : (
              <ScrollArea className="h-64 border border-border">
                <div className="p-3 space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 text-xs font-mono hover:bg-muted/50 transition-colors p-2 -m-2"
                    >
                      <span className="text-muted-foreground flex-shrink-0 w-24">
                        {formatTime(log.timestamp)}
                      </span>
                      <div className="flex-shrink-0 mt-0.5">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={getLevelColor(log.level)}>
                          {log.message}
                        </span>
                        {log.data && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View data
                            </summary>
                            <pre className="mt-1 text-xs bg-muted p-2 overflow-auto max-h-32">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Debug Info */}
          <details className="border border-border">
            <summary className="cursor-pointer p-3 hover:bg-muted transition-colors text-xs font-mono font-bold">
              DEBUG INFORMATION
            </summary>
            <div className="p-3 space-y-2 text-xs font-mono border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">WebSocket URL:</span>
                  <div className="break-all">
                    {typeof window !== "undefined"
                      ? window.location.protocol === "https:"
                        ? "wss://ws-live-data.polymarket.com"
                        : "wss://ws-live-data.polymarket.com"
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Browser:</span>
                  <div>
                    {typeof window !== "undefined"
                      ? navigator.userAgent.includes("Chrome")
                        ? "Chrome"
                        : navigator.userAgent.includes("Firefox")
                          ? "Firefox"
                          : navigator.userAgent.includes("Safari")
                            ? "Safari"
                            : "Other"
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    WebSocket Support:
                  </span>
                  <div
                    className={
                      typeof WebSocket !== "undefined"
                        ? "text-buy"
                        : "text-sell"
                    }
                  >
                    {typeof WebSocket !== "undefined"
                      ? "✓ Supported"
                      : "✗ Not Supported"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Online:</span>
                  <div
                    className={
                      typeof navigator !== "undefined" && navigator.onLine
                        ? "text-buy"
                        : "text-sell"
                    }
                  >
                    {typeof navigator !== "undefined" && navigator.onLine
                      ? "✓ Yes"
                      : "✗ No"}
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Recommendations */}
          {!connected && !connecting && (
            <div className="border border-neutral bg-neutral/10 p-3">
              <div className="text-xs font-mono font-bold text-neutral mb-2">
                💡 TROUBLESHOOTING TIPS
              </div>
              <ul className="text-xs font-mono text-neutral/80 space-y-1 list-disc list-inside">
                <li>Check browser console for detailed WebSocket errors</li>
                <li>Verify internet connection is stable</li>
                <li>Try refreshing the page</li>
                <li>Check if firewall/VPN is blocking WebSocket connections</li>
                <li>
                  Mock data mode will activate automatically if connection fails
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
