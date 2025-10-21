import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  TRENDING_THRESHOLDS,
  TRENDING_EXPIRY,
  SURGE_THRESHOLD,
  calculateActivityScore,
  meetsTrendingCriteria,
  BASELINE_WINDOWS,
} from "./lib/constants";

/**
 * Get trending markets (top N by activity score)
 * Returns markets for UI display
 */
export const getTrendingMarkets = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? TRENDING_THRESHOLDS.maxTrendingDisplay;

    const markets = await ctx.db
      .query("trendingMarkets")
      .withIndex("by_activity_score")
      .order("desc")
      .take(limit);

    return markets;
  },
});

/**
 * Get a specific trending market by ID
 */
export const getTrendingMarket = query({
  args: {
    marketId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trendingMarkets")
      .withIndex("by_market_id", (q) => q.eq("marketId", args.marketId))
      .first();
  },
});

/**
 * Check if a market is currently trending
 */
export const isMarketTrending = query({
  args: {
    marketId: v.string(),
  },
  handler: async (ctx, args) => {
    const market = await ctx.db
      .query("trendingMarkets")
      .withIndex("by_market_id", (q) => q.eq("marketId", args.marketId))
      .first();

    return market !== null;
  },
});

/**
 * Get markets by percentile rank
 */
export const getMarketsByPercentile = query({
  args: {
    minPercentile: v.number(),
    maxPercentile: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxPercentile = args.maxPercentile ?? 100;

    const markets = await ctx.db
      .query("trendingMarkets")
      .withIndex("by_percentile")
      .filter((q) =>
        q.and(
          q.gte(q.field("percentileRank"), args.minPercentile),
          q.lte(q.field("percentileRank"), maxPercentile),
        ),
      )
      .collect();

    return markets.sort((a, b) => b.activityScore - a.activityScore);
  },
});

/**
 * Update or create a trending market
 */
export const upsertTrendingMarket = mutation({
  args: {
    marketId: v.string(),
    conditionId: v.string(),
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    liquidity: v.number(),
    volume24h: v.number(),
    tradeCount24h: v.number(),
    activityScore: v.number(),
    percentileRank: v.number(),
    yesPrice: v.optional(v.number()),
    noPrice: v.optional(v.number()),
    lastTradeTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trendingMarkets")
      .withIndex("by_market_id", (q) => q.eq("marketId", args.marketId))
      .first();

    const now = Date.now();
    const expiresAt = now + TRENDING_EXPIRY;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastUpdated: now,
        expiresAt,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("trendingMarkets", {
        ...args,
        lastUpdated: now,
        expiresAt,
      });
    }
  },
});

/**
 * Recalculate trending markets
 * This is the main function that determines which markets are trending
 * Called every 15 minutes via cron
 */
