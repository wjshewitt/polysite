import {
  query,
  mutation,
  internalMutation,
  MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import {
  ACTIVITY_FLUSH_INTERVAL,
  SNAPSHOT_INTERVALS,
  getExpirationTimestamp,
  BASELINE_WINDOWS,
} from "./lib/constants";

/**
 * Record a batch of activity events from the frontend
 * Called every 5 minutes by the ActivityTracker service
 */
export const recordActivityBatch = mutation({
  args: {
    timestamp: v.number(),
    global: v.object({
      orderbookRequests: v.number(),
      tradeEvents: v.number(),
      orderEvents: v.number(),
      liquidityEvents: v.number(),
      activeMarkets: v.number(),
      uniqueUsers: v.number(),
    }),
    markets: v.array(
      v.object({
        marketId: v.string(),
        orderbookRequests: v.number(),
        tradeEvents: v.number(),
        volumeUSD: v.number(),
        spread: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Create a 5-minute snapshot
    const expiresAt = getExpirationTimestamp("5min");

    await ctx.db.insert("activitySnapshots", {
      timestamp: args.timestamp,
      granularity: "5min",
      expiresAt,
      global: args.global,
      markets: args.markets,
    });

    // Check if we need to create hourly or daily aggregates
    await ctx.scheduler.runAfter(0, "activity:maybeCreateAggregates" as any, {
      timestamp: args.timestamp,
    });

    return { success: true };
  },
});

/**
 * Get the current activity (latest 5-minute snapshot)
 */
export const getCurrentActivity = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .order("desc")
      .first();

    return latest;
  },
});

/**
 * Get activity history for a time range
 */
export const getActivityHistory = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    granularity: v.optional(
      v.union(v.literal("5min"), v.literal("1hour"), v.literal("1day")),
    ),
  },
  handler: async (ctx, args) => {
    const granularity = args.granularity ?? "5min";

    const snapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", granularity))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTime),
          q.lte(q.field("timestamp"), args.endTime),
        ),
      )
      .order("asc")
      .collect();

    return snapshots;
  },
});

/**
 * Get activity for a specific market
 */
export const getMarketActivity = query({
  args: {
    marketId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    granularity: v.optional(
      v.union(v.literal("5min"), v.literal("1hour"), v.literal("1day")),
    ),
  },
  handler: async (ctx, args) => {
    const granularity = args.granularity ?? "5min";

    const snapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", granularity))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTime),
          q.lte(q.field("timestamp"), args.endTime),
        ),
      )
      .order("asc")
      .collect();

    // Extract market-specific data
    return snapshots.map((snapshot) => ({
      timestamp: snapshot.timestamp,
      market: snapshot.markets.find((m) => m.marketId === args.marketId),
    }));
  },
});

/**
 * Calculate busyness score for global platform
 * Returns ratio of current activity vs baseline (1hr vs 24hr, and 1hr vs 7day)
 */
export const getGlobalBusyness = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - BASELINE_WINDOWS.oneHour;
    const twentyFourHoursAgo = now - BASELINE_WINDOWS.twentyFourHour;
    const sevenDaysAgo = now - BASELINE_WINDOWS.sevenDay;

    // Get current hour activity
    const currentHourSnapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .filter((q) => q.gte(q.field("timestamp"), oneHourAgo))
      .collect();

    // Get 24-hour baseline
    const twentyFourHourSnapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), twentyFourHoursAgo),
          q.lt(q.field("timestamp"), oneHourAgo),
        ),
      )
      .collect();

    // Get 7-day baseline (use hourly snapshots for efficiency)
    const sevenDaySnapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "1hour"))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), sevenDaysAgo),
          q.lt(q.field("timestamp"), twentyFourHoursAgo),
        ),
      )
      .collect();

    // Calculate averages
    const currentRate = calculateAverageRate(currentHourSnapshots);
    const twentyFourHourRate = calculateAverageRate(twentyFourHourSnapshots);
    const sevenDayRate = calculateAverageRate(sevenDaySnapshots);

    return {
      currentRate,
      vs24h: {
        baseline: twentyFourHourRate,
        ratio: twentyFourHourRate > 0 ? currentRate / twentyFourHourRate : 1,
      },
      vs7d: {
        baseline: sevenDayRate,
        ratio: sevenDayRate > 0 ? currentRate / sevenDayRate : 1,
      },
    };
  },
});

/**
 * Calculate busyness score for a specific market
 */
