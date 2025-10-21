# 🚀 Frontend Integration Checklist

**Goal**: Connect Convex backend to your UI (2-4 hours)

---

## ✅ Pre-Flight Check

- [x] Convex backend deployed
- [x] Schema created (5 tables)
- [x] Functions created (30+ functions)
- [x] Cron jobs scheduled
- [x] Configuration set up
- [ ] `.env.local` has `NEXT_PUBLIC_CONVEX_URL`

**Verify**: Run `npx convex dev` - should show "Convex functions ready!"

---

## 📋 Phase 2: Frontend Integration

### Step 1: Create Activity Tracker Service (30 mins)

**File**: `services/activityTracker.ts`

```typescript
// Create new file with:
- ActivityTracker class
- Buffer for 5-minute window
- Track methods (orderbook, trade, order, liquidity)
- Flush method (calls Convex every 5 mins)
- Surge detection logic
```

**Checklist**:
- [ ] Create `services/activityTracker.ts`
- [ ] Implement event buffering
- [ ] Add flush timer (5 min interval)
- [ ] Import Convex mutation
- [ ] Export singleton instance

**Test**: `activityTracker.trackTrade('test-market', 100)` should buffer event

---

### Step 2: Integrate with WebSocket (30 mins)

**File**: `services/realtime.ts` (modify existing)

**Find your WebSocket message handlers and add:**

```typescript
import { activityTracker } from './activityTracker';

// For trade events:
activityTracker.trackTrade(marketId, volumeUSD);

// For orderbook updates:
activityTracker.trackOrderbookUpdate(marketId);

// For orders:
activityTracker.trackOrder(marketId, 'placed' | 'cancelled');

// For liquidity:
activityTracker.trackLiquidity(marketId, 'add' | 'remove');
```

**Checklist**:
- [ ] Find WebSocket message handlers
- [ ] Add track calls for trades
- [ ] Add track calls for orderbook updates
- [ ] Add track calls for orders (if available)
- [ ] Add track calls for liquidity (if available)
- [ ] Test in browser console

**Test**: Open DevTools, trigger WebSocket events, verify tracking calls

---

### Step 3: Create UI Components (1 hour)

#### Component 1: GlobalBusynessIndicator.tsx

**File**: `components/GlobalBusynessIndicator.tsx`

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
// ... implement
```

**Checklist**:
- [ ] Create component file
- [ ] Use `useQuery(api.activity.getGlobalBusyness)`
- [ ] Display busyness ratio
- [ ] Add emoji indicator (🔥⬆️⚡⬇️)
- [ ] Add tooltip for 7-day comparison
- [ ] Style with existing theme

**Test**: Should show "Polymarket: ⚡ Normal activity" initially

---

#### Component 2: MarketBusynessIndicator.tsx

**File**: `components/MarketBusynessIndicator.tsx`

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
// ... implement
```

**Checklist**:
- [ ] Create component file
- [ ] Accept `marketId` prop
- [ ] Use `useQuery(api.activity.getMarketBusyness, { marketId })`
- [ ] Display busyness indicator
- [ ] Add tooltip with vs24h and vs7d
- [ ] Return null if market not trending

**Test**: Should show badge only for trending markets

---

#### Component 3: TrendingMarketsSection.tsx

**File**: `components/TrendingMarketsSection.tsx`

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
// ... implement
```

**Checklist**:
- [ ] Create component file
- [ ] Use `useQuery(api.trending.getTrendingMarkets, { limit: 20 })`
- [ ] Display top 20 markets
- [ ] Show activity score
- [ ] Show percentile rank
- [ ] Include MarketBusynessIndicator for each
- [ ] Add loading state

**Test**: Should show "🔥 Trending Markets" with top 20 list

---

#### Component 4: ActivitySparkline.tsx

**File**: `components/ActivitySparkline.tsx`

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LineChart, Line } from 'recharts';
// ... implement
```

**Checklist**:
- [ ] Create component file
- [ ] Use `useQuery(api.activity.getActivityHistory, { ... })`
- [ ] Render mini sparkline chart
- [ ] Support global and per-market views
- [ ] Add time range prop (default 2 hours)

**Test**: Should show activity line chart

---

### Step 4: Add to Dashboard (15 mins)

**File**: `app/page.tsx` (modify existing)

```typescript
import { GlobalBusynessIndicator } from '@/components/GlobalBusynessIndicator';
import { TrendingMarketsSection } from '@/components/TrendingMarketsSection';
```

**Checklist**:
- [ ] Import components
- [ ] Add GlobalBusynessIndicator to header/top
- [ ] Add TrendingMarketsSection as new section
- [ ] Adjust layout/spacing
- [ ] Ensure ConvexProvider wraps everything

**Test**: Full dashboard should show all new features

---

### Step 5: Test End-to-End (30 mins)

