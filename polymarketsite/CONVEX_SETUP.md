# 🗄️ Convex Backend & Database Setup

This guide walks you through setting up Convex as the backend and database for the Polymarket Live Monitor.

## 📋 Table of Contents

- [What is Convex?](#what-is-convex)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [Available Functions](#available-functions)
- [Integration with WebSocket](#integration-with-websocket)
- [Usage Examples](#usage-examples)
- [Performance Considerations](#performance-considerations)

## What is Convex?

Convex is a real-time backend platform that provides:

- **Real-time Database**: Automatically syncs data to all connected clients
- **TypeScript Functions**: Write queries and mutations in TypeScript
- **Automatic API Generation**: No need to write REST endpoints
- **Built-in Authentication**: User management and auth (optional)
- **Serverless Architecture**: No infrastructure to manage

Perfect for our real-time Polymarket monitoring dashboard!

## 🚀 Quick Start

### 1. Install Convex

Already installed! The `convex` package is in `package.json`.

### 2. Create a Convex Account

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign up with GitHub or email
3. Create a new project (e.g., "polymarket-monitor")

### 3. Initialize Convex

```bash
npx convex dev
```

This will:
- Create a `convex/` directory with your functions
- Link your local project to your Convex deployment
- Start the Convex dev server
- Generate a `.env.local` file with your `NEXT_PUBLIC_CONVEX_URL`

**Important**: The `convex/` directory already exists with all the functions! When prompted, choose to keep the existing files.

### 4. Set Environment Variables

After running `npx convex dev`, your `.env.local` will be created automatically. It should look like:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

You can also copy from `.env.local.example`:

```bash
cp .env.local.example .env.local
# Then edit .env.local with your actual Convex URL
```

### 5. Deploy Your Schema and Functions

```bash
npx convex deploy
```

This pushes your schema and functions to Convex.

### 6. Start the Dev Server

```bash
npm run dev
```

Your app is now connected to Convex! 🎉

## 📊 Database Schema

The Convex schema includes the following tables:

### `trades`
Stores all trade executions from the WebSocket feed.

```typescript
{
  id: string,              // Unique trade ID
  market: string,          // Market/condition ID
  marketSlug?: string,     // Human-readable market slug
  side: "BUY" | "SELL",    // Trade side
  price: number,           // Execution price (0-1)
  size: number,            // Trade size (token amount)
  timestamp: number,       // Unix timestamp
  outcomeIndex?: number,   // Outcome index (0 or 1)
  makerAddress?: string,   // Maker wallet address
  takerAddress?: string,   // Taker wallet address
}
```

**Indexes**:
- `by_market` - Query trades for a specific market
- `by_timestamp` - Query trades chronologically
- `by_market_timestamp` - Query trades for a market in time range

### `comments`
Stores user comments on markets.

```typescript
{
  id: string,          // Unique comment ID
  marketId: string,    // Market this comment is on
  userId: string,      // User who posted
  username?: string,   // Display name
  text: string,        // Comment text
  timestamp: number,   // Unix timestamp
  likes: number,       // Like count
  dislikes: number,    // Dislike count
}
```

**Indexes**:
- `by_market` - Get comments for a market
- `by_user` - Get comments by a user
- `by_timestamp` - Get recent comments

### `reactions`
Stores likes/dislikes on comments.

```typescript
{
  id: string,               // Unique reaction ID
  commentId: string,        // Comment being reacted to
  userId: string,           // User who reacted
  type: "LIKE" | "DISLIKE", // Reaction type
  timestamp: number,        // Unix timestamp
}
```

### `cryptoPrices`
Stores current crypto prices.

```typescript
{
  symbol: string,      // e.g., "BTC", "ETH"
  price: number,       // Current price in USD
  change24h?: number,  // 24h change percentage
  volume24h?: number,  // 24h trading volume
  marketCap?: number,  // Market capitalization
  lastUpdated: number, // Unix timestamp
}
```

### `markets`
Stores market metadata.

```typescript
{
  id: string,              // Market ID
  conditionId: string,     // Condition ID
  slug: string,            // URL slug
  title: string,           // Market title
  description?: string,    // Market description
  endDate?: number,        // End date timestamp
  createdAt: number,       // Creation timestamp
  volume?: number,         // Total volume
  liquidity?: number,      // Total liquidity
  yesPrice?: number,       // YES outcome price
  noPrice?: number,        // NO outcome price
  yesTokenId?: string,     // YES token ID
  noTokenId?: string,      // NO token ID
  resolved?: boolean,      // Is resolved?
  resolvedOutcome?: string,// Resolution outcome
}
```

### `orderbooks`
Stores order book snapshots.

```typescript
{
  market: string,     // Market ID
  timestamp: number,  // Snapshot timestamp
  bids: Array<{ price: number, size: number }>,
  asks: Array<{ price: number, size: number }>,
}
```

### `users`
Stores user profiles and settings.

```typescript
{
  address: string,        // Wallet address
  username?: string,      // Display name
  email?: string,         // Email (optional)
  settings?: {
    notifications?: boolean,
    defaultCrypto?: string,
    theme?: string,
  },
  watchlist?: string[],   // Array of market IDs
  createdAt: number,      // Account creation
  lastActive: number,     // Last activity
}
```

### `positions`
Stores user positions for portfolio tracking.

```typescript
{
  userId: string,         // User ID
  marketId: string,       // Market ID
  outcome: "YES" | "NO",  // Position side
  shares: number,         // Number of shares
  averagePrice: number,   // Average entry price
  currentValue?: number,  // Current value in USD
  unrealizedPnL?: number, // Unrealized profit/loss
  lastUpdated: number,    // Last update timestamp
}
```

### `analytics`
Stores historical analytics snapshots.

```typescript
{
  timestamp: number,      // Snapshot timestamp
  totalVolume: number,    // Total platform volume
  totalTrades: number,    // Total number of trades
  activeMarkets: number,  // Number of active markets
  totalUsers: number,     // Total user count
  topMarkets?: Array<{
    marketId: string,
    volume: number,
  }>,
}
```

## 🔧 Available Functions

### Queries (Read Data)

**Trades**:
- `trades.getRecentTrades(limit?, marketId?)` - Get recent trades
- `trades.getTradesByMarketTimeRange(marketId, startTime, endTime)` - Get trades in time range
- `trades.getTradeStats(marketId, timeRange?)` - Get trade statistics
- `trades.getVolumeOverTime(marketId?, interval, startTime, endTime)` - Get volume chart data

**Comments**:
- `comments.getRecentComments(limit?, marketId?)` - Get recent comments
- `comments.getCommentsByUser(userId, limit?)` - Get user's comments
- `comments.getTopComments(marketId, limit?)` - Get top-rated comments
- `comments.getReactions(commentId?, userId?, limit?)` - Get reactions
- `comments.getCommentStats(marketId?, userId?)` - Get comment statistics

**Crypto & Markets**:
- `crypto.getAllCryptoPrices()` - Get all crypto prices
- `crypto.getCryptoPrice(symbol)` - Get specific crypto price
- `crypto.getTopMovers(type, limit?)` - Get top gainers/losers
- `crypto.getMarkets(limit?, resolved?)` - Get markets
- `crypto.getMarket(id)` - Get market by ID
- `crypto.getMarketByConditionId(conditionId)` - Get market by condition ID
- `crypto.getMarketBySlug(slug)` - Get market by slug
- `crypto.searchMarkets(query, limit?)` - Search markets
- `crypto.getTopMarketsByVolume(limit?)` - Get top markets

### Mutations (Write Data)

**Trades**:
- `trades.addTrade(...)` - Add a single trade
- `trades.addTrades(trades)` - Batch add trades

**Comments**:
- `comments.addComment(...)` - Add a comment
- `comments.updateCommentReactions(commentId, likes, dislikes)` - Update reaction counts
- `comments.addReaction(...)` - Add a reaction
- `comments.removeReaction(reactionId)` - Remove a reaction

**Crypto & Markets**:
- `crypto.updateCryptoPrice(symbol, price, ...)` - Update crypto price
- `crypto.batchUpdateCryptoPrices(prices)` - Batch update prices
- `crypto.upsertMarket(...)` - Add or update market
- `crypto.updateMarketPrices(marketId, yesPrice, noPrice)` - Update market prices

## 🔄 Integration with WebSocket

The app automatically syncs WebSocket data to Convex using the `ConvexSyncService`.

### How It Works

1. **WebSocket receives data** (trade, comment, crypto price, etc.)
2. **Data is added to Zustand store** (for immediate UI updates)
3. **Data is synced to Convex** (for persistence and historical queries)

### Syncing Service

Located in `services/convexSync.ts`:

```typescript
import { getConvexSyncService } from "@/services/convexSync";

const syncService = getConvexSyncService();

// Sync a trade
await syncService.syncTrade(trade);

// Sync a comment
await syncService.syncComment(comment);

// Sync crypto prices (batched)
await syncService.syncCryptoPrices(prices);

// Enable/disable syncing
syncService.setSyncEnabled(false);
```

### Batching

Trades are batched to reduce API calls:
- **Batch size**: 10 trades
- **Batch delay**: 2 seconds
- Trades are flushed when batch is full OR after delay

Configure in `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_BATCH_SIZE=10
NEXT_PUBLIC_CONVEX_BATCH_DELAY=2000
```

## 💡 Usage Examples

### Example 1: Display Recent Trades

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function RecentTradesList() {
  const trades = useQuery(api.trades.getRecentTrades, { 
    limit: 20 
  });

  if (!trades) return <div>Loading...</div>;

  return (
    <div>
      {trades.map((trade) => (
        <div key={trade._id}>
          {trade.side} {trade.size} @ ${trade.price}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Get Market Stats

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MarketStats({ marketId }: { marketId: string }) {
  const stats = useQuery(api.trades.getTradeStats, { 
    marketId,
    timeRange: 86400000, // Last 24 hours
  });

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <p>Total Trades: {stats.totalTrades}</p>
      <p>Volume: ${stats.totalVolume.toFixed(2)}</p>
      <p>Avg Price: ${stats.averagePrice.toFixed(4)}</p>
      <p>Buy/Sell Ratio: {(stats.buyCount / stats.sellCount).toFixed(2)}</p>
    </div>
  );
}
```

### Example 3: Real-time Crypto Prices

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CryptoPrices() {
  const prices = useQuery(api.crypto.getAllCryptoPrices);

  if (!prices) return <div>Loading...</div>;

  return (
    <div>
      {prices.map((price) => (
        <div key={price._id}>
          {price.symbol}: ${price.price.toFixed(2)}
          {price.change24h && (
            <span className={price.change24h > 0 ? "text-green" : "text-red"}>
              {price.change24h > 0 ? "+" : ""}
              {price.change24h.toFixed(2)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Search Markets

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MarketSearch() {
  const [query, setQuery] = useState("");
  const results = useQuery(
    api.crypto.searchMarkets, 
    query ? { query, limit: 10 } : "skip"
  );

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search markets..."
      />
      {results?.map((market) => (
        <div key={market._id}>
          <h3>{market.title}</h3>
          <p>{market.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 5: Volume Chart

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LineChart, Line, XAxis, YAxis } from "recharts";

export function VolumeChart({ marketId }: { marketId: string }) {
  const now = Date.now();
  const oneDayAgo = now - 86400000;
  
  const volumeData = useQuery(api.trades.getVolumeOverTime, {
    marketId,
    interval: 3600000, // 1 hour buckets
    startTime: oneDayAgo,
    endTime: now,
  });

  if (!volumeData) return <div>Loading...</div>;

  return (
    <LineChart width={600} height={300} data={volumeData}>
      <XAxis 
        dataKey="timestamp" 
        tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
      />
      <YAxis />
      <Line type="monotone" dataKey="volume" stroke="#00FF9C" />
    </LineChart>
  );
}
```

## ⚡ Performance Considerations

### Real-time Subscriptions

Convex queries automatically subscribe to data changes. When data updates in the database, all connected clients receive updates in real-time!

```tsx
// This will automatically update when new trades are added
const trades = useQuery(api.trades.getRecentTrades, { limit: 10 });
```

### Query Optimization

1. **Use indexes**: All queries use indexed fields for fast lookups
2. **Limit results**: Always specify a `limit` for large datasets
3. **Time ranges**: Use time-based queries to avoid scanning all data
4. **Batch operations**: Use batch mutations when inserting multiple records

### Caching

Convex automatically caches query results. When multiple components query the same data, they share the cached result.

### Sync Control

Control when to sync data to reduce API usage:

```typescript
const syncService = getConvexSyncService();

// Disable syncing during high-traffic periods
syncService.setSyncEnabled(false);

// Re-enable later
syncService.setSyncEnabled(true);
```

## 🚀 Next Steps

1. **Run `npx convex dev`** to initialize your Convex deployment
2. **Check the Convex dashboard** to see your data in real-time
3. **Explore the functions** in the `convex/` directory
4. **Build new features** using Convex queries and mutations!

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex + Next.js Guide](https://docs.convex.dev/quickstart/nextjs)
- [Convex Dashboard](https://dashboard.convex.dev)

## 🆘 Troubleshooting

### "NEXT_PUBLIC_CONVEX_URL is not set"

Run `npx convex dev` to create your `.env.local` file.

### "Cannot find module 'convex/_generated/api'"

Run `npx convex dev` to generate TypeScript types.

### Trades not syncing

Check the browser console for sync errors. Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly.

### Slow queries

Check the Convex dashboard for slow queries. Add indexes if needed (already included in schema).

---

**Built with Convex** ⚡ Real-time backend as a service