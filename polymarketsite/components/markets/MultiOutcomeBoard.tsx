"use client";

import React, { useMemo, useCallback, useRef, useState } from "react";
import type {
  EventOutcomeSummary,
  NormalizedMarket,
  EventOutcomeRow,
  OutcomeTimeframe,
} from "@/types/markets";
import { ArrowUpDown, TrendingUp, TrendingDown, Info } from "lucide-react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { clobService } from "@/services/clob";
import type { AggOrderbook } from "@/types/polymarket";

interface MultiOutcomeBoardProps {
  summary: EventOutcomeSummary;
  markets: NormalizedMarket[];
  onSelectOutcome?: (marketId: string) => void;
  loading?: boolean;
}

const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const formatCents = (value?: number) =>
  value !== undefined ? `${(value * 100).toFixed(1)}¢` : "—";
const formatDollars = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};
const clampProbabilityValue = (value: number) =>
  Math.min(Math.max(value, 0), 1);

const timeframeOptions: OutcomeTimeframe[] = [
  "1H",
  "6H",
  "1D",
  "1W",
  "1M",
  "ALL",
];

const timeframeDurations: Record<OutcomeTimeframe, number | null> = {
  "1H": 60 * 60 * 1000,
  "6H": 6 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  ALL: null,
};

type HistoryPoint = { timestamp: number; probability: number };

const computeChange = (
  row: EventOutcomeRow,
  timeframe: OutcomeTimeframe,
  histories: Map<string, HistoryPoint[]>,
): { abs?: number; pct?: number } => {
  const history = histories.get(row.marketId);
  if (!history || history.length < 2) {
    return {
      abs: row.changeAbs,
      pct: row.changePct,
    };
  }

  const latest = history[history.length - 1];
  const windowMs = timeframeDurations[timeframe];
  let baseline = history[0];

  if (windowMs !== null) {
    const cutoff = latest.timestamp - windowMs;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const point = history[i];
      baseline = point;
      if (point.timestamp <= cutoff) {
        break;
      }
    }
  }

  if (!baseline) {
    baseline = history[0];
  }

  const abs = latest.probability - baseline.probability;
  const pct =
    baseline.probability !== 0
      ? (abs / baseline.probability) * 100
      : undefined;

  return {
    abs,
    pct,
  };
};

