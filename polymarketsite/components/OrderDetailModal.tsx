"use client";

import { useState } from "react";
import { formatPrice, formatTimestamp, formatLargeNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Hash,
  User,
  Activity,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
  Zap,
} from "lucide-react";

export interface OrderBookOrder {
  price: string;
  size: string;
  side: "BUY" | "SELL";
  asset?: string;
  market?: string;
  marketTitle?: string;
  outcome?: string;
  timestamp?: number;
  orderId?: string;
  outcomeIndex?: number;
}

interface OrderDetailModalProps {
  order: OrderBookOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMarket?: (eventSlug?: string, tokenId?: string) => void;
  onTakeOrder?: (order: OrderBookOrder) => void;
  userAddress?: string;
}

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onViewMarket,
  onTakeOrder,
  userAddress,
}: OrderDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!order) return null;

  const handleViewMarket = () => {
    if (onViewMarket && order.asset) {
      onViewMarket(undefined, order.asset);
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isBuy = order.side === "BUY";
  const orderValue = (parseFloat(order.price) * parseFloat(order.size)).toFixed(
    2,
  );

  // Calculate probability from price
  const probability = (parseFloat(order.price) * 100).toFixed(1);
  const oppositeProbability = (100 - parseFloat(probability)).toFixed(1);

  // Estimate fees (typical 2% = 200 bps)
  const feeRate = 0.02; // 2%
  const estimatedFee = (parseFloat(orderValue) * feeRate).toFixed(2);

  // Format timestamp if available
  const formattedDate = order.timestamp
    ? new Date(
        order.timestamp > 10000000000
          ? order.timestamp
          : order.timestamp * 1000,
      ).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "N/A";

  const relativeTime = order.timestamp
    ? formatTimestamp(
        order.timestamp > 10000000000
          ? order.timestamp
          : order.timestamp * 1000,
      )
    : "Recently";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0 bg-background border-border flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-mono font-bold mb-1">
                OPEN ORDER
              </DialogTitle>
              <div className="text-sm text-muted-foreground font-mono">
                {formattedDate}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-blue-500 bg-blue-500/10">
              <span className="text-base">●</span>
              ACTIVE
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-bold ${
                isBuy ? "text-buy bg-buy/10" : "text-sell bg-sell/10"
              }`}
            >
              {isBuy ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {order.side}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="p-6 space-y-6">
            {/* Market Information */}
            {order.marketTitle && (
              <div className="bg-secondary/30 border border-border rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {onViewMarket ? (
                      <button
                        onClick={handleViewMarket}
                        className="text-base font-mono font-bold mb-1 hover:text-primary transition-colors text-left group"
                      >
                        <span className="group-hover:underline">
                          {order.marketTitle}
                        </span>
                        <ExternalLink className="w-4 h-4 ml-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ) : (
                      <h3 className="text-base font-mono font-bold mb-1">
                        {order.marketTitle}
                      </h3>
                    )}
                    {order.outcome && (
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground font-mono">
                          Outcome:
                        </div>
                        <div className="text-sm font-mono font-bold">
                          {order.outcome}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="panel p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
                  <DollarSign className="w-4 h-4" />
                  PRICE
                </div>
                <div className="text-2xl font-mono font-bold">
                  ${formatPrice(order.price)}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {probability}% implied probability
                </div>
              </div>

              <div className="panel p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
                  <Activity className="w-4 h-4" />
                  SIZE
                </div>
                <div className="text-2xl font-mono font-bold">
                  {formatLargeNumber(order.size)}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  shares available
                </div>
              </div>

              <div className="panel p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
                  <DollarSign className="w-4 h-4" />
                  TOTAL VALUE
                </div>
                <div className="text-2xl font-mono font-bold">
                  ${formatLargeNumber(orderValue)}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  to fill entire order
                </div>
              </div>

              <div className="panel p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-2">
                  <Clock className="w-4 h-4" />
                  CREATED
                </div>
                <div className="text-lg font-mono font-bold">
                  {order.timestamp
                    ? new Date(
                        order.timestamp > 10000000000
                          ? order.timestamp
                          : order.timestamp * 1000,
                      ).toLocaleTimeString()
                    : "Unknown"}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {order.timestamp
                    ? new Date(
                        order.timestamp > 10000000000
                          ? order.timestamp
                          : order.timestamp * 1000,
                      ).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="panel p-4">
                <div className="text-xs text-muted-foreground font-mono mb-2">
                  ORDER TYPE
                </div>
                <div className="text-sm font-mono font-bold">
                  Limit Order @ ${formatPrice(order.price)}
                </div>
              </div>

              <div className="panel p-4">
                <div className="text-xs text-muted-foreground font-mono mb-2">
                  EST. FEES (IF YOU FILL)
                </div>
                <div className="text-sm font-mono font-bold">
                  ${estimatedFee} ({(feeRate * 100).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="panel p-4 border-2 border-dashed border-orange-500/20 bg-orange-500/5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-mono font-bold mb-1 text-orange-500">
                    PRIVACY PROTECTED ORDER
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    The creator&apos;s address is hidden until this order is
                    filled. This protects against front-running and maintains
                    market fairness.
                  </div>
                </div>
              </div>
            </div>

            {/* Trader Information */}
            <div className="space-y-4">
              {/* Order Creator - Anonymous */}
              <div className="panel p-4 border-2 border-dashed border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-3">
                  <User className="w-4 h-4" />
                  ORDER CREATOR {isBuy ? "(BUYER)" : "(SELLER)"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                  <AlertCircle className="w-4 h-4" />
                  Hidden until order is filled
                </div>
              </div>

              {/* You (Potential Taker) */}
              {userAddress ? (
                <div className="panel p-4 bg-accent/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-3">
                    <User className="w-4 h-4" />
                    YOU (IF YOU TAKE THIS ORDER)
                  </div>
                  <div className="space-y-2">
                    <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded block">
                      {formatAddress(userAddress)}
                    </code>
                    <div className="text-xs text-muted-foreground">
                      You would be the {isBuy ? "seller" : "buyer"} if you fill
                      this order
                    </div>
                  </div>
                </div>
              ) : (
                <div className="panel p-4 bg-accent/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-3">
                    <User className="w-4 h-4" />
                    POTENTIAL TAKER {isBuy ? "(SELLER)" : "(BUYER)"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connect wallet to fill this order
                  </div>
                </div>
              )}
            </div>

            {/* Technical Details */}
            {(order.orderId || order.asset || order.market) && (
              <div className="panel p-4">
                <h3 className="text-sm font-mono font-bold mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  TECHNICAL DETAILS
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  {order.orderId && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Order ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatAddress(order.orderId)}
                        </code>
                        <Button
                          onClick={() =>
                            copyToClipboard(order.orderId!, "orderId")
                          }
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === "orderId" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.asset && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Token ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatAddress(order.asset)}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(order.asset!, "asset")}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === "asset" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.market && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Market ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatAddress(order.market)}
                        </code>
                        <Button
                          onClick={() =>
                            copyToClipboard(order.market!, "market")
                          }
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === "market" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.outcomeIndex !== undefined && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">
                        Outcome Index
                      </span>
                      <span className="font-bold">{order.outcomeIndex}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What Happens Next */}
            <div className="panel p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-mono font-bold mb-2">
                    WHAT HAPPENS IF YOU FILL THIS ORDER?
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground font-mono">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        You {isBuy ? "sell" : "buy"}{" "}
                        {formatLargeNumber(order.size)} shares at $
                        {formatPrice(order.price)} each
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Total {isBuy ? "proceeds" : "cost"}: $
                        {formatLargeNumber(orderValue)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Trading fee: ~${estimatedFee} (
                        {(feeRate * 100).toFixed(2)}%)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Order is filled instantly and recorded on blockchain
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Timestamp Details */}
            {order.timestamp && (
              <div className="panel p-4">
                <div className="text-xs text-muted-foreground font-mono mb-2">
                  FULL TIMESTAMP
                </div>
                <div className="text-sm font-mono mb-1">{formattedDate}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  Unix:{" "}
                  {order.timestamp > 10000000000
                    ? order.timestamp
                    : order.timestamp * 1000}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-border flex-shrink-0">
          <div className="flex gap-3">
            {onTakeOrder && (
              <Button
                onClick={() => onTakeOrder(order)}
                className="flex-1 font-mono"
                variant="default"
              >
                <Zap className="w-4 h-4 mr-2" />
                Fill This Order
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-mono"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
