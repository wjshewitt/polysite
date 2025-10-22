"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useActivityTracker,
  formatTradesPerMinute,
  formatEventsPerMinute,
  formatCalibrationProgress,
} from "@/hooks/useActivityTracker";

function formatRelativeTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

type BusynessLevel =
  | "very-low"
  | "low"
  | "normal"
  | "high"
  | "very-high"
  | "extreme";

interface BusynessThresholds {
  level: BusynessLevel;
  color: string;
  bgColor: string;
  label: string;
  minRatio: number;
}

const BUSYNESS_THRESHOLDS: BusynessThresholds[] = [
  {
    level: "very-low",
    color: "text-slate-500",
    bgColor: "bg-slate-500",
    label: "Very Quiet",
    minRatio: 0,
  },
  {
    level: "low",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    label: "Quiet",
    minRatio: 0.5,
  },
  {
    level: "normal",
    color: "text-green-500",
    bgColor: "bg-green-500",
    label: "Normal",
    minRatio: 0.8,
  },
  {
    level: "high",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    label: "Busy",
    minRatio: 1.5,
  },
  {
    level: "very-high",
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    label: "Very Busy",
    minRatio: 2.5,
  },
  {
    level: "extreme",
    color: "text-red-500",
    bgColor: "bg-red-500",
    label: "Extreme",
    minRatio: 4.0,
  },
];

function getBusynessLevel(ratio: number): BusynessThresholds {
  for (let i = BUSYNESS_THRESHOLDS.length - 1; i >= 0; i--) {
    if (ratio >= BUSYNESS_THRESHOLDS[i].minRatio) {
      return BUSYNESS_THRESHOLDS[i];
    }
  }
  return BUSYNESS_THRESHOLDS[0];
}

function formatRate(rate: number): string {
  if (rate === 0) return "0";
  if (rate < 1) return rate.toFixed(2);
  if (rate < 10) return rate.toFixed(1);
  return Math.round(rate).toString();
}

function formatPercentChange(ratio: number): string {
  const percent = (ratio - 1) * 100;
  if (percent > 0) {
    return `+${percent.toFixed(0)}%`;
  }
  return `${percent.toFixed(0)}%`;
}

