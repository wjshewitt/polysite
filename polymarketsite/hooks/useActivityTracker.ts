"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";

interface ActivityMetrics {
  tradesPerMinute: number;
  totalTrades: number;
  isCalibrated: boolean;
  calibrationProgress: number; // 0-1
  startTime: number;
  lastUpdateTime: number;
  elapsedSeconds: number;
  lastTradeTime: number;
}

const CALIBRATION_DURATION = 30000; // 30 seconds in milliseconds
const UPDATE_INTERVAL = 1000; // Update metrics every second

/**
 * Hook to track local activity metrics (trades per minute)
 * Calibrates over 30 seconds before showing accurate data
 */
export function useActivityTracker() {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    tradesPerMinute: 0,
    totalTrades: 0,
    isCalibrated: false,
    calibrationProgress: 0,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    elapsedSeconds: 0,
    lastTradeTime: Date.now(),
  });

  const trades = usePolymarketStore((state) => state.trades);

  // Track unique trade IDs to count actual trades (not array length)
  const seenTradeIdsRef = useRef(new Set<string>());
  const startTimeRef = useRef(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTradeTimeRef = useRef(Date.now());

  // Calculate metrics
  const calculateMetrics = useCallback(() => {
    const now = Date.now();
    const elapsedTime = now - startTimeRef.current;
    const elapsedMinutes = elapsedTime / 60000;

    // Calculate calibration progress
    const calibrationProgress = Math.min(1, elapsedTime / CALIBRATION_DURATION);
    const isCalibrated = elapsedTime >= CALIBRATION_DURATION;

    // Use the count of unique trade IDs seen
    const totalUniqueTrades = seenTradeIdsRef.current.size;

    // Calculate trades per minute based on actual elapsed time
    const tradesPerMinute =
      elapsedMinutes > 0 ? totalUniqueTrades / elapsedMinutes : 0;

    setMetrics({
      tradesPerMinute: Math.max(0, tradesPerMinute),
      totalTrades: totalUniqueTrades,
      isCalibrated,
      calibrationProgress,
      startTime: startTimeRef.current,
      lastUpdateTime: now,
      elapsedSeconds: Math.floor(elapsedTime / 1000),
      lastTradeTime: lastTradeTimeRef.current,
    });
  }, []);

  // Initialize and start tracking
  useEffect(() => {
    const now = Date.now();
    startTimeRef.current = now;
    lastTradeTimeRef.current = now;
    seenTradeIdsRef.current = new Set();

    // Set initial metrics
    setMetrics({
      tradesPerMinute: 0,
      totalTrades: 0,
      isCalibrated: false,
      calibrationProgress: 0,
      startTime: now,
      lastUpdateTime: now,
      elapsedSeconds: 0,
      lastTradeTime: now,
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
  }, []); // Only run once on mount

  // Track new trades by their IDs
  useEffect(() => {
    const now = Date.now();
    let newTradesAdded = false;

    // Add any new trade IDs to our set
    for (const trade of trades) {
      if (!seenTradeIdsRef.current.has(trade.id)) {
        seenTradeIdsRef.current.add(trade.id);
        newTradesAdded = true;
      }
    }

    // Update last trade time if we saw new trades
    if (newTradesAdded) {
      lastTradeTimeRef.current = now;
      calculateMetrics();
    }
  }, [trades, calculateMetrics]);

  // Reset function (useful if user wants to recalibrate)
  const reset = useCallback(() => {
    const now = Date.now();
    seenTradeIdsRef.current = new Set();
    startTimeRef.current = now;
    lastTradeTimeRef.current = now;

    setMetrics({
      tradesPerMinute: 0,
      totalTrades: 0,
      isCalibrated: false,
      calibrationProgress: 0,
      startTime: now,
      lastUpdateTime: now,
      elapsedSeconds: 0,
      lastTradeTime: now,
    });
  }, [trades.length]);

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
 * Format calibration progress as percentage
 */
export function formatCalibrationProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}
