import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Lean Convex Schema for Free Tier
 *
 * Focus: Activity monitoring, trending markets, user data, crypto prices
 * Storage: ~1.6MB total (well under 1GB limit)
 */
export default defineSchema({
  // Activity Snapshots - Core of the monitoring system
  // Stores aggregated activity metrics at different time granularities
  activitySnapshots: defineTable({
    timestamp: v.number(),
    granularity: v.union(
      v.literal("5min"),
      v.literal("1hour"),
      v.literal("1day"),
    ),
    expiresAt: v.number(), // TTL for auto-cleanup

    // Global platform metrics
    global: v.object({
      orderbookRequests: v.number(), // Count of orderbook update events
      tradeEvents: v.number(), // Count of trade executions
      orderEvents: v.number(), // Orders placed/cancelled
      liquidityEvents: v.number(), // Liquidity add/remove events
      activeMarkets: v.number(), // Number of markets with activity
      uniqueUsers: v.number(), // Distinct wallet addresses seen
    }),

    // Per-market metrics (only for trending markets to save space)
    markets: v.array(
      v.object({
        marketId: v.string(),
        orderbookRequests: v.number(),
        tradeEvents: v.number(),
        volumeUSD: v.number(),
        spread: v.optional(v.number()), // Current bid-ask spread
      }),
    ),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_granularity", ["granularity", "timestamp"])
    .index("by_expires", ["expiresAt"]),

  // Trending Markets - Only store markets that meet trending criteria
  // Auto-expires if market stops trending
  trendingMarkets: defineTable({
    marketId: v.string(),
    conditionId: v.string(),
    slug: v.string(),
    title: v.string(),

    // Trending criteria
    liquidity: v.number(),
    volume24h: v.number(),
    tradeCount24h: v.number(),
    activityScore: v.number(), // Calculated score for ranking
    percentileRank: v.number(), // 0-100 percentile

    // Current state
    yesPrice: v.optional(v.number()),
    noPrice: v.optional(v.number()),
    lastTradeTimestamp: v.number(),

    // Metadata
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),

    // Auto-expiration
    lastUpdated: v.number(),
    expiresAt: v.number(), // Remove if not trending for 24h
  })
    .index("by_market_id", ["marketId"])
    .index("by_activity_score", ["activityScore"])
    .index("by_percentile", ["percentileRank"])
    .index("by_expires", ["expiresAt"])
    .index("by_last_updated", ["lastUpdated"]),

  // Market Baselines - Rolling averages for "busier than usual" calculation
  // Only stored for trending markets
  marketBaselines: defineTable({
    marketId: v.string(),

    // Rolling averages (events per hour)
    avg1hour: v.number(), // Average over last 1 hour
    avg24hour: v.number(), // Average over last 24 hours
    avg7day: v.number(), // Average over last 7 days

    // Additional context
    stdDev24hour: v.optional(v.number()), // Standard deviation for better detection
    peakActivity: v.optional(v.number()), // Highest activity seen

    // Metadata
    lastCalculated: v.number(),
    expiresAt: v.number(), // Recalculate daily
  })
    .index("by_market_id", ["marketId"])
    .index("by_expires", ["expiresAt"]),

  // Crypto Prices - Real-time cryptocurrency prices
  // Small footprint, always useful (~50 symbols max)
  cryptoPrices: defineTable({
    symbol: v.string(), // e.g., "BTC", "ETH", "SOL"
    price: v.number(), // Current price in USD
    change24h: v.optional(v.number()), // 24h change percentage
    volume24h: v.optional(v.number()), // 24h trading volume
    marketCap: v.optional(v.number()), // Market capitalization
    lastUpdated: v.number(), // Unix timestamp
    expiresAt: v.optional(v.number()), // Keep last 7 days
  })
    .index("by_symbol", ["symbol"])
    .index("by_last_updated", ["lastUpdated"])
    .index("by_expires", ["expiresAt"]),

  // Markets - Market metadata
  markets: defineTable({
    id: v.string(),              // Market ID
    conditionId: v.string(),     // Condition ID
    slug: v.string(),            // URL slug
    title: v.string(),           // Market title
    description: v.optional(v.string()), // Market description
    endDate: v.optional(v.number()), // End date timestamp
    createdAt: v.number(),       // Creation timestamp
    volume: v.optional(v.number()), // Total volume
    liquidity: v.optional(v.number()), // Total liquidity
    yesPrice: v.optional(v.number()), // YES outcome price
    noPrice: v.optional(v.number()), // NO outcome price
    yesTokenId: v.optional(v.string()), // YES token ID
    noTokenId: v.optional(v.string()), // NO token ID
    resolved: v.optional(v.boolean()), // Is resolved?
    resolvedOutcome: v.optional(v.string()), // Resolution outcome
  })
    .index("by_market_id", ["id"])
    .index("by_condition_id", ["conditionId"])
    .index("by_slug", ["slug"])
    .index("by_created_at", ["createdAt"])
    .index("by_end_date", ["endDate"])
    .index("by_resolved", ["resolved"]),

  // Users - User profiles, watchlists, and settings
  // For future authentication implementation
  users: defineTable({
    address: v.string(), // Wallet address (primary identifier)
    username: v.optional(v.string()), // Display name
    email: v.optional(v.string()), // Email (optional)

    // User preferences
    settings: v.optional(
      v.object({
        notifications: v.optional(v.boolean()),
        theme: v.optional(v.union(v.literal("dark"), v.literal("light"))),
        defaultCurrency: v.optional(v.string()),
      }),
    ),

    // Watchlist
    watchlist: v.optional(v.array(v.string())), // Array of marketIds

    // Metadata
    createdAt: v.number(),
    lastActive: v.number(),
  })
    .index("by_address", ["address"])
    .index("by_username", ["username"])
    .index("by_last_active", ["lastActive"]),
});
