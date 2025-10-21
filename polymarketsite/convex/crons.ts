import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled Jobs for Activity Monitoring & Data Cleanup
 *
 * These cron jobs run automatically to maintain the system:
 * - Recalculate trending markets every 15 minutes
 * - Clean up expired data daily
 * - Update baselines daily
 */

const crons = cronJobs();

// ============================================================================
// TRENDING MARKET RECALCULATION
// ============================================================================

/**
 * Recalculate trending markets every 15 minutes
 * This keeps the trending section fresh and responsive
 */
crons.interval(
  "recalculate-trending",
  { minutes: 15 },
  internal.trending.recalculateTrending
);

// ============================================================================
// DATA CLEANUP JOBS (Daily at specific UTC times)
// ============================================================================

/**
 * Clean up expired activity snapshots
 * Runs daily at 00:00 UTC
 * Removes 5min snapshots >24h old, 1hour >7d old, 1day >30d old
 */
crons.daily(
  "cleanup-expired-snapshots",
  { hourUTC: 0, minuteUTC: 0 },
  internal.cleanup.deleteExpiredSnapshots
);

/**
 * Clean up stale trending markets
 * Runs daily at 01:00 UTC
 * Removes markets that stopped trending >24h ago
 */
crons.daily(
  "cleanup-stale-markets",
  { hourUTC: 1, minuteUTC: 0 },
  internal.cleanup.deleteStaleMarkets
);

/**
 * Clean up expired market baselines
 * Runs daily at 01:30 UTC
 * Removes baselines that need recalculation
 */
crons.daily(
  "cleanup-expired-baselines",
  { hourUTC: 1, minuteUTC: 30 },
  internal.cleanup.deleteExpiredBaselines
);

/**
 * Clean up old crypto prices
 * Runs daily at 02:00 UTC
 * Keeps only the latest price for each symbol and removes >7d old data
 */
crons.daily(
  "cleanup-old-crypto-prices",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cleanup.deleteOldCryptoPrices
);

/**
 * Generate storage statistics
 * Runs daily at 03:00 UTC
 * Monitors storage usage to ensure we stay within free tier limits
 */
crons.daily(
  "generate-storage-stats",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.getStorageStats
);

// ============================================================================
// BASELINE UPDATES
// ============================================================================

/**
 * Update market baselines for all trending markets
 * Runs every 6 hours to keep rolling averages fresh
 * This is more frequent than daily to catch surges quickly
 */
crons.interval(
  "update-market-baselines",
  { hours: 6 },
  internal.trending.updateBaselines,
  { marketIds: [] } // Empty array means update all trending markets
);

export default crons;