export function GlobalBusynessIndicator() {
  const busyness = useQuery(api.activity.getGlobalBusyness);
  const {
    tradesPerMinute,
    totalTrades,
    eventsPerMinute,
    totalEvents,
    isCalibrated,
    calibrationProgress,
    elapsedSeconds,
    lastTradeTime,
    lastEventTime,
  } = useActivityTracker();

  // Force re-render every second for live updates
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!busyness) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-12 bg-border rounded-full animate-pulse" />
        <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
          LOADING...
        </span>
      </div>
    );
  }

  const vs24hLevel = getBusynessLevel(busyness.vs24h.ratio);
  const vs7dLevel = getBusynessLevel(busyness.vs7d.ratio);

  // Calculate seconds since last trade and event
  const now = Date.now();
  const secondsSinceLastTrade = Math.floor((now - lastTradeTime) / 1000);
  const secondsSinceLastEvent = Math.floor((now - lastEventTime) / 1000);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help transition-opacity hover:opacity-80">
            {/* Color bar indicator */}
            <div className="h-1.5 w-12 bg-border/30 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full ${vs24hLevel.bgColor} transition-all duration-500 shadow-sm`}
                style={{
                  width: `${Math.min(100, Math.max(10, busyness.vs24h.ratio * 50))}%`,
                }}
              />
            </div>
            {/* Text label */}
            <span
              className={`text-[10px] sm:text-[11px] font-mono font-semibold ${vs24hLevel.color} transition-colors`}
            >
              {vs24hLevel.label.toUpperCase()}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs p-3 border border-border bg-background/98 backdrop-blur-md shadow-xl"
          sideOffset={8}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-foreground border-b border-border pb-1.5 mb-2">
              <span>MARKET ACTIVITY</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-normal">
                  Live
                </span>
              </div>
            </div>

            {/* Local Trades Per Minute (Live) */}
            <div className="space-y-1 bg-secondary/30 rounded p-2 border-l-2 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                  Live Trades/Minute:
                </div>
                <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-mono font-bold text-foreground">
                  {isCalibrated ? (
                    <>
                      {formatTradesPerMinute(tradesPerMinute)}{" "}
                      <span className="text-muted-foreground text-xs">
                        trades/min
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Calibrating...{" "}
                      {formatCalibrationProgress(calibrationProgress)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Total trades: {totalTrades.toLocaleString()}</span>
                <span className="text-[9px]">
                  {secondsSinceLastTrade === 0
                    ? "just now"
                    : secondsSinceLastTrade < 60
                      ? `${secondsSinceLastTrade}s ago`
                      : `${Math.floor(secondsSinceLastTrade / 60)}m ago`}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Tracking for: {elapsedSeconds}s
              </div>
              {!isCalibrated && (
                <div className="mt-1">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${calibrationProgress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Local Events Per Minute (Live) */}
            <div className="space-y-1 bg-secondary/30 rounded p-2 border-l-2 border-green-500">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                  Active Markets/Min:
                </div>
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-mono font-bold text-foreground">
                  {isCalibrated ? (
                    <>
                      {formatEventsPerMinute(eventsPerMinute)}{" "}
                      <span className="text-muted-foreground text-xs">
                        markets
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Calibrating...{" "}
                      {formatCalibrationProgress(calibrationProgress)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Active markets: {totalEvents.toLocaleString()}</span>
                <span className="text-[9px]">
                  {secondsSinceLastEvent === 0
                    ? "just now"
                    : secondsSinceLastEvent < 60
                      ? `${secondsSinceLastEvent}s ago`
                      : `${Math.floor(secondsSinceLastEvent / 60)}m ago`}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Tracking for: {elapsedSeconds}s
              </div>
              {!isCalibrated && (
                <div className="mt-1">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${calibrationProgress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Activity */}
            <div className="space-y-1 bg-secondary/30 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                  Current Rate:
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                  updating live
                </div>
              </div>
              <div className="text-sm font-mono font-bold text-foreground">
                {formatRate(busyness.currentRate)}{" "}
                <span className="text-muted-foreground text-xs">
                  events/min
                </span>
              </div>
            </div>

            {/* vs 24h comparison */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                vs 24h Average:
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${vs24hLevel.bgColor} shadow-sm`}
                  />
                  <span
                    className={`text-xs font-mono font-bold ${vs24hLevel.color}`}
                  >
                    {vs24hLevel.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${vs24hLevel.color} px-1.5 py-0.5 rounded bg-secondary/50`}
                >
                  {formatPercentChange(busyness.vs24h.ratio)}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground pl-4">
                Baseline: {formatRate(busyness.vs24h.baseline)} events/min
              </div>
            </div>

            {/* vs 7d comparison */}
            <div className="space-y-1.5 pt-1.5 border-t border-border/50">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                vs 7-Day Average:
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${vs7dLevel.bgColor} shadow-sm`}
                  />
                  <span
                    className={`text-xs font-mono font-bold ${vs7dLevel.color}`}
                  >
                    {vs7dLevel.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${vs7dLevel.color} px-1.5 py-0.5 rounded bg-secondary/50`}
                >
                  {formatPercentChange(busyness.vs7d.ratio)}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground pl-4">
                Baseline: {formatRate(busyness.vs7d.baseline)} events/min
              </div>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-border/50 bg-secondary/20 -mx-3 -mb-3 px-3 pb-3 mt-3 rounded-b">
              <div className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wide pt-2">
                Activity Levels:
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {BUSYNESS_THRESHOLDS.slice(1).map((threshold) => (
                  <div
                    key={threshold.level}
                    className="flex items-center gap-1.5"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${threshold.bgColor} shadow-sm`}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {threshold.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