#### Backend Tests
- [ ] Open Convex dashboard: https://dashboard.convex.dev/d/fabulous-gnu-779
- [ ] Verify tables exist (activitySnapshots, trendingMarkets, etc.)
- [ ] Check cron jobs are scheduled
- [ ] Monitor logs for any errors

#### Frontend Tests
- [ ] Activity tracker captures events
- [ ] Flush happens every 5 minutes
- [ ] Data appears in Convex dashboard
- [ ] GlobalBusynessIndicator updates
- [ ] TrendingMarketsSection populates
- [ ] MarketBusynessIndicator shows on trending markets
- [ ] Sparklines render correctly

#### Integration Tests
- [ ] Generate test activity (browse markets, trigger trades)
- [ ] Wait 5 minutes for flush
- [ ] Verify data in Convex dashboard
- [ ] Wait 15 minutes for trending recalc
- [ ] Check trending markets update
- [ ] Verify busyness calculations accurate

---

## 🐛 Troubleshooting

### Activity Tracker Not Working
- Check import path: `import { activityTracker } from '@/services/activityTracker'`
- Verify flush timer started: Check for `setInterval` call
- Check Convex mutation imported: `import { api } from '@/convex/_generated/api'`
- Look for errors in browser console

### No Data in Convex
- Verify `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Check ConvexProvider wraps app in `layout.tsx`
- Run `npx convex dev` to regenerate types
- Check Network tab for failed mutations

### Components Not Rendering
- Verify ConvexProvider is in place
- Check for TypeScript errors
- Run `npm run dev` and check terminal
- Clear `.next` cache: `rm -rf .next`

### Busyness Shows "Normal" Always
- Need actual activity data first
- Wait at least 1 hour for baselines
- Generate test activity by browsing
- Check Convex dashboard for snapshots

---

## 📊 Verification Steps

### After 5 Minutes
- [ ] Check Convex dashboard → activitySnapshots table
- [ ] Should see first 5min snapshot
- [ ] Global metrics should be populated

### After 1 Hour
- [ ] Should see 12+ snapshots (5min granularity)
- [ ] First hourly aggregate created
- [ ] Baselines start calculating

### After 15 Minutes
- [ ] Trending markets calculated
- [ ] Check trendingMarkets table
- [ ] UI shows trending section

### After 24 Hours
- [ ] Daily aggregate created
- [ ] Old 5min snapshots cleaned up
- [ ] Storage stats logged

---

## 🎯 Success Criteria

- ✅ Activity tracker captures all WebSocket events
- ✅ Data flushes to Convex every 5 minutes
- ✅ Snapshots appear in database
- ✅ Trending markets calculate every 15 minutes
- ✅ UI components render without errors
- ✅ Busyness indicators show accurate ratios
- ✅ Real-time updates work (no refresh needed)
- ✅ Storage stays under 100MB

---

## 📈 Monitoring (Ongoing)

### Daily Checks
- [ ] Check Convex dashboard for errors
- [ ] Review storage usage (should be ~1-2MB)
- [ ] Verify cron jobs ran successfully
- [ ] Check trending markets are accurate

### Weekly Checks
- [ ] Review trending algorithm performance
- [ ] A/B test different activity score weights
- [ ] Analyze user engagement with features
- [ ] Tune thresholds based on data

### Monthly Checks
- [ ] Export data for analysis
- [ ] Review and adjust configuration
- [ ] Plan feature enhancements
- [ ] Update documentation

---

## 🚀 Optional Enhancements

### Quick Wins (15 mins each)
- [ ] Add color coding to busyness indicators
- [ ] Add animation to trending badge
- [ ] Add click handlers to trending markets
- [ ] Add "Last updated" timestamp

### Medium Effort (1 hour each)
- [ ] Add activity history chart (24h view)
- [ ] Add market comparison modal
- [ ] Add export trending data button
- [ ] Add surge notification toast

### Long Term (4+ hours each)
- [ ] Implement user watchlists
- [ ] Add personalized notifications
- [ ] Build activity heatmap
- [ ] Create analytics dashboard

---

## 📚 Reference Files

- **Setup Guide**: `CONVEX_SETUP.md`
- **Features Guide**: `CONVEX_FEATURES_GUIDE.md`
- **Progress Tracking**: `CONVEX_IMPLEMENTATION_PROGRESS.md`
- **Quick Summary**: `CONVEX_SUMMARY.md`
- **Configuration**: `convex/lib/constants.ts`

---

## 🎉 When Complete

You'll have:
- ✅ Real-time activity monitoring
- ✅ Algorithmic trending markets
- ✅ Busyness indicators
- ✅ Surge detection
- ✅ Activity sparklines
- ✅ Automatic data management
- ✅ Production-ready system

**Estimated total time**: 2-4 hours

**Storage usage**: ~1.6MB (0.16% of free tier)

**User impact**: Unique insights competitors don't have!

---

**Need help?** Check documentation or Convex dashboard logs

**Ready to start?** Begin with Step 1: Create Activity Tracker Service