/**
 * Activity Tracking & Trending Configuration
 *
 * Centralized configuration for all activity monitoring, trending calculations,
 * and busyness detection. All values are easily adjustable for tuning.
 */

// ============================================================================
// ACTIVITY SCORE WEIGHTS
// ============================================================================

/**
 * Weights for calculating market activity score
 * Total should sum to 1.0 (100%)
 */
export const ACTIVITY_SCORE_WEIGHTS = {
  volume: 0.35,      // 35% - Primary signal, dollar value matters
  trades: 0.30,      // 30% - Participation breadth, number of trades
  orderbook: 0.20,   // 20% - Interest proxy, orderbook update frequency
  liquidity: 0.15,   // 15% - Market depth/quality indicator
} as const;

/**
 * Scaling factors for normalizing raw values into score components
 */
export const ACTIVITY_SCORE_SCALES = {
  volumeScale: 1000,      // Divide volume by this (e.g., $50k volume = 50 points)
  liquidityScale: 10000,  // Divide liquidity by this (e.g., $100k liquidity = 10 points)
} as const;

// ============================================================================
// BUSYNESS THRESHOLDS
// ============================================================================

/**
 * Thresholds for determining busyness levels
 * Expressed as percentages (1.0 = 100% = normal activity)
 */
export const BUSYNESS_THRESHOLDS = {
  muchBusier: 1.50,    // 150%+ = "Much busier than usual 🔥"
  busier: 1.10,        // 110-150% = "Busier than usual ⬆️"
  normal: 0.90,        // 90-110% = "Normal activity ⚡"
  // Below 90% = "Quieter than usual ⬇️"
} as const;

/**
 * Labels for busyness levels
 */
export const BUSYNESS_LABELS = {
  muchBusier: "Much busier than usual",
  busier: "Busier than usual",
  normal: "Normal activity",
  quieter: "Quieter than usual",
} as const;

/**
 * Emojis for busyness levels
 */
export const BUSYNESS_EMOJIS = {
  muchBusier: "🔥",
  busier: "⬆️",
  normal: "⚡",
  quieter: "⬇️",
} as const;

// ============================================================================
// TRENDING THRESHOLDS
// ============================================================================

/**
 * Criteria for determining trending markets
 */
export const TRENDING_THRESHOLDS = {
  // Percentile-based (dynamic)
  percentile: 0.10,           // Top 10% by activity score

  // Absolute minimums (fallback if not enough markets)
  minLiquidity: 10000,        // $10,000 minimum liquidity
  minVolume24h: 5000,         // $5,000 minimum 24h volume
  minTrades24h: 50,           // 50 trades minimum in 24h

  // UI display limits
  maxTrendingDisplay: 20,     // Show top 20 in UI
  maxTrendingStorage: 50,     // Store up to top 10% or 50 markets, whichever is greater
} as const;

/**
 * Surge detection threshold for immediate recalculation
 */
export const SURGE_THRESHOLD = 2.0; // 200% increase in activity

// ============================================================================
// DATA RETENTION PERIODS
// ============================================================================

/**
 * Retention periods for different snapshot granularities (in milliseconds)
 */
export const RETENTION_PERIODS = {
  fiveMin: 24 * 60 * 60 * 1000,      // 24 hours
  oneHour: 7 * 24 * 60 * 60 * 1000,  // 7 days
  oneDay: 30 * 24 * 60 * 60 * 1000,  // 30 days
} as const;

/**
 * How long to keep trending market data after it stops trending
 */
export const TRENDING_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * How long to keep crypto prices
 */
export const CRYPTO_PRICE_RETENTION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * How long to keep market baselines before recalculation
 */
export const BASELINE_RECALC_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// UPDATE FREQUENCIES
// ============================================================================

/**
 * How often to flush activity data from frontend to backend (milliseconds)
 */
export const ACTIVITY_FLUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * How often to recalculate trending markets (milliseconds)
 */
export const TRENDING_RECALC_INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * How often to create activity snapshots (milliseconds)
 */
export const SNAPSHOT_INTERVALS = {
  fiveMin: 5 * 60 * 1000,      // 5 minutes
  oneHour: 60 * 60 * 1000,     // 1 hour
  oneDay: 24 * 60 * 60 * 1000, // 1 day
} as const;

