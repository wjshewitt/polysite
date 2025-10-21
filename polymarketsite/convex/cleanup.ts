import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Cleanup Functions for Data Retention
 *
 * These functions run on a schedule to delete expired data and keep
 * storage within free tier limits (~1GB).
 */

/**
 * Delete expired activity snapshots
 * Runs daily to remove old 5min, 1hour, and 1day snapshots
 */
export const deleteExpiredSnapshots = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all expired snapshots
    const expiredSnapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    let deleted = 0;
    for (const snapshot of expiredSnapshots) {
      await ctx.db.delete(snapshot._id);
      deleted++;
    }

    console.log(`🗑️ Deleted ${deleted} expired activity snapshots`);

    return {
      deleted,
      timestamp: now,
    };
  },
});

/**
 * Delete stale trending markets
 * Removes markets that haven't been updated and have expired
 */
export const deleteStaleMarkets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired trending markets
    const staleMarkets = await ctx.db
      .query("trendingMarkets")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    let deleted = 0;
    for (const market of staleMarkets) {
      await ctx.db.delete(market._id);
      deleted++;

      // Also delete associated baseline
      const baseline = await ctx.db
        .query("marketBaselines")
        .withIndex("by_market_id", (q) => q.eq("marketId", market.marketId))
        .first();

      if (baseline) {
        await ctx.db.delete(baseline._id);
      }
    }

    console.log(`🗑️ Deleted ${deleted} stale trending markets`);

    return {
      deleted,
      timestamp: now,
    };
  },
});

/**
 * Delete expired market baselines
 * Removes baselines that need recalculation
 */
export const deleteExpiredBaselines = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired baselines
    const expiredBaselines = await ctx.db
      .query("marketBaselines")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    let deleted = 0;
    for (const baseline of expiredBaselines) {
      await ctx.db.delete(baseline._id);
      deleted++;
    }

    console.log(`🗑️ Deleted ${deleted} expired market baselines`);

    return {
      deleted,
      timestamp: now,
    };
  },
});

/**
 * Delete old crypto prices
 * Keeps only the last 7 days of price history
 */
export const deleteOldCryptoPrices = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get all crypto prices
    const allPrices = await ctx.db
      .query("cryptoPrices")
      .collect();

    // Group by symbol and keep only latest
    const latestBySymbol = new Map<string, any>();

    for (const price of allPrices) {
      const existing = latestBySymbol.get(price.symbol);
      if (!existing || price.lastUpdated > existing.lastUpdated) {
        latestBySymbol.set(price.symbol, price);
      }
    }

    // Delete old prices and duplicates
    let deleted = 0;
    for (const price of allPrices) {
      const isLatest = latestBySymbol.get(price.symbol)?._id === price._id;
      const isOld = price.lastUpdated < sevenDaysAgo;

      if (!isLatest || isOld) {
        await ctx.db.delete(price._id);
        deleted++;
      }
    }

    console.log(`🗑️ Deleted ${deleted} old crypto prices`);

    return {
      deleted,
      timestamp: now,
    };
  },
});

/**
 * Get storage statistics
 * Useful for monitoring storage usage
 */
export const getStorageStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Count documents in each table
    const activitySnapshots = await ctx.db.query("activitySnapshots").collect();
    const trendingMarkets = await ctx.db.query("trendingMarkets").collect();
    const marketBaselines = await ctx.db.query("marketBaselines").collect();
    const cryptoPrices = await ctx.db.query("cryptoPrices").collect();
    const users = await ctx.db.query("users").collect();

    // Calculate breakdown by granularity
    const fiveMinSnapshots = activitySnapshots.filter(s => s.granularity === "5min");
    const oneHourSnapshots = activitySnapshots.filter(s => s.granularity === "1hour");
    const oneDaySnapshots = activitySnapshots.filter(s => s.granularity === "1day");

    // Estimate storage (rough)
    // Average document sizes: snapshot ~2KB, market ~1KB, baseline ~0.5KB, crypto ~0.5KB, user ~0.5KB
    const estimatedStorage =
      (activitySnapshots.length * 2) +
      (trendingMarkets.length * 1) +
      (marketBaselines.length * 0.5) +
      (cryptoPrices.length * 0.5) +
      (users.length * 0.5);

    const stats = {
      timestamp: Date.now(),
      counts: {
        activitySnapshots: activitySnapshots.length,
        fiveMinSnapshots: fiveMinSnapshots.length,
        oneHourSnapshots: oneHourSnapshots.length,
        oneDaySnapshots: oneDaySnapshots.length,
        trendingMarkets: trendingMarkets.length,
        marketBaselines: marketBaselines.length,
        cryptoPrices: cryptoPrices.length,
        users: users.length,
      },
      estimatedStorageKB: Math.round(estimatedStorage),
      estimatedStorageMB: Math.round(estimatedStorage / 1024 * 100) / 100,
    };

    console.log("📊 Storage Stats:", stats);

    return stats;
  },
});

/**
 * Run all cleanup tasks
 * Convenience function to run all cleanup operations at once
 */
export const runAllCleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting comprehensive cleanup...");

    const snapshotsResult = await ctx.runMutation("cleanup:deleteExpiredSnapshots" as any, {});
    const marketsResult = await ctx.runMutation("cleanup:deleteStaleMarkets" as any, {});
    const baselinesResult = await ctx.runMutation("cleanup:deleteExpiredBaselines" as any, {});
    const cryptoResult = await ctx.runMutation("cleanup:deleteOldCryptoPrices" as any, {});
    const stats = await ctx.runMutation("cleanup:getStorageStats" as any, {});

    console.log("✅ Cleanup complete!");

    return {
      snapshots: snapshotsResult,
      markets: marketsResult,
      baselines: baselinesResult,
      crypto: cryptoResult,
      stats,
    };
  },
});