export const recalculateTrending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - BASELINE_WINDOWS.twentyFourHour;

    // Get recent activity snapshots to calculate 24h metrics
    const snapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .filter((q) => q.gte(q.field("timestamp"), twentyFourHoursAgo))
      .collect();

    if (snapshots.length === 0) {
      return { updated: 0, message: "No activity data available" };
    }

    // Aggregate market metrics from snapshots
    const marketMetrics = new Map<string, MarketMetrics>();

    for (const snapshot of snapshots) {
      for (const market of snapshot.markets) {
        const existing = marketMetrics.get(market.marketId) || {
          marketId: market.marketId,
          orderbookRequests: 0,
          tradeCount: 0,
          volumeUSD: 0,
          lastSpread: market.spread,
        };

        existing.orderbookRequests += market.orderbookRequests;
        existing.tradeCount += market.tradeEvents;
        existing.volumeUSD += market.volumeUSD;
        existing.lastSpread = market.spread || existing.lastSpread;

        marketMetrics.set(market.marketId, existing);
      }
    }

    // Calculate activity scores for all markets
    const marketScores: Array<{
      marketId: string;
      score: number;
      metrics: MarketMetrics;
    }> = [];

    for (const [marketId, metrics] of marketMetrics.entries()) {
      // Estimate liquidity from volume (rough heuristic)
      const estimatedLiquidity = metrics.volumeUSD * 2;

      // Get orderbookRequests for last hour only
      const oneHourAgo = now - BASELINE_WINDOWS.oneHour;
      const recentSnapshots = snapshots.filter(
        (s) => s.timestamp >= oneHourAgo,
      );
      let orderbookRequestsLastHour = 0;

      for (const snapshot of recentSnapshots) {
        const marketData = snapshot.markets.find(
          (m) => m.marketId === marketId,
        );
        if (marketData) {
          orderbookRequestsLastHour += marketData.orderbookRequests;
        }
      }

      const score = calculateActivityScore({
        volume24h: metrics.volumeUSD,
        tradeCount24h: metrics.tradeCount,
        orderbookRequests1h: orderbookRequestsLastHour,
        liquidity: estimatedLiquidity,
      });

      marketScores.push({
        marketId,
        score,
        metrics: {
          ...metrics,
          liquidity: estimatedLiquidity,
        },
      });
    }

    // Sort by score
    marketScores.sort((a, b) => b.score - a.score);

    // Calculate percentiles
    const totalMarkets = marketScores.length;
    const marketsWithPercentiles = marketScores.map((item, index) => ({
      ...item,
      percentileRank: ((totalMarkets - index) / totalMarkets) * 100,
    }));

    // Determine which markets are trending
    // Either: Top 10% by percentile OR meet absolute thresholds
    const top10PercentCutoff = Math.ceil(
      totalMarkets * TRENDING_THRESHOLDS.percentile,
    );
    const maxToStore = Math.max(
      top10PercentCutoff,
      TRENDING_THRESHOLDS.maxTrendingStorage,
    );

    const trendingCandidates = marketsWithPercentiles
      .slice(0, maxToStore)
      .filter((item) => {
        // Must meet either percentile OR absolute thresholds
        const meetsPercentile = item.percentileRank >= 90; // Top 10%
        const meetsAbsolute = meetsTrendingCriteria({
          liquidity: item.metrics.liquidity || 0,
          volume24h: item.metrics.volumeUSD,
          tradeCount24h: item.metrics.tradeCount,
        });

        return meetsPercentile || meetsAbsolute;
      });

    // Get existing trending markets for comparison
    const existingTrending = await ctx.db.query("trendingMarkets").collect();

    const existingMarketIds = new Set(existingTrending.map((m) => m.marketId));
    const newTrendingIds = new Set(trendingCandidates.map((m) => m.marketId));

    // Update/insert trending markets
    let updated = 0;
    for (const candidate of trendingCandidates) {
      // We need market metadata - try to get from existing or use placeholder
      const existing = existingTrending.find(
        (m) => m.marketId === candidate.marketId,
      );

      const expiresAt = now + TRENDING_EXPIRY;
      const marketData = {
        marketId: candidate.marketId,
        conditionId: existing?.conditionId || candidate.marketId,
        slug: existing?.slug || candidate.marketId,
        title: existing?.title || "Unknown Market",
        description: existing?.description,
        endDate: existing?.endDate,
        liquidity: candidate.metrics.liquidity || 0,
        volume24h: candidate.metrics.volumeUSD,
        tradeCount24h: candidate.metrics.tradeCount,
        activityScore: candidate.score,
        percentileRank: candidate.percentileRank,
        yesPrice: existing?.yesPrice,
        noPrice: existing?.noPrice,
        lastTradeTimestamp: now,
        lastUpdated: now,
        expiresAt,
      };

      if (existing) {
        await ctx.db.patch(existing._id, marketData);
      } else {
        await ctx.db.insert("trendingMarkets", marketData);
      }

      updated++;
    }

    // Mark markets that are no longer trending for expiration
    for (const existing of existingTrending) {
      if (!newTrendingIds.has(existing.marketId)) {
        // Don't delete immediately, let it expire naturally
        // This gives a grace period for markets that temporarily dip
        const expiresAt = now + TRENDING_EXPIRY;
        await ctx.db.patch(existing._id, { expiresAt });
      }
    }

    // Also update baselines for trending markets
    await ctx.scheduler.runAfter(0, "trending:updateBaselines" as any, {
      marketIds: Array.from(newTrendingIds),
    });

    return {
      updated,
      totalMarkets,
      trendingCount: trendingCandidates.length,
      top10PercentCutoff,
    };
  },
});

/**
 * Detect if a market has surged and trigger immediate recalculation
 */
export const detectSurge = mutation({
  args: {
    marketId: v.string(),
    currentActivity: v.number(),
  },
  handler: async (ctx, args) => {
    // Get baseline for comparison
    const baseline = await ctx.db
      .query("marketBaselines")
      .withIndex("by_market_id", (q) => q.eq("marketId", args.marketId))
      .first();

    if (!baseline) {
      // No baseline yet, can't detect surge
      return { surgeDetected: false };
    }

    // Check if current activity is 200%+ of 1-hour average
    const ratio = args.currentActivity / baseline.avg1hour;

    if (ratio >= SURGE_THRESHOLD) {
      // Trigger immediate recalculation
      await ctx.scheduler.runAfter(
        0,
        "trending:recalculateTrending" as any,
        {},
      );

      return {
        surgeDetected: true,
        ratio,
        message: `Surge detected: ${ratio.toFixed(2)}x normal activity`,
      };
    }

    return { surgeDetected: false };
  },
});

