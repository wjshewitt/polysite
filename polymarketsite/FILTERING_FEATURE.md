# Trade & Orderbook Filtering Feature

## Overview

Added subtle, in-line filtering controls to both the Live Trades feed and Orderbook Depth components. The filters allow users to focus on high-value and high-conviction trades while maintaining the site's minimalist, monospace aesthetic.

## Features

### 1. Live Trades Filtering (`TradeFeed.tsx`)

**Filter Button**
- Located next to the trade count in the header
- Shows active filter count: `FILTER (2)` when filters are applied
- Changes color to buy-green when filters are active
- Subtle border transitions on hover

**Filter Options**

1. **Minimum Value Filter**
   - Input field for minimum trade value in dollars
   - Filters trades where `price × size < minValue`
   - Step increment: $10
   - Clear button (✕) appears when value is set

2. **High Conviction Filter**
   - Toggle button with checkmark when active
   - Filters for trades with extreme prices (≤15¢ or ≥85¢)
   - Indicates strong market sentiment
   - Help tooltip with "?" explaining the threshold
   - Green highlight when active

**UI Details**
- Collapsible filter panel (hidden by default)
- Border-bottom separator when expanded
- Monospace font throughout
- Responsive text sizes (11px on mobile, 12px on desktop)
- "CLEAR ALL" button to reset filters
- Real-time filtering (no apply button needed)

### 2. Orderbook Depth Filtering (`OrderbookDepth.tsx`)

**Filter Button**
- Located next to AUTO/MANUAL refresh toggle
- Shows active filter count
- Green highlight when filters are active

**Filter Options**

1. **Minimum Size Filter**
   - Input field for minimum order size
   - Filters out small orders from both bid and ask sides
   - Step increment: 10
   - Shows filtered count vs total: `15/23` when active

2. **Maximum Spread Filter**
   - Input field for maximum spread percentage
   - Hides entire orderbook if spread exceeds threshold
   - Shows warning banner: "⚠ SPREAD TOO WIDE: X.XX% exceeds Y.YY% threshold"
   - Step increment: 0.5%
   - Useful for identifying illiquid markets

**UI Details**
- Collapsible filter panel
- Red warning banner when spread threshold is exceeded
- Level counts updated to show filtered/total
- Maintains depth visualization based on filtered data
- All filtering happens client-side for instant feedback

## Implementation Details

### State Management

**TradeFeed.tsx**
```typescript
const [minValue, setMinValue] = useState<number>(0);
const [highConvictionOnly, setHighConvictionOnly] = useState(false);
const [filtersExpanded, setFiltersExpanded] = useState(false);
```

**OrderbookDepth.tsx**
```typescript
const [minSize, setMinSize] = useState<number>(0);
const [maxSpread, setMaxSpread] = useState<number>(0);
const [filtersExpanded, setFiltersExpanded] = useState(false);
```

### Filter Logic

**Trade Value Calculation**
```typescript
const tradeValue = parseFloat(trade.price) * parseFloat(trade.size);
```

**High Conviction Detection**
```typescript
const price = parseFloat(trade.price);
const isHighConviction = price <= 0.15 || price >= 0.85;
```

**Spread Calculation**
```typescript
const spread = parseFloat(asks[0].price) - parseFloat(bids[0].price);
const spreadPercent = (spread / parseFloat(bids[0].price)) * 100;
```

### Performance Considerations

1. **useCallback Hook**: `filterTrades` function is memoized to prevent unnecessary re-renders
2. **Client-Side Filtering**: All filtering happens in the browser for instant feedback
3. **No Server Load**: Filters don't require additional API calls
4. **Efficient Updates**: Filters only re-run when dependencies change

## Visual Design

### Color Scheme
- **Active Filters**: Buy-green (`text-buy`, `border-buy`)
- **Inactive Filters**: Muted gray with hover transitions
- **Warnings**: Sell-red (`text-sell`, `bg-sell/10`)
- **Backgrounds**: Subtle transparency (`bg-buy/5`)

### Typography
- Font: JetBrains Mono (monospace)
- Sizes: 11px mobile, 12px desktop
- Weight: Regular for labels, bold for active states

### Spacing
- Consistent gap-2 to gap-4 between elements
- Border separators for visual hierarchy
- Compact layout to preserve screen real estate

### Interaction States
- Border transitions on hover
- Color changes for active states
- Clear buttons (✕) appear on input
- Underlined "CLEAR ALL" link

## Usage Examples

### Example 1: Filter High-Value Trades
1. Click "FILTER" button on Live Trades
2. Set "MIN VALUE" to 100
3. See only trades worth $100+
4. Button shows "FILTER (1)"