// ============================================================================
// BASELINE CALCULATION WINDOWS
// ============================================================================

/**
 * Time windows for calculating rolling averages (milliseconds)
 */
export const BASELINE_WINDOWS = {
  oneHour: 60 * 60 * 1000,           // 1 hour
  twentyFourHour: 24 * 60 * 60 * 1000, // 24 hours
  sevenDay: 7 * 24 * 60 * 60 * 1000,   // 7 days
} as const;

// ============================================================================
// ACTIVITY EVENT TYPES
// ============================================================================

/**
 * Types of events tracked for activity monitoring
 */
export const EVENT_TYPES = {
  ORDERBOOK_UPDATE: "orderbook_update",
  TRADE: "trade",
  ORDER_PLACED: "order_placed",
  ORDER_CANCELLED: "order_cancelled",
  LIQUIDITY_ADD: "liquidity_add",
  LIQUIDITY_REMOVE: "liquidity_remove",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate activity score for a market
 */
export function calculateActivityScore(params: {
  volume24h: number;
  tradeCount24h: number;
  orderbookRequests1h: number;
  liquidity: number;
}): number {
  const { volume24h, tradeCount24h, orderbookRequests1h, liquidity } = params;

  const volumeScore = (volume24h / ACTIVITY_SCORE_SCALES.volumeScale) * ACTIVITY_SCORE_WEIGHTS.volume;
  const tradeScore = tradeCount24h * ACTIVITY_SCORE_WEIGHTS.trades;
  const orderbookScore = orderbookRequests1h * ACTIVITY_SCORE_WEIGHTS.orderbook;
  const liquidityScore = (liquidity / ACTIVITY_SCORE_SCALES.liquidityScale) * ACTIVITY_SCORE_WEIGHTS.liquidity;

  return volumeScore + tradeScore + orderbookScore + liquidityScore;
}

/**
 * Determine busyness level from ratio
 */
export function getBusynessLevel(ratio: number): {
  level: keyof typeof BUSYNESS_LABELS;
  label: string;
  emoji: string;
} {
  if (ratio >= BUSYNESS_THRESHOLDS.muchBusier) {
    return {
      level: "muchBusier",
      label: BUSYNESS_LABELS.muchBusier,
      emoji: BUSYNESS_EMOJIS.muchBusier,
    };
  } else if (ratio >= BUSYNESS_THRESHOLDS.busier) {
    return {
      level: "busier",
      label: BUSYNESS_LABELS.busier,
      emoji: BUSYNESS_EMOJIS.busier,
    };
  } else if (ratio >= BUSYNESS_THRESHOLDS.normal) {
    return {
      level: "normal",
      label: BUSYNESS_LABELS.normal,
      emoji: BUSYNESS_EMOJIS.normal,
    };
  } else {
    return {
      level: "quieter",
      label: BUSYNESS_LABELS.quieter,
      emoji: BUSYNESS_EMOJIS.quieter,
    };
  }
}

/**
 * Check if a market meets trending criteria
 */
export function meetsTrendingCriteria(params: {
  liquidity: number;
  volume24h: number;
  tradeCount24h: number;
}): boolean {
  const { liquidity, volume24h, tradeCount24h } = params;

  return (
    liquidity >= TRENDING_THRESHOLDS.minLiquidity &&
    volume24h >= TRENDING_THRESHOLDS.minVolume24h &&
    tradeCount24h >= TRENDING_THRESHOLDS.minTrades24h
  );
}

/**
 * Calculate expiration timestamp based on retention period
 */
export function getExpirationTimestamp(granularity: "5min" | "1hour" | "1day"): number {
  const now = Date.now();

  switch (granularity) {
    case "5min":
      return now + RETENTION_PERIODS.fiveMin;
    case "1hour":
      return now + RETENTION_PERIODS.oneHour;
    case "1day":
      return now + RETENTION_PERIODS.oneDay;
  }
}

/**
 * Check if a surge has occurred (for immediate recalculation)
 */
export function isSurge(currentRate: number, previousRate: number): boolean {
  if (previousRate === 0) return false;
  const ratio = currentRate / previousRate;
  return ratio >= SURGE_THRESHOLD;
}
