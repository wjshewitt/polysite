"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { clobService } from "@/services/clob";
import { X, RefreshCw } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

export function MyOrders() {
  const clobAuth = usePolymarketStore((state) => state.clobAuth);
  const userOrders = usePolymarketStore((state) => state.userOrders);
  const setUserOrders = usePolymarketStore((state) => state.setUserOrders);
  const removeUserOrder = usePolymarketStore((state) => state.removeUserOrder);

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!clobAuth.isAuthenticated) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const orders = await clobService.getOpenOrders();
        setUserOrders(orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Auto-refresh every 10 seconds
    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [clobAuth.isAuthenticated, autoRefresh, setUserOrders]);

  const handleCancelOrder = async (orderId: string) => {
    setCancelling(orderId);
    try {
      const result = await clobService.cancelOrder(orderId);
      if (result.success) {
        removeUserOrder(orderId);
      } else {
        setError(result.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  const handleCancelAll = async () => {
    if (!confirm("Are you sure you want to cancel all orders?")) return;

    setLoading(true);
    try {
      const result = await clobService.cancelAllOrders();
      if (result.success) {
        setUserOrders([]);
      } else {
        setError(result.error || "Failed to cancel all orders");
      }
    } catch (err) {
      console.error("Failed to cancel all orders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to cancel all orders",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0.0000";
    return num.toFixed(4);
  };

  const formatSize = (size: string): string => {
    const num = parseFloat(size);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const calculateFilled = (size: string, originalSize: string): number => {
    const current = parseFloat(size);
    const original = parseFloat(originalSize);
    if (isNaN(current) || isNaN(original) || original === 0) return 0;
    return ((original - current) / original) * 100;
  };

  // Using shared utils.formatTimestamp

  if (!clobAuth.isAuthenticated) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-foreground font-mono text-lg font-bold mb-2">
            AUTHENTICATION REQUIRED
          </h3>
          <p className="text-muted-foreground font-mono text-sm mb-4">
            Connect your wallet to view and manage your orders
          </p>
          <div className="text-muted-foreground font-mono text-xs bg-card border border-border p-4">
            <div className="text-left space-y-2">
              <div>• View your open orders</div>
              <div>• Monitor order status</div>
              <div>• Cancel individual orders</div>
              <div>• Batch cancel all orders</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && userOrders.length === 0) {
    return (
      <div className="h-full bg-card border border-border flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border border-border flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-foreground font-mono text-sm font-semibold">
              MY ORDERS
            </h2>
            <div className="text-muted-foreground font-mono text-xs mt-1">
              {clobAuth.address && (
                <span>
                  {clobAuth.address.slice(0, 6)}...{clobAuth.address.slice(-4)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 font-mono text-xs border transition-colors ${
                autoRefresh
                  ? "border-buy text-buy"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {autoRefresh ? "AUTO ✓" : "MANUAL"}
            </button>
            {userOrders.length > 0 && (
              <button
                onClick={handleCancelAll}
                disabled={loading}
                className="px-3 py-1 font-mono text-xs bg-sell text-destructive-foreground hover:bg-sell/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CANCEL ALL
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-2 px-3 py-2 bg-sell/10 border border-sell text-sell font-mono text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Orders List */}
      {userOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-muted-foreground font-mono text-sm">
              No open orders
            </div>
            <div className="text-muted-foreground font-mono text-xs mt-1">
              Place orders to see them here
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {userOrders.map((order) => {
              const filled = calculateFilled(order.size, order.originalSize);
              const isCancelling = cancelling === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-card border border-border p-4 hover:border-neutral transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-1 ${
                            order.side === "BUY"
                              ? "bg-buy text-success-foreground"
                              : "bg-sell text-destructive-foreground"
                          }`}
                        >
                          {order.side}
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          {order.outcome || "Unknown Outcome"}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {formatTimestamp(order.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isCancelling}
                      className="p-1 text-sell hover:bg-sell hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cancel order"
                    >
                      {isCancelling ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-1">
                        Price
                      </div>
                      <div className="font-mono text-lg font-bold text-foreground">
                        {formatPrice(order.price)}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-1">
                        Size
                      </div>
                      <div className="font-mono text-lg font-bold text-foreground">
                        {formatSize(order.size)}
                      </div>
                    </div>
                  </div>

                  {/* Fill Progress */}
                  {filled > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          Filled
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          {filled.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1 bg-border overflow-hidden">
                        <div
                          className="h-full bg-neutral transition-all duration-300"
                          style={{ width: `${filled}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Order ID */}
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="font-mono text-xs text-muted-foreground">
                      ID: {order.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <div>
            Total Orders:{" "}
            <span className="text-foreground">{userOrders.length}</span>
          </div>
          <div>
            {userOrders.filter((o) => o.status === "LIVE").length} active
          </div>
        </div>
      </div>
    </div>
  );
}