### Example 2: High Conviction Only
1. Click "FILTER" button
2. Toggle "HIGH CONVICTION ✓"
3. See only trades with price ≤15¢ or ≥85¢
4. Tooltip explains the threshold

### Example 3: Clean Orderbook View
1. Open Orderbook Depth
2. Click "FILTER" button
3. Set "MIN SIZE" to 50
4. See only significant orders
5. Level count shows: `8/20` (8 filtered from 20 total)

### Example 4: Avoid Wide Spreads
1. Open Orderbook Depth
2. Click "FILTER" button
3. Set "MAX SPREAD" to 2%
4. Markets with spread >2% show warning banner
5. Orderbook levels are hidden until spread improves

## Testing Checklist

- [x] Filter button shows/hides filter panel
- [x] Active filter count displays correctly
- [x] Minimum value filter works on TradeFeed
- [x] High conviction filter identifies extreme prices
- [x] Minimum size filter works on orderbook
- [x] Maximum spread filter shows warning
- [x] Clear buttons reset individual filters
- [x] "CLEAR ALL" resets all filters
- [x] Filtered counts display correctly
- [x] Colors match site aesthetic
- [x] Responsive text sizes work on mobile
- [x] No React warnings or errors
- [x] useCallback prevents unnecessary re-renders

## Files Modified

1. **`components/TradeFeed.tsx`**
   - Added filter state management
   - Implemented filterTrades function with useCallback
   - Added collapsible filter UI
   - Updated trade display logic

2. **`components/OrderbookDepth.tsx`**
   - Added filter state management
   - Implemented filterLevels function
   - Added collapsible filter UI
   - Added spread warning banner
   - Updated level counts to show filtered/total

## Future Enhancements

Potential improvements:
- [ ] Persist filter settings in localStorage
- [ ] Add preset filter configurations
- [ ] Add "Favorites" quick-filter buttons
- [ ] Add time-based filters (e.g., last 5 minutes)
- [ ] Add outcome-based filters (specific markets)
- [ ] Add volume-based filters
- [ ] Add keyboard shortcuts for common filters
- [ ] Add filter analytics (most used filters)

## Accessibility

- Clear button labels and tooltips
- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements
- Screen reader friendly
- High contrast colors

## Browser Compatibility

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Notes

- Filters are client-side only and don't persist across sessions
- No backend changes required
- Zero performance impact when filters are inactive
- Filters are independent and can be combined
- UI remains subtle and doesn't clutter the interface
- Monospace aesthetic maintained throughout

## Visual Layout

### TradeFeed Filter UI

```
┌─────────────────────────────────────────────────────────────┐
│ LIVE TRADES  [●●●]  [⏸ PAUSED]  [FILTER (2)]  [100 TRADES] │
├─────────────────────────────────────────────────────────────┤
│ MIN VALUE: $[___100___] ✕  [HIGH CONVICTION ✓] ?  CLEAR ALL│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Trade Item 1 (filtered results)                         │ │
│ │ Trade Item 2                                            │ │
│ │ Trade Item 3                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### OrderbookDepth Filter UI

```
┌─────────────────────────────────────────────────────────────┐
│ ORDERBOOK DEPTH              [FILTER (2)]  [AUTO ✓]         │
├─────────────────────────────────────────────────────────────┤
│ MIN SIZE: [___50___] ✕  MAX SPREAD: [__2.5__]% ✕  CLEAR ALL│
├─────────────────────────────────────────────────────────────┤
│ Market Info...                                              │
├─────────────────────────────────────────────────────────────┤
│ ⚠ SPREAD TOO WIDE: 3.45% exceeds 2.50% threshold           │
├─────────────────────────────────────────────────────────────┤
│  ASKS (Sell)         │         BIDS (Buy)                   │
│  PRICE │ SIZE │ TOTAL│ PRICE │ SIZE │ TOTAL                 │
│  ─────────────────────────────────────────────────          │
│  0.8523│  150 │ 127.8│ 0.8234│  200 │ 164.7                 │
│  0.8521│   75 │  63.9│ 0.8232│  180 │ 148.2                 │
├─────────────────────────────────────────────────────────────┤
│ Spread: 0.0289 (3.51%)  Levels: 15/23 / 12/19  [timestamp] │
└─────────────────────────────────────────────────────────────┘
```

## Color Legend

- **[FILTER (2)]** - Green when active (`border-buy text-buy`)
- **[HIGH CONVICTION ✓]** - Green background when toggled (`bg-buy/5`)
- **⚠ Warning** - Red text and background (`text-sell bg-sell/10`)
- **✕** - Muted gray, white on hover
- **CLEAR ALL** - Underlined link, muted gray