"use client";

import { useState } from "react";
import { Trade } from "@/types/polymarket";
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
  CheckCircle2,
  Copy,
  Check,
  X,
  AlertCircle,
  Info,
  Lightbulb,
} from "lucide-react";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMarket?: (eventSlug?: string, tokenId?: string) => void;
  isFilledTrade?: boolean;
  totalOutcomes?: number; // Total number of outcomes in the market (2 for binary, 32 for Super Bowl, etc.)
}

export function TradeDetailModal({
  trade,
  open,
  onOpenChange,
  onViewMarket,
  isFilledTrade = true,
  totalOutcomes,
}: TradeDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!trade) return null;

  const handleViewMarket = () => {
    if (onViewMarket && (trade.eventSlug || trade.asset)) {
      onViewMarket(trade.eventSlug, trade.asset);
    }
  };

  const canViewMarket = onViewMarket && (trade.eventSlug || trade.asset);

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

  const openInExplorer = (address: string) => {
    window.open(`https://polygonscan.com/address/${address}`, "_blank");
  };

  const isBuy = trade.side === "BUY";
  const tradeValue = (parseFloat(trade.price) * parseFloat(trade.size)).toFixed(
    2,
  );

  // Fix timestamp formatting
  const timestamp =
    trade.timestamp > 10000000000 ? trade.timestamp : trade.timestamp * 1000;
  const tradeDate = new Date(timestamp);
  const formattedDate = tradeDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const relativeTime = formatTimestamp(timestamp);

  // Calculate probability from price
  const probability = (parseFloat(trade.price) * 100).toFixed(1);

  // Calculate potential profit/loss
  const sharesAmount = parseFloat(trade.size);
  const pricePerShare = parseFloat(trade.price);
  const potentialPayout = sharesAmount * 1.0; // $1 per share if wins
  const costBasis = sharesAmount * pricePerShare;
  const potentialProfit = (potentialPayout - costBasis).toFixed(2);

  // Calculate fees
  const feeRate = parseFloat(trade.feeRateBps) / 10000;
  const estimatedFee = (parseFloat(tradeValue) * feeRate).toFixed(2);

  // Check if address is null/system address
  const isNullAddress = (addr: string) => {
    return (
      !addr ||
      addr === "0x0000000000000000000000000000000000000000" ||
      addr.replace(/0/g, "") === "x"
    );
  };

  // Determine correct maker/taker labels based on trade side
  const makerLabel = isBuy ? "BUYER" : "SELLER";
  const takerLabel = isBuy ? "SELLER" : "BUYER";

  // Determine market type and context
  const isBinaryMarket = totalOutcomes === 2 || !totalOutcomes;
  const isMultiOutcome = totalOutcomes && totalOutcomes > 2;
  const evenOddsProbability = totalOutcomes
    ? (100 / totalOutcomes).toFixed(1)
    : null;

  // Determine status
  const getStatusInfo = () => {
    if (trade.status === "matched" || trade.status === "filled") {
      return { label: "FILLED", color: "text-green-500 bg-green-500/10" };
    } else if (trade.status === "active" || trade.status === "open") {
      return { label: "ACTIVE", color: "text-blue-500 bg-blue-500/10" };
    } else if (trade.status === "cancelled") {
      return { label: "CANCELLED", color: "text-red-500 bg-red-500/10" };
    }
    return {
      label: trade.status.toUpperCase(),
      color: "text-muted-foreground bg-muted",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 bg-background border-border flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-mono font-bold mb-1">
                {isFilledTrade ? "TRADE DETAILS" : "ORDER DETAILS"}
              </DialogTitle>
              <div className="text-sm text-muted-foreground font-mono">
                {formattedDate}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex gap-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${statusInfo.color}`}
              >
                <span className="text-base">●</span>
                {statusInfo.label}
              </div>
            </div>

            {/* Market Section */}
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              {canViewMarket ? (
                <button
                  onClick={handleViewMarket}
                  className="text-base font-mono font-semibold mb-3 hover:text-primary transition-colors text-left w-full group"
                  title="View market profile on this site"
                >
                  <span className="group-hover:underline">
                    {trade.marketTitle}
                  </span>
                  <ExternalLink className="w-4 h-4 ml-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ) : (
                <div className="text-base font-mono font-semibold mb-3">
                  {trade.marketTitle}
                  {onViewMarket && !trade.eventSlug && !trade.asset && (
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                      (Profile unavailable)
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
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
                  {trade.side}
                </div>
                <span className="text-sm font-mono">{trade.outcome}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-2">
                  <DollarSign className="w-3 h-3" />
                  Price
                </div>
                <div className="text-2xl font-mono font-bold mb-1">
                  ${formatPrice(trade.price)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {probability}% implied probability
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  ${(1 - pricePerShare).toFixed(2)} profit per share if wins
                </div>
              </div>

              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-2">
                  <Activity className="w-3 h-3" />
                  Size
                </div>
                <div className="text-2xl font-mono font-bold mb-1">
                  {formatLargeNumber(trade.size)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  shares
                </div>
              </div>

              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-2">
                  <DollarSign className="w-3 h-3" />
                  Total Value
                </div>
                <div className="text-xl font-mono font-bold mb-1">
                  ${formatLargeNumber(tradeValue)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  + ${estimatedFee} fee
                </div>
              </div>

              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-2">
                  <Clock className="w-3 h-3" />
                  Order Type
                </div>
                <div className="text-xl font-mono font-bold mb-1">Limit</div>
                <div className="text-xs text-muted-foreground font-mono">
                  Good til cancelled
                </div>
              </div>
            </div>

            {/* Context and Education Section - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Market Context */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-mono font-bold mb-2 text-blue-500">
                      MARKET CONTEXT
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-1">
                      {isMultiOutcome && (
                        <div className="mb-2 pb-2 border-b border-blue-500/20">
                          <span className="font-bold text-blue-400">
                            Multi-outcome market:
                          </span>{" "}
                          This is 1 of {totalOutcomes} possible outcomes.
                          {evenOddsProbability && (
                            <span>
                              {" "}
                              Even odds would be ~{evenOddsProbability}%, so{" "}
                              {probability}% means this outcome is{" "}
                              {parseFloat(probability) >
                              parseFloat(evenOddsProbability)
                                ? "heavily favored"
                                : "less likely"}
                              .
                            </span>
                          )}
                        </div>
                      )}
                      {isBinaryMarket && (
                        <div className="mb-2 pb-2 border-b border-blue-500/20">
                          <span className="font-bold text-blue-400">
                            Binary market:
                          </span>{" "}
                          This is 1 of 2 possible outcomes (Yes/No).
                        </div>
                      )}
                      <div>
                        • Outcome traded:{" "}
                        <span className="text-foreground font-bold">
                          {trade.outcome || "Unknown"}
                        </span>
                      </div>
                      <div>
                        • {isBuy ? "Buyer" : "Seller"} believes {probability}%
                        chance
                      </div>
                      <div>
                        • If wins: ${potentialPayout.toFixed(2)} payout (
                        {sharesAmount} shares × $1.00)
                      </div>
                      <div>• If loses: ${costBasis.toFixed(2)} total loss</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Understanding This Trade */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-mono font-bold mb-2 text-yellow-500">
                      UNDERSTANDING THIS TRADE
                    </div>
                    <div className="text-xs text-muted-foreground font-mono space-y-2">
                      <div>
                        <span className="font-bold">What the price means:</span>{" "}
                        ${formatPrice(trade.price)} per share = {probability}%
                        implied probability.
                        {isMultiOutcome && evenOddsProbability && (
                          <span>
                            {" "}
                            (Even odds across {totalOutcomes} outcomes would be
                            ~{evenOddsProbability}%)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold">Profit calculation:</span>{" "}
                        Cost ${costBasis.toFixed(2)} → Potential payout $
                        {potentialPayout.toFixed(2)} = ${potentialProfit} profit
                        if correct
                      </div>
                      <div>
                        <span className="font-bold">How it works:</span> Each
                        share pays $1.00 if this outcome wins, $0.00 if it
                        loses. The {isBuy ? "buyer paid" : "seller received"} $
                        {formatPrice(trade.price)} per share.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses - Side by Side */}
            {isFilledTrade ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Maker Address */}
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase">
                      <User className="w-3 h-3" />
                      Order Creator ({makerLabel})
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(trade.maker, "maker")}
                        className="px-2 py-1 text-xs border border-border hover:bg-secondary rounded font-mono transition-colors"
                      >
                        {copiedField === "maker" ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => openInExplorer(trade.maker)}
                        className="px-2 py-1 text-xs border border-border hover:bg-secondary rounded font-mono transition-colors"
                      >
                        Explorer ↗
                      </button>
                    </div>
                  </div>
                  {isNullAddress(trade.maker) ? (
                    <div className="space-y-2">
                      <div className="font-mono text-sm text-muted-foreground">
                        0x0000000000000000000000000000000000000000
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-500 font-mono">
                        <AlertCircle className="w-3 h-3" />
                        System/Protocol address - May be an automated market
                        maker
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-sm break-all">
                      {trade.maker}
                    </div>
                  )}
                </div>

                {/* Taker Address */}
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase">
                      <User className="w-3 h-3" />
                      Order Taker ({takerLabel})
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(trade.taker, "taker")}
                        className="px-2 py-1 text-xs border border-border hover:bg-secondary rounded font-mono transition-colors"
                      >
                        {copiedField === "taker" ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => openInExplorer(trade.taker)}
                        className="px-2 py-1 text-xs border border-border hover:bg-secondary rounded font-mono transition-colors"
                      >
                        Explorer ↗
                      </button>
                    </div>
                  </div>
                  {isNullAddress(trade.taker) ? (
                    <div className="space-y-2">
                      <div className="font-mono text-sm text-muted-foreground">
                        0x0000000000000000000000000000000000000000
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-500 font-mono">
                        <AlertCircle className="w-3 h-3" />
                        System/Protocol address - May be an automated market
                        maker
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-sm break-all">
                      {trade.taker}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Open Order - Hidden Maker */}
                <div className="bg-secondary/30 border border-dashed border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-3">
                    <User className="w-3 h-3" />
                    Order Creator ({makerLabel})
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground italic font-mono">
                    <AlertCircle className="w-4 h-4" />
                    Hidden until order is filled (privacy protection)
                  </div>
                </div>

                {/* Potential Taker */}
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-3">
                    <User className="w-3 h-3" />
                    Order Taker ({takerLabel}) - You
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Connect wallet to see your address
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details - Compact */}
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase mb-4">
                <Hash className="w-3 h-3" />
                Technical Details
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">Trade ID</span>
                  <div className="flex items-center gap-2">
                    <span>{formatAddress(trade.tradeId)}</span>
                    <button
                      onClick={() => copyToClipboard(trade.tradeId, "tradeId")}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copiedField === "tradeId" ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">Token ID</span>
                  <div className="flex items-center gap-2">
                    <span>{formatAddress(trade.asset)}</span>
                    <button
                      onClick={() => copyToClipboard(trade.asset, "asset")}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copiedField === "asset" ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">Condition ID</span>
                  <div className="flex items-center gap-2">
                    <span>{formatAddress(trade.market)}</span>
                    <button
                      onClick={() => copyToClipboard(trade.market, "market")}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copiedField === "market" ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">Created</span>
                  <span>{relativeTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-muted-foreground">Expiration</span>
                  <span>Never</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!isFilledTrade && (
          <div className="p-6 pt-4 border-t border-border flex gap-3 flex-shrink-0">
            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-mono font-bold">
              Take Order (${formatPrice(trade.price)})
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-mono"
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
