# 🚀 Convex Implementation Progress

**Status**: Phase 1 Complete - Backend Foundation Ready ✅  
**Date**: 2024  
**Free Tier Safe**: ✅ Estimated ~1.6MB storage (well under 1GB limit)

---

## ✅ Completed: Backend Foundation (Phase 1)

### 1. Schema Design ✅
**File**: `convex/schema.ts`

Lean, efficient schema with 5 tables:

- **activitySnapshots** - Time-series activity metrics (5min, 1hour, 1day granularities)
- **trendingMarkets** - Top markets by activity (auto-expires when not trending)
- **marketBaselines** - Rolling averages for busyness calculation
- **cryptoPrices** - Real-time crypto prices (7-day retention)
- **users** - User profiles and watchlists (for future auth)

**Removed** (too large for free tier):
- ❌ trades, comments, reactions, orderbooks, priceChanges, events, analytics

### 2. Configuration System ✅
**File**: `convex/lib/constants.ts`

Centralized configuration with:
- Activity score weights (35% volume, 30% trades, 20% orderbook, 15% liquidity)
- Busyness thresholds (150% = "much busier", 110% = "busier", 90% = "normal")
- Trending thresholds (top 10% percentile OR absolute minimums)
- Data retention periods (24h/7d/30d by granularity)
- Helper functions for scoring and classification

**All values easily adjustable for tuning!**

### 3. Activity Tracking Functions ✅
**File**: `convex/activity.ts`

Functions implemented:
- `recordActivityBatch()` - Accept batched events from frontend (every 5min)
- `getCurrentActivity()` - Get latest activity snapshot
- `getActivityHistory()` - Get time-series data for charts
- `getMarketActivity()` - Market-specific activity history
- `getGlobalBusyness()` - Calculate platform busyness (1hr vs 24hr & 7day)
- `getMarketBusyness()` - Calculate market busyness scores
- `getActivitySummary()` - Aggregate statistics
- `maybeCreateAggregates()` - Auto-create hourly/daily rollups

**Features**:
- Automatic hourly and daily aggregation from 5-minute snapshots
- Busyness calculation with dual time windows (1hr vs 24hr, 1hr vs 7day)
- Efficient querying with proper indexes

### 4. Trending Market Functions ✅
**File**: `convex/trending.ts`

Functions implemented:
- `getTrendingMarkets()` - Get top N trending markets for UI
- `getTrendingMarket()` - Get specific market details
- `isMarketTrending()` - Check if market is trending
- `getMarketsByPercentile()` - Query by percentile rank
- `upsertTrendingMarket()` - Update/create trending market
- `recalculateTrending()` - Main trending calculation (runs every 15min)
- `detectSurge()` - Detect 200%+ activity spikes
- `updateBaselines()` - Update rolling averages for all trending markets

**Logic**:
- Percentile-based ranking (top 10%)
- Activity score formula (configurable weights)
- Fallback to absolute thresholds ($10K liquidity, $5K volume/day, 50 trades/day)
- Auto-expiration for markets that stop trending
- Surge detection for immediate recalculation

### 5. Cleanup Functions ✅
**File**: `convex/cleanup.ts`

Functions implemented:
- `deleteExpiredSnapshots()` - Remove old activity snapshots
- `deleteStaleMarkets()` - Remove markets no longer trending
- `deleteExpiredBaselines()` - Remove old baseline data
- `deleteOldCryptoPrices()` - Keep only latest & last 7 days
- `getStorageStats()` - Monitor storage usage
- `runAllCleanup()` - Run all cleanup tasks at once

**Retention Strategy**:
- 5min snapshots: 24 hours (288 docs max)
- 1hour snapshots: 7 days (168 docs max)
- 1day snapshots: 30 days (30 docs max)
- Trending markets: While trending + 24h grace period
- Crypto prices: Latest + 7 days history

### 6. Cron Jobs ✅
**File**: `convex/crons.ts`

Scheduled tasks:
- **Every 15 minutes**: Recalculate trending markets
- **Every 6 hours**: Update market baselines
- **Daily 00:00 UTC**: Clean expired snapshots
- **Daily 01:00 UTC**: Clean stale markets
- **Daily 01:30 UTC**: Clean expired baselines
- **Daily 02:00 UTC**: Clean old crypto prices
- **Daily 03:00 UTC**: Generate storage stats

---

## 🔨 TODO: Frontend Integration (Phase 2)