/**
 * Update baselines for trending markets
 * Internal function called after recalculation
 */
export const updateBaselines = internalMutation({
  args: {
    marketIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneHourAgo = now - BASELINE_WINDOWS.oneHour;
    const twentyFourHoursAgo = now - BASELINE_WINDOWS.twentyFourHour;
    const sevenDaysAgo = now - BASELINE_WINDOWS.sevenDay;

    for (const marketId of args.marketIds) {
      // Get snapshots for different time windows
      const oneHourSnapshots = await getMarketSnapshotsInRange(
        ctx,
        marketId,
        oneHourAgo,
        now,
        "5min",
      );

      const twentyFourHourSnapshots = await getMarketSnapshotsInRange(
        ctx,
        marketId,
        twentyFourHoursAgo,
        oneHourAgo,
        "5min",
      );

      const sevenDaySnapshots = await getMarketSnapshotsInRange(
        ctx,
        marketId,
        sevenDaysAgo,
        twentyFourHoursAgo,
        "1hour",
      );

      // Calculate averages
      const avg1hour = calculateMarketAverage(oneHourSnapshots, marketId);
      const avg24hour = calculateMarketAverage(
        twentyFourHourSnapshots,
        marketId,
      );
      const avg7day = calculateMarketAverage(sevenDaySnapshots, marketId);

      // Calculate standard deviation for 24h (for better surge detection)
      const stdDev24hour = calculateMarketStdDev(
        twentyFourHourSnapshots,
        marketId,
        avg24hour,
      );

      // Upsert baseline
      const existing = await ctx.db
        .query("marketBaselines")
        .withIndex("by_market_id", (q) => q.eq("marketId", marketId))
        .first();

      const expiresAt = now + BASELINE_WINDOWS.twentyFourHour;

      if (existing) {
        await ctx.db.patch(existing._id, {
          avg1hour,
          avg24hour,
          avg7day,
          stdDev24hour,
          lastCalculated: now,
          expiresAt,
        });
      } else {
        await ctx.db.insert("marketBaselines", {
          marketId,
          avg1hour,
          avg24hour,
          avg7day,
          stdDev24hour,
          lastCalculated: now,
          expiresAt,
        });
      }
    }
  },
});

// ============================================================================
// Helper Types & Functions
// ============================================================================

interface MarketMetrics {
  marketId: string;
  orderbookRequests: number;
  tradeCount: number;
  volumeUSD: number;
  liquidity?: number;
  lastSpread?: number;
}

async function getMarketSnapshotsInRange(
  ctx: any,
  marketId: string,
  startTime: number,
  endTime: number,
  granularity: "5min" | "1hour" | "1day",
) {
  const snapshots = await ctx.db
    .query("activitySnapshots")
    .withIndex("by_granularity", (q: any) => q.eq("granularity", granularity))
    .filter((q: any) =>
      q.and(
        q.gte(q.field("timestamp"), startTime),
        q.lt(q.field("timestamp"), endTime),
      ),
    )
    .collect();

  return snapshots;
}

function calculateMarketAverage(snapshots: any[], marketId: string): number {
  if (snapshots.length === 0) return 0;

  let totalActivity = 0;
  let count = 0;

  for (const snapshot of snapshots) {
    const marketData = snapshot.markets.find(
      (m: any) => m.marketId === marketId,
    );
    if (marketData) {
      totalActivity += marketData.orderbookRequests + marketData.tradeEvents;
      count++;
    }
  }

  return count > 0 ? totalActivity / count : 0;
}

function calculateMarketStdDev(
  snapshots: any[],
  marketId: string,
  mean: number,
): number {
  if (snapshots.length === 0) return 0;

  const activities: number[] = [];

  for (const snapshot of snapshots) {
    const marketData = snapshot.markets.find(
      (m: any) => m.marketId === marketId,
    );
    if (marketData) {
      activities.push(marketData.orderbookRequests + marketData.tradeEvents);
    }
  }

  if (activities.length === 0) return 0;

  const squaredDiffs = activities.map((activity) =>
    Math.pow(activity - mean, 2),
  );
  const avgSquaredDiff =
    squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;

  return Math.sqrt(avgSquaredDiff);
}
