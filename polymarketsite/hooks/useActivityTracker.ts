"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";

interface ActivityMetrics {
  tradesPerMinute: number;
  totalTrades: number;
  eventsPerMinute: number; // Unique markets per minute
  totalEvents: number; // Total unique markets in window
  isCalibrated: boolean;
  calibrationProgress: number; // 0-1
  startTime: number;
  lastUpdateTime: number;
  elapsedSeconds: number;
  lastTradeTime: number;
  lastEventTime: number;
}

interface TradeWindow {
  tradeId: string;
  marketId: string;
  timestamp: number;
}

const CALIBRATION_DURATION = 30000; // 30 seconds in milliseconds
const UPDATE_INTERVAL = 1000; // Update metrics every second
const SLIDING_WINDOW_DURATION = 30000; // 30-second sliding window for market diversity

/**
 * Hook to track local activity metrics
 * - Trades per minute: Rate of trade executions
 * - Events per minute: Number of unique active markets (market diversity)
 * Calibrates over 30 seconds before showing accurate data
 */
export function useActivityTracker() {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    tradesPerMinute: 0,
    totalTrades: 0,
    eventsPerMinute: 0,
    totalEvents: 0,
    isCalibrated: false,
    calibrationProgress: 0,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    elapsedSeconds: 0,
    lastTradeTime: Date.now(),
    lastEventTime: Date.now(),
  });

  const trades = usePolymarketStore((state) => state.trades);

  // Track unique trade IDs to count actual trades (not array length)
  const seenTradeIdsRef = useRef(new Set<string>());
  // Sliding window of trades with their markets and timestamps
  const tradeWindowRef = useRef<TradeWindow[]>([]);
  const startTimeRef = useRef(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTradeTimeRef = useRef(Date.now());
  const lastEventTimeRef = useRef(Date.now());

  // Calculate metrics
  const calculateMetrics = useCallback(() => {
    const now = Date.now();
    const elapsedTime = now - startTimeRef.current;
    const elapsedMinutes = elapsedTime / 60000;

    // Calculate calibration progress
    const calibrationProgress = Math.min(1, elapsedTime / CALIBRATION_DURATION);
    const isCalibrated = elapsedTime >= CALIBRATION_DURATION;

    // Clean up old trades outside the sliding window
    const windowStart = now - SLIDING_WINDOW_DURATION;
    tradeWindowRef.current = tradeWindowRef.current.filter(
      (trade) => trade.timestamp >= windowStart,
    );

    // Count unique markets in the sliding window
    const uniqueMarkets = new Set(
      tradeWindowRef.current.map((trade) => trade.marketId),
    );
    const totalUniqueMarkets = uniqueMarkets.size;

    // Use the count of unique trade IDs seen (cumulative)
    const totalUniqueTrades = seenTradeIdsRef.current.size;

    // Calculate trades per minute based on actual elapsed time
    const tradesPerMinute =
      elapsedMinutes > 0 ? totalUniqueTrades / elapsedMinutes : 0;

    // Calculate unique markets per minute from the 30-second window
    // Scale from 30 seconds to per minute (multiply by 2)
    const eventsPerMinute = totalUniqueMarkets * 2;

    setMetrics({
      tradesPerMinute: Math.max(0, tradesPerMinute),
      totalTrades: totalUniqueTrades,
      eventsPerMinute: Math.max(0, eventsPerMinute),
      totalEvents: totalUniqueMarkets,
      isCalibrated,
      calibrationProgress,
      startTime: startTimeRef.current,
      lastUpdateTime: now,
      elapsedSeconds: Math.floor(elapsedTime / 1000),
      lastTradeTime: lastTradeTimeRef.current,
      lastEventTime: lastEventTimeRef.current,
    });
  }, []);

  // Initialize and start tracking
  useEffect(() => {
    const now = Date.now();
    startTimeRef.current = now;
    lastTradeTimeRef.current = now;
    seenTradeIdsRef.current = new Set();
    tradeWindowRef.current = [];

    // Set initial metrics
    setMetrics({
      tradesPerMinute: 0,
      totalTrades: 0,
      eventsPerMinute: 0,
      totalEvents: 0,
      isCalibrated: false,
      calibrationProgress: 0,
      startTime: now,
      lastUpdateTime: now,
      elapsedSeconds: 0,
      lastTradeTime: now,
      lastEventTime: now,
    });

    // Update metrics every second
    updateIntervalRef.current = setInterval(() => {
      calculateMetrics();
    }, UPDATE_INTERVAL);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - calculateMetrics is stable via useCallback

  // Track new trades by their IDs and add to sliding window
  useEffect(() => {
    const now = Date.now();
    let newTradesAdded = false;

    // Add any new trade IDs to our set and to the sliding window
    for (const trade of trades) {
      if (!seenTradeIdsRef.current.has(trade.id)) {
        seenTradeIdsRef.current.add(trade.id);

        // Add to sliding window with market information
        const marketId = trade.eventSlug || trade.market || trade.marketTitle;
        if (marketId) {
          tradeWindowRef.current.push({
            tradeId: trade.id,
            marketId: marketId,
            timestamp: trade.timestamp || now,
          });
        }

        newTradesAdded = true;
      }
    }

    // Update last trade time if we saw new trades
    if (newTradesAdded) {
      lastTradeTimeRef.current = now;
      lastEventTimeRef.current = now;
      calculateMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades]); // calculateMetrics is stable via useCallback

  // Reset function (useful if user wants to recalibrate)
  const reset = useCallback(() => {
    const now = Date.now();
    seenTradeIdsRef.current = new Set();
    tradeWindowRef.current = [];
    startTimeRef.current = now;
    lastTradeTimeRef.current = now;
    lastEventTimeRef.current = now;

    setMetrics({
      tradesPerMinute: 0,
      totalTrades: 0,
      eventsPerMinute: 0,
      totalEvents: 0,
      isCalibrated: false,
      calibrationProgress: 0,
      startTime: now,
      lastUpdateTime: now,
      elapsedSeconds: 0,
      lastTradeTime: now,
      lastEventTime: now,
    });
  }, []);

  return {
    ...metrics,
    reset,
  };
}

/**
 * Format trades per minute for display
 */
export function formatTradesPerMinute(tpm: number): string {
  if (tpm === 0) return "0";
  if (tpm < 1) return tpm.toFixed(1);
  return Math.round(tpm).toString();
}

/**
 * Format events per minute for display (unique active markets)
 */
export function formatEventsPerMinute(epm: number): string {
  if (epm === 0) return "0";
  if (epm < 1) return epm.toFixed(1);
  return Math.round(epm).toString();
}

/**
 * Format calibration progress as percentage
 */
export function formatCalibrationProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}