### 1. Activity Tracker Service ⏳
**File**: `services/activityTracker.ts` (needs creation)

**Requirements**:
```typescript
class ActivityTracker {
  // Buffer events in memory (5min window)
  private eventBuffer: {
    orderbookRequests: Map<marketId, count>,
    tradeEvents: Map<marketId, count>,
    orderEvents: Map<marketId, count>,
    liquidityEvents: Map<marketId, count>,
    uniqueUsers: Set<walletAddress>,
  }
  
  // Track events from WebSocket
  trackOrderbookUpdate(marketId)
  trackTrade(marketId, volumeUSD)
  trackOrder(marketId, type: "placed" | "cancelled")
  trackLiquidity(marketId, type: "add" | "remove")
  
  // Flush to Convex every 5 minutes
  async flush()
  
  // Detect surges (200%+ activity spike)
  detectSurge(marketId, currentRate)
}
```

**Integration Points**:
- Hook into existing WebSocket service (`services/realtime.ts`)
- Call `trackXXX()` methods when events arrive
- Auto-flush every 5 minutes via setInterval
- Call Convex mutation `recordActivityBatch()`

### 2. UI Components ⏳

#### GlobalBusynessIndicator.tsx
```tsx
// Header badge showing platform-wide activity
// "Polymarket: 🔥 2.3x busier than usual"
// Hover: "vs 7-day: 1.8x"
// Query: getGlobalBusyness()
// Updates every 5 minutes
```

#### MarketBusynessIndicator.tsx
```tsx
// Per-market badge for trending markets
// "⬆️ Busier than usual (1.4x)"
// Hover: "vs 24hr: 1.4x, vs 7d: 1.2x"
// Query: getMarketBusyness(marketId)
// Only shown for trending markets
```

#### TrendingMarketsSection.tsx
```tsx
// Top 20 trending markets list
// Shows: Title, activity score, busyness indicator
// Query: getTrendingMarkets(20)
// Real-time updates via Convex subscription
```

#### ActivitySparkline.tsx
```tsx
// Mini chart showing activity over time
// Shows last 2-24 hours of activity
// Query: getActivityHistory(startTime, endTime, "5min")
// Used in both global and per-market views
```

### 3. Convex Provider Integration ⏳
**File**: `app/layout.tsx` (already has ConvexProvider)

**Needs**:
- Initialize ActivityTracker in a client component
- Start tracking when WebSocket connects
- Handle flush intervals

### 4. Existing Code Updates ⏳

#### services/realtime.ts
```typescript
// Add activity tracker integration
import { activityTracker } from './activityTracker';

// In message handlers:
case 'trade':
  activityTracker.trackTrade(marketId, volumeUSD);
  break;
case 'orderbook':
  activityTracker.trackOrderbookUpdate(marketId);
  break;
// etc...
```

#### Update crypto prices sync
```typescript
// Change from old sync service to Convex mutation
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const updatePrice = useMutation(api.crypto.updateCryptoPrice);
```

---

## 📊 Storage Estimates (Free Tier)

| Table | Max Docs | Size/Doc | Total |
|-------|----------|----------|-------|
| activitySnapshots | ~486 | ~2KB | ~1MB |
| trendingMarkets | ~50 | ~1KB | ~50KB |
| marketBaselines | ~50 | ~0.5KB | ~25KB |
| cryptoPrices | ~50 | ~0.5KB | ~25KB |
| users | ~1000 | ~0.5KB | ~500KB |
| **TOTAL** | | | **~1.6MB** ✅ |

