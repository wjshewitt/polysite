"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { useEffect, useState } from "react";
import { realtimeService } from "@/services/realtime";
import { Clock } from "lucide-react";

interface ConnectionLog {
  timestamp: number;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

export function WebSocketDebug() {
  const { connected, connecting, error, cryptoPrices, trades } =
    usePolymarketStore();
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [wsUrl, setWsUrl] = useState<string>("");
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  useEffect(() => {
    // Get WebSocket URL from environment
    const url =
      process.env.NEXT_PUBLIC_POLYMARKET_REALTIME_WS_URL ||
      process.env.NEXT_PUBLIC_POLYMARKET_WS_URL ||
      "wss://ws-live-data.polymarket.com";
    setWsUrl(url);

    // Add initial log
    addLog("info", `WebSocket URL: ${url}`);

    // Poll reconnect attempts
    const interval = setInterval(() => {
      const attempts = realtimeService.getReconnectAttempts();
      setReconnectAttempts(attempts);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (connected) {
      addLog("success", "✅ WebSocket connected successfully");
    } else if (connecting) {
      addLog("info", "🔄 Connecting to WebSocket...");
    } else if (error) {
      addLog("error", `❌ Connection error: ${error}`);
    }
  }, [connected, connecting, error]);

  useEffect(() => {
    if (cryptoPrices.size > 0) {
      addLog(
        "success",
        `💰 Crypto prices received: ${cryptoPrices.size} symbols`,
      );
    }
  }, [cryptoPrices.size]);

  const addLog = (
    level: "info" | "success" | "warning" | "error",
    message: string,
  ) => {
    setLogs((prev) => [
      { timestamp: Date.now(), level, message },
      ...prev.slice(0, 49), // Keep last 50 logs
    ]);
  };

  const getConnectionStatus = () => {
    if (connected) return { text: "CONNECTED", color: "text-buy" };
    if (connecting) return { text: "CONNECTING...", color: "text-neutral" };
    return { text: "DISCONNECTED", color: "text-sell" };
  };

  const status = getConnectionStatus();

  const handleReconnect = () => {
    addLog("info", "🔄 Manual reconnection initiated...");
    realtimeService.resetReconnectAttempts();
    realtimeService.disconnect();
    setTimeout(() => {
      realtimeService.connect();
    }, 1000);
  };

  const handleReset = () => {
    addLog("info", "🔄 Resetting reconnection state...");
    realtimeService.resetReconnectAttempts();
    setReconnectAttempts(0);
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog("info", "Logs cleared");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-buy";
      case "error":
        return "text-sell";
      case "warning":
        return "text-amber-400";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="bg-card border border-border">
      {/* Header - Collapsible */}
      <div
        className="px-4 py-3 border-b border-border cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-buy animate-pulse" : "bg-sell"}`}
            ></div>
            <h3 className="text-foreground font-mono text-sm font-semibold tracking-wider">
              WEBSOCKET DIAGNOSTICS
            </h3>
            <span className={`font-mono text-xs font-bold ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs">
              {isExpanded ? "▼" : "▶"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Connection Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-1">
                STATUS
              </div>
              <div className={`font-mono text-sm font-bold ${status.color}`}>
                {status.text}
              </div>
            </div>

            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-1">
                CRYPTO PRICES
              </div>
              <div className="font-mono text-sm font-bold text-foreground">
                {cryptoPrices.size} / 10
              </div>
            </div>

            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-1">
                TRADES
              </div>
              <div className="font-mono text-sm font-bold text-foreground">
                {trades.length}
              </div>
            </div>

            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-1">
                ENDPOINT
              </div>
              <div
                className="font-mono text-xs text-neutral truncate"
                title={wsUrl}
              >
                {wsUrl.replace("wss://", "")}
              </div>
            </div>

            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-1">
                RECONNECT STATUS
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral" />
                <div className="font-mono text-sm text-foreground">
                  Attempts: {reconnectAttempts} / 5
                </div>
              </div>
              {reconnectAttempts > 0 && (
                <div className="text-amber-400 font-mono text-xs mt-1">
                  ⚠️ Connection unstable - attempting reconnect
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReconnect();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/80 transition-colors"
              disabled={connecting}
            >
              {connecting ? "CONNECTING..." : "RECONNECT"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearLogs();
              }}
              className="px-4 py-2 bg-muted text-foreground font-mono text-xs font-bold hover:bg-muted/80 transition-colors"
            >
              CLEAR LOGS
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="px-4 py-2 bg-muted text-foreground font-mono text-xs font-bold hover:bg-muted/80 transition-colors"
              disabled={reconnectAttempts === 0}
            >
              RESET RECONNECTS
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-sell/10 border border-sell p-3">
              <div className="text-sell font-mono text-xs font-bold mb-1">
                ERROR
              </div>
              <div className="text-foreground font-mono text-xs">{error}</div>
            </div>
          )}

          {/* Crypto Prices Sample */}
          {cryptoPrices.size > 0 && (
            <div className="bg-card border border-border p-3">
              <div className="text-muted-foreground font-mono text-xs mb-2">
                SAMPLE PRICES (First 3)
              </div>
              <div className="space-y-1">
                {Array.from(cryptoPrices.entries())
                  .slice(0, 3)
                  .map(([symbol, price]) => (
                    <div
                      key={symbol}
                      className="flex justify-between items-center"
                    >
                      <span className="text-foreground font-mono text-xs">
                        {symbol}
                      </span>
                      <span className="text-buy font-mono text-xs font-bold">
                        ${price.price}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Console Logs */}
          <div className="bg-card border border-border">
            <div className="px-3 py-2 border-b border-border">
              <div className="text-muted-foreground font-mono text-xs">
                CONNECTION LOGS ({logs.length})
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 space-y-1">
              {logs.length === 0 ? (
                <div className="text-muted-foreground font-mono text-xs text-center py-4">
                  No logs yet...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start font-mono text-xs"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className={getLevelColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-card border border-border p-3">
            <div className="text-muted-foreground font-mono text-xs mb-2">
              TROUBLESHOOTING
            </div>
            <ul className="space-y-1 text-foreground font-mono text-xs">
              <li>
                • Check that{" "}
                <code className="text-neutral">{wsUrl}</code>{" "}
                is reachable
              </li>
              <li>• Open browser DevTools → Network → WS to inspect frames</li>
              <li>
                • Verify{" "}
                <code className="text-neutral">
                  NEXT_PUBLIC_POLYMARKET_REALTIME_WS_URL
                </code>{" "}
                in .env.local
              </li>
              <li>
                • Check for CORS or firewall blocking WebSocket connections
              </li>
              <li>
                • If connection fails, app will use mock data automatically
              </li>
              <li>
                • If seeing reconnect loops, click{" "}
                <code className="text-neutral">RESET RECONNECTS</code> button
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