export const getMarketBusyness = query({
  args: {
    marketId: v.string(),
  },
  handler: async (ctx, args) => {
    // First check if we have a baseline for this market
    const baseline = await ctx.db
      .query("marketBaselines")
      .withIndex("by_market_id", (q) => q.eq("marketId", args.marketId))
      .first();

    if (!baseline) {
      return null; // Market not tracked (not trending)
    }

    // Get current hour activity
    const now = Date.now();
    const oneHourAgo = now - BASELINE_WINDOWS.oneHour;

    const currentHourSnapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .filter((q) => q.gte(q.field("timestamp"), oneHourAgo))
      .collect();

    // Calculate current rate for this market
    let totalEvents = 0;
    let count = 0;

    for (const snapshot of currentHourSnapshots) {
      const marketData = snapshot.markets.find(
        (m) => m.marketId === args.marketId,
      );
      if (marketData) {
        totalEvents += marketData.orderbookRequests + marketData.tradeEvents;
        count++;
      }
    }

    const currentRate = count > 0 ? totalEvents / count : 0;

    return {
      currentRate,
      vs1h: {
        baseline: baseline.avg1hour,
        ratio: baseline.avg1hour > 0 ? currentRate / baseline.avg1hour : 1,
      },
      vs24h: {
        baseline: baseline.avg24hour,
        ratio: baseline.avg24hour > 0 ? currentRate / baseline.avg24hour : 1,
      },
      vs7d: {
        baseline: baseline.avg7day,
        ratio: baseline.avg7day > 0 ? currentRate / baseline.avg7day : 1,
      },
    };
  },
});

/**
 * Get activity summary statistics
 */
export const getActivitySummary = query({
  args: {
    timeRange: v.optional(v.number()), // milliseconds
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startTime = args.timeRange
      ? now - args.timeRange
      : now - BASELINE_WINDOWS.twentyFourHour;

    const snapshots = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    if (snapshots.length === 0) {
      return null;
    }

    // Aggregate totals
    let totalOrderbookRequests = 0;
    let totalTradeEvents = 0;
    let totalOrderEvents = 0;
    let totalLiquidityEvents = 0;
    let maxActiveMarkets = 0;
    let totalUniqueUsers = 0;

    for (const snapshot of snapshots) {
      totalOrderbookRequests += snapshot.global.orderbookRequests;
      totalTradeEvents += snapshot.global.tradeEvents;
      totalOrderEvents += snapshot.global.orderEvents;
      totalLiquidityEvents += snapshot.global.liquidityEvents;
      maxActiveMarkets = Math.max(
        maxActiveMarkets,
        snapshot.global.activeMarkets,
      );
      totalUniqueUsers += snapshot.global.uniqueUsers;
    }

    const avgUniqueUsers = totalUniqueUsers / snapshots.length;

    return {
      timeRange: args.timeRange ?? BASELINE_WINDOWS.twentyFourHour,
      snapshotCount: snapshots.length,
      totals: {
        orderbookRequests: totalOrderbookRequests,
        tradeEvents: totalTradeEvents,
        orderEvents: totalOrderEvents,
        liquidityEvents: totalLiquidityEvents,
      },
      averages: {
        orderbookRequestsPerSnapshot: totalOrderbookRequests / snapshots.length,
        tradeEventsPerSnapshot: totalTradeEvents / snapshots.length,
        orderEventsPerSnapshot: totalOrderEvents / snapshots.length,
        liquidityEventsPerSnapshot: totalLiquidityEvents / snapshots.length,
        uniqueUsers: avgUniqueUsers,
      },
      peak: {
        activeMarkets: maxActiveMarkets,
      },
    };
  },
});

/**
 * Internal: Maybe create hourly or daily aggregates
 */
