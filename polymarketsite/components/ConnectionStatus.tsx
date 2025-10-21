"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { realtimeService } from "@/services/realtime";

export function ConnectionStatus() {
  const { connected, connecting, error } = usePolymarketStore();

  const handleReconnect = () => {
    realtimeService.connect();
  };

  const isMockData =
    error?.includes("mock data") || error?.includes("Mock data");

  return (
    <div className="flex items-center gap-3 panel">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 ${
            connected
              ? isMockData
                ? "bg-neutral"
                : "bg-success"
              : connecting
                ? "bg-neutral animate-pulse"
                : "bg-destructive"
          }`}
        />
        <span className="text-sm font-mono">
          {connected
            ? isMockData
              ? "MOCK DATA MODE"
              : "LIVE DATA"
            : connecting
              ? "CONNECTING..."
              : "DISCONNECTED"}
        </span>
      </div>

      {error && !isMockData && (
        <span className="text-sm text-destructive font-mono">| {error}</span>
      )}

      {isMockData && (
        <span className="text-xs text-muted-foreground font-mono">
          | Demo mode - showing simulated market data
        </span>
      )}

      {!connected && !connecting && (
        <button
          onClick={handleReconnect}
          className="px-3 py-1 bg-neutral text-background text-sm font-mono hover:opacity-80 transition-opacity"
        >
          RECONNECT
        </button>
      )}
    </div>
  );
}