**Free tier limit**: 1GB (we're using 0.16%!)

---

## 🎯 Features Enabled

### Immediate (Phase 2)
- ✅ "Polymarket is busier than usual" global indicator
- ✅ "This market is busier than usual" per-market badge
- ✅ Trending markets section (top 20)
- ✅ Activity sparklines
- ✅ Automatic surge detection

### Future (Phase 3)
- 📊 Historical activity charts (24h, 7d, 30d views)
- 📈 Market comparison view
- 📁 Export trending data
- 🔔 User watchlists (when auth ready)
- 🎚️ A/B test activity score weights

---

## 🔧 Configuration Tuning

All thresholds are in `convex/lib/constants.ts`:

**Activity Score Weights** (line 16):
```typescript
volume: 0.35,      // Adjust if volume matters more/less
trades: 0.30,      // Adjust for participation breadth
orderbook: 0.20,   // Adjust for interest proxy
liquidity: 0.15,   // Adjust for market quality
```

**Busyness Thresholds** (line 39):
```typescript
muchBusier: 1.50,  // 150%+ (adjust sensitivity)
busier: 1.10,      // 110-150%
normal: 0.90,      // 90-110%
```

**Trending Criteria** (line 73):
```typescript
percentile: 0.10,      // Top 10% (make more/less selective)
minLiquidity: 10000,   // $10K min (adjust barrier)
minVolume24h: 5000,    // $5K min
minTrades24h: 50,      // 50 trades min
maxTrendingDisplay: 20,// Show top 20 (adjust UI count)
```

---

## 📝 Next Steps

### Phase 2: Frontend Integration (Next)
1. [ ] Create `services/activityTracker.ts`
2. [ ] Integrate with WebSocket handlers
3. [ ] Create UI components (4 components)
4. [ ] Add to main dashboard layout
5. [ ] Test activity tracking end-to-end
6. [ ] Verify storage stays under limits

### Phase 3: Polish & Optimization (Later)
1. [ ] Add historical charts
2. [ ] Market comparison view
3. [ ] Export functionality
4. [ ] A/B test weights
5. [ ] Performance monitoring
6. [ ] User watchlists (requires auth)

---

## 🧪 Testing Checklist

### Backend (Complete ✅)
- [x] Schema deploys successfully
- [x] All queries compile
- [x] All mutations compile
- [x] Cron jobs registered
- [x] Indexes created

### Frontend (TODO)
- [ ] Activity tracker captures events
- [ ] Batch flush works every 5 minutes
- [ ] Busyness calculations are accurate
- [ ] Trending markets update every 15 min
- [ ] Surge detection triggers recalc
- [ ] UI components render correctly
- [ ] Real-time updates work via Convex subscriptions

### Data Lifecycle (TODO)
- [ ] Old snapshots auto-delete after retention period
- [ ] Stale markets auto-delete after 24h
- [ ] Crypto prices deduplicated correctly
- [ ] Storage stays under 100MB (safety margin)

---

## 📖 Documentation

- **Setup Guide**: `CONVEX_SETUP.md` (needs update with new schema)
- **Configuration**: `convex/lib/constants.ts` (inline comments)
- **This Document**: Progress tracking and TODOs

---

## 💡 Suggestions for Database Features

Based on the refined implementation, here's how we can use Convex to improve the site:

### 1. Activity Intelligence ✅ (Implemented)
- **What**: Real-time busyness indicators for platform and markets
- **Impact**: Users know when to pay attention (high activity = important events)
- **UI**: Badges, sparklines, trending section

### 2. Trending Markets Discovery ✅ (Implemented)
- **What**: Algorithmic discovery of hot markets
- **Impact**: Surface interesting markets users might miss
- **UI**: Dedicated "🔥 Trending" section

### 3. Historical Context (Phase 3)
- **What**: "This market is 2x busier than yesterday"
- **Impact**: Users understand market dynamics better
- **Data**: 30 days of daily aggregates (tiny storage)

### 4. Market Comparison (Phase 3)
- **What**: Compare activity across similar markets
- **Impact**: Find the most liquid/active version of a bet
- **UI**: Side-by-side comparison view

### 5. User Watchlists (Phase 4)
- **What**: Save favorite markets, get notified when they trend
- **Impact**: Personalized experience, user engagement
- **Data**: Tiny (50KB per 1000 users)

### 6. Smart Caching (Built-in)
- **What**: Convex automatically caches market metadata
- **Impact**: Faster loads, fewer API calls to Polymarket
- **Bonus**: Free tier includes generous caching

### 7. Activity Heatmap (Future)
- **What**: Visual heatmap showing when markets are most active
- **Impact**: Users can time their participation
- **Data**: Use existing daily aggregates

### 8. Volume Alerts (Future)
- **What**: "Market X just hit $100K in volume"
- **Impact**: Catch important milestones
- **Tech**: Use surge detection infrastructure

---

## 🎉 Summary

**What we built**:
- Complete backend for activity monitoring
- Trending market calculation system
- Automatic data cleanup for free tier
- Configuration system for easy tuning
- Foundation for advanced features

**What's left**:
- Frontend integration (activity tracker service)
- UI components (4 components)
- End-to-end testing
- Documentation updates

**Estimated completion time**: 2-4 hours for Phase 2

**Storage efficiency**: Using 0.16% of free tier limit! 🎯