export function MultiOutcomeBoard({
  summary,
  markets,
  onSelectOutcome,
  loading = false,
}: MultiOutcomeBoardProps) {
  const orderbooks = usePolymarketStore((s) => s.orderbooks);
  const updateOrderbook = usePolymarketStore((s) => s.updateOrderbook);
  const clobAuth = usePolymarketStore((s) => s.clobAuth);
  const marketHistories = usePolymarketStore((s) => s.marketHistories);
  const selectedTimeframe = usePolymarketStore((s) => s.outcomeTimeframe);
  const setOutcomeTimeframe = usePolymarketStore((s) => s.setOutcomeTimeframe);

  const rows = useMemo<EventOutcomeRow[]>(() => {
    // Never mutate props; always copy before sorting/filtering
    return [...(summary?.rankedOutcomes ?? [])];
  }, [summary?.rankedOutcomes]);

  const maxProb = useMemo(
    () => rows.reduce((m, r) => (r.probability > m ? r.probability : m), 0),
    [rows],
  );

  const totals = useMemo(() => {
    const totalVolume = markets.reduce((s, m) => s + (m.volume ?? 0), 0);
    const totalLiquidity = markets.reduce((s, m) => s + (m.liquidity ?? 0), 0);
    return { totalVolume, totalLiquidity };
  }, [markets]);

  const handleSelect = useCallback(
    (marketId: string) => {
      if (onSelectOutcome) onSelectOutcome(marketId);
    },
    [onSelectOutcome],
  );

  // Build a quick lookup for token-level orderbooks (asset === tokenId)
  const obByAsset = useMemo(() => {
    const map = new Map<string, AggOrderbook>();
    orderbooks.forEach((ob) => {
      if (ob.asset) map.set(ob.asset, ob);
    });
    return map;
  }, [orderbooks]);

  const requestedAssetsRef = useRef<Set<string>>(new Set());

  const ensureOrderbook = useCallback(
    async (tokenId?: string, fallbackMarketId?: string) => {
      if (!tokenId) return;
      if (obByAsset.has(tokenId)) return;
      if (requestedAssetsRef.current.has(tokenId)) return;
      requestedAssetsRef.current.add(tokenId);
      // Initialize read-only client if needed and fetch once
      await clobService.initializeReadOnly();
      const depth = await clobService.getOrderbook(tokenId);
      if (depth) {
        const agg: AggOrderbook = {
          market: depth.market || fallbackMarketId || "",
          asset: depth.asset,
          timestamp: depth.timestamp,
          bids: depth.bids,
          asks: depth.asks,
        };
        updateOrderbook(agg);
      }
    },
    [obByAsset, updateOrderbook],
  );

  const [visibleCount, setVisibleCount] = useState(10);
  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = rows.length > visibleRows.length;

  const tryQuickTrade = useCallback(
    async (
      tokenId: string | undefined,
      side: "BUY" | "SELL",
      price?: number,
    ) => {
      if (!tokenId || price === undefined) return;
      if (!clobAuth.isAuthenticated) {
        console.warn("QuickTrade disabled: not authenticated");
        return;
      }
      const res = await clobService.placeOrder({
        tokenId,
        side,
        price: price.toFixed(3),
        size: "1",
      });
      if (!res.success) {
        console.error("Place order failed:", res.error);
      } else {
        console.log("Order placed:", res.orderId);
      }
    },
    [clobAuth.isAuthenticated],
  );

  return (
    <div className="space-y-3">
      {/* Overview */}
      <div className="border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                Outcomes: <span className="text-foreground font-semibold">{summary.totalOutcomes}</span>
              </span>
            </span>
            <span>Event Vol: {formatDollars(totals.totalVolume)}</span>
            <span>Event Liq: {formatDollars(totals.totalLiquidity)}</span>
            {summary.topOutcome && (
              <span>
                Top: <span className="font-bold text-buy">{summary.topOutcome.name}</span> ({formatPct(summary.topOutcome.probability)})
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {timeframeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setOutcomeTimeframe(option)}
                className={`px-2 py-1 text-[10px] font-mono border ${
                  selectedTimeframe === option
                    ? "border-buy text-buy bg-buy/10"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {summary.infoNote && (
          <div className="mt-2 flex items-start gap-2 text-[11px] font-mono text-muted-foreground">
            <Info className="w-3.5 h-3.5 mt-0.5" />
            <span>{summary.infoNote}</span>
          </div>
        )}
      </div>

      {/* Ranked rows (minimal first cut) */}
      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-10 bg-muted animate-pulse border border-border"
            />
          ))
        ) : visibleRows.length ? (
          visibleRows.map((row) => {
            const width = maxProb ? (row.probability / maxProb) * 100 : 0;
            const tierColor =
              row.tier === "favorite"
                ? "bg-buy/20"
                : row.tier === "contender"
                  ? "bg-neutral/20"
                  : "bg-muted";
            const textColor =
              row.tier === "favorite"
                ? "text-buy"
                : row.tier === "contender"
                  ? "text-neutral"
                  : "text-foreground";

            const ob = row.yesTokenId ? obByAsset.get(row.yesTokenId) : undefined;
            const bestYesBid = row.bestYesBid ?? (ob?.bids?.[0]?.price ? Number(ob.bids[0].price) : undefined);
            const bestYesAsk = row.bestYesAsk ?? (ob?.asks?.[0]?.price ? Number(ob.asks[0].price) : undefined);
            const bestNoAsk =
              row.bestNoAsk ??
              (bestYesBid !== undefined
                ? clampProbabilityValue(1 - bestYesBid)
                : undefined);
            const bestNoBid =
              row.bestNoBid ??
              (bestYesAsk !== undefined
                ? clampProbabilityValue(1 - bestYesAsk)
                : undefined);
            const canBuy = clobAuth.isAuthenticated && bestYesAsk !== undefined && row.yesTokenId;
            const canSell = clobAuth.isAuthenticated && bestYesBid !== undefined && row.yesTokenId;
            const change = computeChange(row, selectedTimeframe, marketHistories);
            const changePct = change.pct;

            return (
              <div
                key={`${row.marketId}-${row.rank}`}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(row.marketId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(row.marketId);
                  }
                }}
                onMouseEnter={() => ensureOrderbook(row.yesTokenId, row.marketId)}
                className="relative w-full border border-border bg-card px-3 py-2 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div
                  className={`absolute inset-y-0 left-0 ${tierColor}`}
                  style={{ width: `${width}%` }}
                />
                <div className="relative z-10 flex flex-col gap-1 text-[11px] sm:text-xs font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground">#{row.rank}</span>
                      <span className={`font-semibold truncate ${textColor}`}>{row.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {changePct !== undefined && Math.abs(changePct) >= 0.1 && (
                        <span
                          className={`flex items-center gap-1 text-[10px] ${
                            changePct >= 0 ? "text-buy" : "text-sell"
                          }`}
                        >
                          {changePct >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {`${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`}
                        </span>
                      )}
                      <span className={`font-bold ${textColor}`}>{formatPct(row.probability)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{row.oddsText}</span>
                    {row.volume24h !== undefined && (
                      <span>Vol 24h {formatDollars(row.volume24h)}</span>
                    )}
                    {row.liquidity !== undefined && (
                      <span>Liq {formatDollars(row.liquidity)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Buy Yes {formatCents(bestYesAsk)}</span>
                    <span>Buy No {formatCents(bestNoAsk)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={(e) => {
                        e.stopPropagation();
                        tryQuickTrade(row.yesTokenId, "BUY", bestYesAsk);
                      }}
                      aria-label={`Buy one share of ${row.name}`}
                      title={
                        clobAuth.isAuthenticated
                          ? bestYesAsk !== undefined
                            ? `Buy 1 @ ${formatCents(bestYesAsk)}`
                            : "No ask"
                          : "Sign in to trade"
                      }
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        canBuy ? "border-buy text-buy hover:bg-buy/10" : "border-border text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      BUY 1
                    </button>
                    <button
                      type="button"
                      disabled={!canSell}
                      onClick={(e) => {
                        e.stopPropagation();
                        tryQuickTrade(row.yesTokenId, "SELL", bestYesBid);
                      }}
                      aria-label={`Sell one share of ${row.name}`}
                      title={
                        clobAuth.isAuthenticated
                          ? bestYesBid !== undefined
                            ? `Sell 1 @ ${formatCents(bestYesBid)}`
                            : "No bid"
                          : "Sign in to trade"
                      }
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        canSell ? "border-sell text-sell hover:bg-sell/10" : "border-border text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      SELL 1
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      Sell Yes {formatCents(bestYesBid)} • Sell No {formatCents(bestNoBid)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs font-mono text-muted-foreground border border-border bg-card px-3 py-4 text-center">
            No outcomes available
          </div>
        )}
      </div>
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="text-xs font-mono px-3 py-1 border border-border hover:bg-muted transition-colors"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