export const maybeCreateAggregates = internalMutation({
  args: {
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const hour = Math.floor(args.timestamp / SNAPSHOT_INTERVALS.oneHour);
    const day = Math.floor(args.timestamp / SNAPSHOT_INTERVALS.oneDay);

    // Check if we need hourly aggregate
    const hourTimestamp = hour * SNAPSHOT_INTERVALS.oneHour;
    const existingHourly = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "1hour"))
      .filter((q) => q.eq(q.field("timestamp"), hourTimestamp))
      .first();

    if (!existingHourly) {
      await createHourlyAggregate(ctx, hourTimestamp);
    }

    // Check if we need daily aggregate
    const dayTimestamp = day * SNAPSHOT_INTERVALS.oneDay;
    const existingDaily = await ctx.db
      .query("activitySnapshots")
      .withIndex("by_granularity", (q) => q.eq("granularity", "1day"))
      .filter((q) => q.eq(q.field("timestamp"), dayTimestamp))
      .first();

    if (!existingDaily) {
      await createDailyAggregate(ctx, dayTimestamp);
    }
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

function calculateAverageRate(snapshots: any[]): number {
  if (snapshots.length === 0) return 0;

  const total = snapshots.reduce((sum, snapshot) => {
    return (
      sum +
      snapshot.global.orderbookRequests +
      snapshot.global.tradeEvents +
      snapshot.global.orderEvents +
      snapshot.global.liquidityEvents
    );
  }, 0);

  return total / snapshots.length;
}

async function createHourlyAggregate(ctx: MutationCtx, hourTimestamp: number) {
  const hourStart = hourTimestamp;
  const hourEnd = hourTimestamp + SNAPSHOT_INTERVALS.oneHour;

  const fiveMinSnapshots = await ctx.db
    .query("activitySnapshots")
    .withIndex("by_granularity", (q) => q.eq("granularity", "5min"))
    .filter((q) =>
      q.and(
        q.gte(q.field("timestamp"), hourStart),
        q.lt(q.field("timestamp"), hourEnd),
      ),
    )
    .collect();

  if (fiveMinSnapshots.length === 0) return;

  const aggregated = aggregateSnapshots(fiveMinSnapshots);
  const expiresAt = getExpirationTimestamp("1hour");

  await ctx.db.insert("activitySnapshots", {
    timestamp: hourTimestamp,
    granularity: "1hour",
    expiresAt,
    global: aggregated.global,
    markets: aggregated.markets,
  });
}

async function createDailyAggregate(ctx: MutationCtx, dayTimestamp: number) {
  const dayStart = dayTimestamp;
  const dayEnd = dayTimestamp + SNAPSHOT_INTERVALS.oneDay;

  const hourlySnapshots = await ctx.db
    .query("activitySnapshots")
    .withIndex("by_granularity", (q) => q.eq("granularity", "1hour"))
    .filter((q) =>
      q.and(
        q.gte(q.field("timestamp"), dayStart),
        q.lt(q.field("timestamp"), dayEnd),
      ),
    )
    .collect();

  if (hourlySnapshots.length === 0) return;

  const aggregated = aggregateSnapshots(hourlySnapshots);
  const expiresAt = getExpirationTimestamp("1day");

  await ctx.db.insert("activitySnapshots", {
    timestamp: dayTimestamp,
    granularity: "1day",
    expiresAt,
    global: aggregated.global,
    markets: aggregated.markets,
  });
}

function aggregateSnapshots(snapshots: any[]) {
  const marketMap = new Map<string, any>();

  let globalOrderbook = 0;
  let globalTrade = 0;
  let globalOrder = 0;
  let globalLiquidity = 0;
  let maxActiveMarkets = 0;
  let totalUniqueUsers = 0;

  for (const snapshot of snapshots) {
    globalOrderbook += snapshot.global.orderbookRequests;
    globalTrade += snapshot.global.tradeEvents;
    globalOrder += snapshot.global.orderEvents;
    globalLiquidity += snapshot.global.liquidityEvents;
    maxActiveMarkets = Math.max(
      maxActiveMarkets,
      snapshot.global.activeMarkets,
    );
    totalUniqueUsers += snapshot.global.uniqueUsers;

    for (const market of snapshot.markets) {
      const existing = marketMap.get(market.marketId) || {
        marketId: market.marketId,
        orderbookRequests: 0,
        tradeEvents: 0,
        volumeUSD: 0,
        spread: undefined,
      };

      existing.orderbookRequests += market.orderbookRequests;
      existing.tradeEvents += market.tradeEvents;
      existing.volumeUSD += market.volumeUSD;
      existing.spread = market.spread; // Use latest

      marketMap.set(market.marketId, existing);
    }
  }

  return {
    global: {
      orderbookRequests: globalOrderbook,
      tradeEvents: globalTrade,
      orderEvents: globalOrder,
      liquidityEvents: globalLiquidity,
      activeMarkets: maxActiveMarkets,
      uniqueUsers: Math.round(totalUniqueUsers / snapshots.length),
    },
    markets: Array.from(marketMap.values()),
  };
}
