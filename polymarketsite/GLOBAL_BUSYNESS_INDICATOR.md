# Global Busyness Indicator

## Overview

The Global Busyness Indicator is a visual component that displays real-time market activity levels compared to historical baselines. It appears next to the "LIVE TRADES" header in the trade feed and provides at-a-glance insight into how busy the platform currently is.

## Features

### Visual Elements

1. **Color-Coded Horizontal Bar**
   - A 12px-wide horizontal bar that fills based on current activity ratio
   - Color changes dynamically based on busyness level
   - Smooth transitions between states (500ms duration)

2. **Status Label**
   - Text label showing current busyness level
   - Matches the color of the horizontal bar
   - Updates in real-time

3. **Detailed Tooltip (on hover)**
   - **Live Trades/Minute**: Real-time trade execution rate (calibrates over 30 seconds)
   - Current activity rate (events per minute from Convex)
   - Comparison vs 24-hour average
   - Comparison vs 7-day average
   - Baseline values for context
   - Visual legend of activity levels

## Busyness Levels

The indicator uses six distinct levels based on activity ratio:

| Level | Ratio Range | Color | Label | Description |
|-------|-------------|-------|-------|-------------|
| Very Quiet | 0.0 - 0.5x | Slate | Very Quiet | Minimal activity, well below baseline |
| Quiet | 0.5 - 0.8x | Blue | Quiet | Below normal activity levels |
| Normal | 0.8 - 1.5x | Green | Normal | Typical activity levels |
| Busy | 1.5 - 2.5x | Yellow | Busy | Above average activity |
| Very Busy | 2.5 - 4.0x | Orange | Very Busy | Significantly elevated activity |
| Extreme | 4.0x+ | Red | Extreme | Exceptional surge in activity |

## How It Works

### Data Source

The indicator queries `getGlobalBusyness` from Convex, which:
1. Retrieves the last hour of 5-minute activity snapshots
2. Calculates average event rate for the current hour
3. Compares against 24-hour baseline (previous 23 hours)
4. Compares against 7-day baseline (using hourly snapshots for efficiency)

### Activity Metrics

The indicator tracks two types of metrics:

#### Live Local Metrics (Client-side)
- **Trades Per Minute**: Real-time rate of trade executions
  - Calculated locally from WebSocket trade feed
  - Requires 30-second calibration period
  - Shows progress bar during calibration
  - Displays total tracked trades
  - Updates immediately when new trades arrive

#### Aggregated Convex Metrics (Server-side)
- **Orderbook requests**: Market depth checks and updates
- **Trade events**: Executed trades
- **Order events**: New orders, cancellations, modifications
- **Liquidity events**: Market maker activity

### Calculation

```typescript
// Live local calculation (client-side)
tradesPerMinute = totalTradesSinceStart / elapsedMinutes

// Convex aggregated calculation (server-side)
currentRate = totalEvents / snapshotCount
vs24hRatio = currentRate / twentyFourHourBaseline
vs7dRatio = currentRate / sevenDayBaseline
```

The primary indicator uses `vs24hRatio`, while the tooltip shows both local and aggregated metrics.

## Implementation Details

### Component Location
- **File**: `components/GlobalBusynessIndicator.tsx`
- **Integration**: `components/TradeFeed.tsx` (next to LIVE TRADES header)

### Dependencies
- `convex/react` - Real-time data queries
- `@radix-ui/react-tooltip` - Tooltip UI
- `components/ui/tooltip` - Tooltip wrapper component
- `hooks/useActivityTracker` - Local orders-per-second tracking

### Convex Queries Used
- `api.activity.getGlobalBusyness` - Primary data source

### Custom Hooks Used
- `useActivityTracker()` - Tracks local trade activity
  - Returns: `tradesPerMinute`, `totalTrades`, `isCalibrated`, `calibrationProgress`, `elapsedSeconds`, `lastTradeTime`
  - Calibration: 30 seconds required for accurate metrics
  - Update frequency: 1 second
  - Counts actual trades from WebSocket feed

### Props
None - component is self-contained and handles its own data fetching.

## Responsive Design

The component adapts to different screen sizes:
- **Bar width**: Fixed at 48px (12 tailwind units)
- **Bar height**: 1.5px (6 tailwind units)
- **Label size**: 
  - Mobile: 10px
  - Desktop: 11px
- **Tooltip**: Adjusts position to stay on screen

## Loading & Calibration States

### Convex Data Loading
When Convex data is loading:
- Shows pulsing gray bar
- Displays "LOADING..." label
- Maintains same layout dimensions

### Local Metric Calibration
During the 30-second calibration period:
- Shows "Calibrating..." with percentage
- Displays progress bar
- Updates every second
- After calibration, shows live orders/second

## Performance Considerations

1. **Real-time Updates**: Component automatically re-renders when Convex data changes
2. **Tooltip Delay**: 0ms delay for instant feedback
3. **Transition Smoothing**: 500ms transitions prevent jarring changes
4. **Query Optimization**: Uses indexed Convex queries for fast retrieval

## Future Enhancements

Possible improvements for future iterations:

1. **Sparkline Integration**: Mini activity chart in tooltip
2. **Historical Comparison**: Show same time yesterday/last week
3. **Market Segmentation**: Break down by market category
4. **Alert Thresholds**: Notify users when extreme activity occurs
5. **Time-of-Day Context**: Adjust baselines for typical daily patterns
6. **Predictive Indicators**: Show trending direction (increasing/decreasing)

## Troubleshooting

### Indicator Always Shows "Loading"
- Check Convex deployment status
- Verify `ConvexProvider` is wrapping the component
- Ensure activity data is being recorded (check `convex/activity.ts`)

### Trades Per Minute Shows 0 or "Calibrating" Forever
- Verify WebSocket connection is active
- Check that trade data is flowing in Zustand store
- Ensure `usePolymarketStore` has `trades` array populated
- Wait full 30 seconds for calibration
- Check browser console for errors in `useActivityTracker`
- Verify trades are being added to the store (check `trades.length`)

### Colors Not Showing Correctly
- Verify Tailwind CSS classes are being processed
- Check theme configuration in `tailwind.config.ts`

### Tooltip Not Appearing
- Ensure `@radix-ui/react-tooltip` is installed
- Check that `TooltipProvider` is not nested incorrectly
- Verify z-index stacking context

## Related Documentation

- [Convex Features Guide](./CONVEX_FEATURES_GUIDE.md)
- [Convex Setup](./CONVEX_SETUP.md)
- [Activity Tracking](./convex/activity.ts)
- [Frontend Integration Checklist](./FRONTEND_INTEGRATION_CHECKLIST.md)
- [Activity Tracker Hook](./hooks/useActivityTracker.ts)