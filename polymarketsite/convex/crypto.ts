import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all crypto prices
export const getAllCryptoPrices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cryptoPrices").collect();
  },
});

// Query: Get specific crypto price
export const getCryptoPrice = query({
  args: {
    symbol: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cryptoPrices")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();
  },
});

// Query: Get multiple crypto prices
export const getCryptoPrices = query({
  args: {
    symbols: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const prices = [];

    for (const symbol of args.symbols) {
      const price = await ctx.db
        .query("cryptoPrices")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .first();

      if (price) {
        prices.push(price);
      }
    }

    return prices;
  },
});

// Mutation: Update crypto price
export const updateCryptoPrice = mutation({
  args: {
    symbol: v.string(),
    price: v.number(),
    change24h: v.optional(v.number()),
    volume24h: v.optional(v.number()),
    marketCap: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cryptoPrices")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();

    const data = {
      symbol: args.symbol,
      price: args.price,
      change24h: args.change24h,
      volume24h: args.volume24h,
      marketCap: args.marketCap,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("cryptoPrices", data);
  },
});

// Mutation: Batch update crypto prices
export const batchUpdateCryptoPrices = mutation({
  args: {
    prices: v.array(
      v.object({
        symbol: v.string(),
        price: v.number(),
        change24h: v.optional(v.number()),
        volume24h: v.optional(v.number()),
        marketCap: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const priceData of args.prices) {
      const existing = await ctx.db
        .query("cryptoPrices")
        .withIndex("by_symbol", (q) => q.eq("symbol", priceData.symbol))
        .first();

      const data = {
        ...priceData,
        lastUpdated: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("cryptoPrices", data);
        results.push(id);
      }
    }

    return { count: results.length, ids: results };
  },
});

// Query: Get top gainers/losers
export const getTopMovers = query({
  args: {
    type: v.union(v.literal("gainers"), v.literal("losers")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const prices = await ctx.db.query("cryptoPrices").collect();

    const filtered = prices.filter((p) => p.change24h !== undefined);

    if (args.type === "gainers") {
      return filtered
        .sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))
        .slice(0, limit);
    } else {
      return filtered
        .sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0))
        .slice(0, limit);
    }
  },
});
