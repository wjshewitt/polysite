# Advanced Live Data Filters - Complete Guide

## 🎯 Overview

The Live Data subtab now features a comprehensive advanced filtering system that provides granular control over both trade feeds and orderbook depth display. All filters work in real-time and are applied across both panels simultaneously.

## ✨ Key Features

### 1. Unified Filter Panel
- Single control panel for all filters
- Applies to both TradeFeed and OrderbookDepth
- Real-time filtering (no apply button needed)
- Collapsible interface to save screen space
- Active filter count display

### 2. Filter Categories

#### **Quick Filters** (Always Visible When Expanded)
- Trade Side (BUY/SELL/ALL)
- Time Range (1m, 5m, 15m, 1h, All)
- Sort By (Time, Value, Size, Price)
- Sort Direction (Ascending/Descending)
- High Conviction Toggle
- Large Trades Only Toggle

#### **Value Filters**
- Min Trade Value ($)
- Max Trade Value ($)
- Min Order Size
- Max Spread (%)

#### **Advanced Options** (Collapsible Sub-section)
- Min Price ($0.00 - $1.00)
- Max Price ($0.00 - $1.00)
- Market Search (text filter)
- Hide Dust Trades (checkbox)

#### **Quick Presets**
- $100+ Trades
- High Conviction
- Whale Watch
- Tight Spreads
- Buy Flow

### 3. No Crypto Elements
- Crypto ticker removed from Live Data view
- Crypto prices panel removed from Live Data view
- CLOB authentication panel hidden on Live Data view
- Maximum vertical space for trades and orderbook
- Cleaner, focused interface
- Crypto ticker and prices still available on "All Markets" subtab

## 📋 Filter Reference

### Trade Side Filter
**Type**: Dropdown  
**Options**: ALL | BUY | SELL  
**Default**: ALL  
**Purpose**: Filter trades by order side

**Use Cases**:
- Track buying pressure (BUY only)
- Monitor selling activity (SELL only)
- Identify order flow imbalances

---

### Time Range Filter
**Type**: Dropdown  
**Options**: ALL TIME | 1 MIN | 5 MIN | 15 MIN | 1 HOUR  
**Default**: ALL TIME  
**Purpose**: Filter trades by recency

**Use Cases**:
- Focus on recent activity (1m, 5m)
- Identify short-term trends
- Filter out old data

---

### Sort By Filter
**Type**: Dropdown  
**Options**: TIME | VALUE | SIZE | PRICE  
**Default**: TIME  
**Purpose**: Sort trades by selected metric

**Descriptions**:
- **TIME**: Chronological order (newest/oldest)
- **VALUE**: Trade value (price × size)
- **SIZE**: Number of shares/contracts
- **PRICE**: Outcome price ($0-$1)

---

### Sort Direction
**Type**: Dropdown  
**Options**: DESC ↓ | ASC ↑  
**Default**: DESC  
**Purpose**: Control sort order

**Examples**:
- DESC with VALUE: Largest trades first
- ASC with PRICE: Lowest prices first
- DESC with TIME: Most recent first

---

### High Conviction Toggle
**Type**: Button Toggle  
**States**: ALL | HIGH ✓  
**Default**: ALL  
**Threshold**: Price ≤ $0.15 OR ≥ $0.85  
**Purpose**: Filter for extreme price trades

**Use Cases**:
- Find strong market sentiment
- Identify confident bets
- Spot potential opportunities
- Track conviction changes

---

### Large Trades Only
**Type**: Button Toggle  
**States**: ALL | LARGE ✓  
**Default**: ALL  
**Threshold**: Trade value ≥ $500  
**Purpose**: Filter for significant trades

**Use Cases**:
- Whale watching
- Ignore noise from small trades
- Track institutional activity
- Focus on market-moving trades

---

### Min Trade Value
**Type**: Number Input  
**Unit**: USD ($)  
**Range**: $0 - ∞  
**Default**: 0  
**Step**: $10  
**Purpose**: Set minimum trade value threshold

**Formula**: `price × size >= minTradeValue`

**Examples**:
- $100: Filter trades worth $100+
- $1000: Whale watch mode
- $50: Medium-value trades

---

### Max Trade Value
**Type**: Number Input  
**Unit**: USD ($)  
**Range**: $0 - ∞  
**Default**: 0 (disabled)  
**Step**: $10  
**Purpose**: Set maximum trade value threshold

**Formula**: `price × size <= maxTradeValue`

**Use Cases**:
- Exclude whale trades
- Focus on retail activity
- Define value range (min + max)

---

### Min Order Size
**Type**: Number Input  
**Unit**: Contracts  
**Range**: 0 - ∞  
**Default**: 0  
**Step**: 10  
**Purpose**: Filter orderbook by minimum size

**Applied To**: Both bid and ask levels  
**Effect**: Removes small orders from orderbook display

**Use Cases**:
- Focus on real liquidity
- Ignore dust orders
- Assess true market depth
- Clean orderbook view

---

### Max Spread
**Type**: Number Input  
**Unit**: Percent (%)  
**Range**: 0% - ∞  
**Default**: 0 (disabled)  
**Step**: 0.5%  
**Purpose**: Filter markets by spread threshold

**Formula**: `(bestAsk - bestBid) / bestBid × 100`

**Behavior**:
- If spread > threshold: Shows warning banner
- Orderbook levels hidden until spread improves
- Helps avoid illiquid markets

**Examples**:
- 2%: Tight spreads only
- 5%: Moderate liquidity
- 1%: Very liquid markets

---

### Min Price (Advanced)
**Type**: Number Input  
**Unit**: USD ($)  
**Range**: $0.00 - $1.00  
**Default**: 0.00  
**Step**: $0.01  
**Purpose**: Filter trades by minimum price

**Use Cases**:
- Focus on likely outcomes
- Exclude low-probability bets
- Define price range

---

### Max Price (Advanced)
**Type**: Number Input  
**Unit**: USD ($)  
**Range**: $0.00 - $1.00  
**Default**: 1.00  
**Step**: $0.01  
**Purpose**: Filter trades by maximum price

**Use Cases**:
- Focus on unlikely outcomes
- Exclude high-probability bets
- Find contrarian trades

---

### Market Search (Advanced)
**Type**: Text Input  
**Purpose**: Filter by market or outcome name  
**Search**: Case-insensitive partial match

**Searches In**:
- Market title
- Outcome name

**Examples**:
- "Trump": Shows Trump-related markets
- "Bitcoin": Crypto market trades
- "NFL": Sports markets

---

### Hide Dust Trades (Advanced)
**Type**: Checkbox  
**Default**: Unchecked  
**Threshold**: Trade value < $10  
**Purpose**: Remove very small trades

**Use Cases**:
- Clean up trade feed
- Focus on meaningful activity
- Reduce noise

## 🎨 UI Components

### Filter Panel Header
```
┌─────────────────────────────────────────────────────────┐
│ [▼] ADVANCED FILTERS (3)    100 TRADES | 15B / 12A     │
│                                            [RESET ALL]   │
└─────────────────────────────────────────────────────────┘
```

**Elements**:
- Expand/collapse chevron
- Active filter count (green)
- Trade count display
- Orderbook levels (Bids/Asks)
- Reset all button

### Quick Filters Row
```
┌─────┬──────┬─────────┬───────┬────────┬──────────┐
│SIDE │ TIME │ SORT BY │ ORDER │ CONVIC │   SIZE   │
│ ALL │ ALL  │  TIME   │ DESC  │  ALL   │   ALL    │
└─────┴──────┴─────────┴───────┴────────┴──────────┘
```

### Value Filters Row
```
┌────────────┬────────────┬──────────────┬────────────┐
│ MIN VALUE  │ MAX VALUE  │ MIN ORDER    │ MAX SPREAD │
│    $100    │     ∞      │     50       │    2.0%    │
└────────────┴────────────┴──────────────┴────────────┘
```

### Preset Buttons
```
[$100+ TRADES] [HIGH CONVICTION] [WHALE WATCH] [TIGHT SPREADS] [BUY FLOW]
```

## 🚀 Quick Start Examples

### Example 1: Day Trading Setup
**Goal**: Monitor medium-value trades with tight spreads

**Filters**:
- Min Trade Value: $50
- Max Spread: 2%
- Time Range: 5 MIN
- Sort By: TIME

**Result**: Recent trades ≥$50 in liquid markets

---

### Example 2: Whale Watching
**Goal**: Track large institutional trades

**Filters**:
- Min Trade Value: $1000
- Large Trades Only: ✓
- Sort By: VALUE

**Result**: Largest trades first, $1000+ only

---

### Example 3: Sentiment Analysis
**Goal**: Find strong conviction trades

**Filters**:
- High Conviction: ✓
- Min Trade Value: $100
- Sort By: SIZE

**Result**: Extreme price trades ≥$100, by size

---

### Example 4: Scalping Setup
**Goal**: Quick trades in tight markets

**Filters**:
- Time Range: 1 MIN
- Max Spread: 1%
- Min Order Size: 100
- Sort By: TIME

**Result**: Very recent trades in liquid markets

---

### Example 5: Market Search
**Goal**: Track specific market

**Filters**:
- Market Search: "Presidential Election"
- Sort By: VALUE
- Time Range: 15 MIN

**Result**: Election market trades, largest first

## 🎯 Filter Presets Explained

### $100+ Trades
**Applies**:
- Min Trade Value: $100

**Use For**: Filtering out noise, focusing on meaningful trades

---

### High Conviction
**Applies**:
- High Conviction: ✓
- Min Trade Value: $50

**Use For**: Finding strong market sentiment

---

### Whale Watch
**Applies**:
- Min Trade Value: $1000
- Large Trades Only: ✓

**Use For**: Tracking institutional/large traders

---

### Tight Spreads
**Applies**:
- Max Spread: 2%
- Min Order Size: 50

**Use For**: Finding liquid, tradeable markets

---

### Buy Flow
**Applies**:
- Trade Side: BUY
- Sort By: VALUE

**Use For**: Analyzing buying pressure

## 💡 Pro Tips

### Combining Filters
Filters work together (AND logic):
- **Min Value + High Conviction**: Large, confident trades
- **Time Range + Trade Side**: Recent buying/selling
- **Max Spread + Min Size**: Quality orderbook data
- **Search + Sort**: Specific market analysis

### Performance
- All filtering is client-side (instant)
- Zero backend load
- No API rate limits
- Works offline (with cached data)

### Workflow Tips
1. Start with presets
2. Adjust incrementally
3. Watch filter count
4. Use RESET ALL often
5. Experiment freely

### Common Combinations

**Scalper**:
- Time: 1 MIN
- Spread: 1%
- Size: 100+

**Swing Trader**:
- Time: 1 HOUR
- Value: $500+
- Conviction: HIGH

**Market Maker**:
- Spread: 3%
- Order Size: 50+
- Side: ALL

**News Trader**:
- Time: 5 MIN
- Sort: VALUE
- Direction: DESC

## 🔧 Technical Details

### Filter State Management
```typescript
interface LiveDataFilterState {
  // Trade filters
  minTradeValue: number;
  maxTradeValue: number;
  tradeSide: "ALL" | "BUY" | "SELL";
  highConviction: boolean;

  // Orderbook filters
  minOrderSize: number;
  maxSpreadPercent: number;

  // Market filters
  searchQuery: string;
  sortBy: "value" | "time" | "size" | "price";
  sortDirection: "asc" | "desc";

  // Advanced filters
  minPrice: number;
  maxPrice: number;
  timeRange: "1m" | "5m" | "15m" | "1h" | "all";
  showLargeOnly: boolean;
  hideSmallTrades: boolean;
}
```

### Filter Application Order
1. **Trade Side**: Filter by BUY/SELL
2. **Value Range**: Apply min/max trade value
3. **High Conviction**: Filter by price extremes
4. **Price Range**: Apply min/max price
5. **Time Range**: Filter by recency
6. **Large Only**: Filter by $500+ threshold
7. **Hide Dust**: Remove <$10 trades
8. **Search Query**: Text matching
9. **Sort**: Apply sorting
10. **Order**: Apply direction

### Override Mechanism
Filters pass through to TradeFeed and OrderbookDepth:

```typescript
<TradeFeed
  overrideTrades={filteredTrades}
  overrideFilters={{
    minValue: filters.minTradeValue,
    highConvictionOnly: filters.highConviction,
  }}
/>

<OrderbookDepth
  overrideFilters={{
    minSize: filters.minOrderSize,
    maxSpread: filters.maxSpreadPercent,
  }}
/>
```

### Performance Optimization
- `useMemo` for filtered trades
- `useCallback` for filter updates
- Efficient array operations
- No unnecessary re-renders

## 📊 Filter Statistics

### Active Filter Count
Displays in header: `ADVANCED FILTERS (3)`

**Counted As Active**:
- Non-zero numeric values
- Non-default selections
- Enabled toggles
- Non-empty search

**Not Counted**:
- Sort By / Sort Direction (always active)
- Trade Side = ALL (default)
- Time Range = ALL (default)
- Max Price = 1.00 (default)

## 🎨 Visual Design

### Color Scheme
- **Active Filters**: Green (`text-buy`)
- **Filter Count**: Green indicator
- **Toggles (Active)**: Green border + light background
- **Toggles (Inactive)**: Gray with hover effect
- **Input Focus**: Border highlight

### Responsive Layout
- **Desktop**: 6-column grid for quick filters
- **Tablet**: 4-column grid
- **Mobile**: 2-column grid

### Collapsible Sections
- Main panel: Expand/collapse
- Advanced options: Sub-collapsible
- Smooth transitions
- Persistent state (until refresh)

## 🔍 Troubleshooting

### No Trades Showing
**Problem**: All trades filtered out  
**Solution**:
1. Check filter count in header
2. Click "RESET ALL"
3. Adjust filters incrementally

### Orderbook Hidden
**Problem**: Spread exceeds threshold  
**Solution**:
1. Check warning banner
2. Increase Max Spread value
3. Or clear the filter

### Slow Performance
**Problem**: Too many trades  
**Solution**:
1. Use Time Range filter
2. Increase Min Value threshold
3. Enable "Hide Dust Trades"

### Search Not Working
**Problem**: No matches found  
**Solution**:
1. Check spelling
2. Try partial terms
3. Search is case-insensitive
4. Clear other filters first

## 📱 Mobile Experience

### Optimizations
- Touch-friendly controls
- Larger tap targets
- Responsive text sizes
- Stacked layout
- Scrollable filters

### Gesture Support
- Tap to toggle
- Swipe to scroll
- Pinch to zoom (browser default)

## ♿ Accessibility

- Semantic HTML labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- ARIA labels
- Clear visual hierarchy

## 🔮 Future Enhancements

Potential additions:
- [ ] Save custom presets
- [ ] Export filtered data
- [ ] Filter history/undo
- [ ] Share filter configurations
- [ ] Filter templates
- [ ] Advanced logic (OR conditions)
- [ ] Regex search support
- [ ] Multi-market comparison
- [ ] Time-based auto-reset
- [ ] Filter performance metrics

## 📚 Related Documentation

- `FILTERING_FEATURE.md` - Original TradeFeed/Orderbook filters
- `FILTERING_QUICK_START.md` - Basic filtering guide
- `LIVE_DATA_SUBTAB.md` - Live Data view documentation
- `LIVE_DATA_IMPLEMENTATION_SUMMARY.md` - Technical implementation

## 🎓 Best Practices

1. **Start Simple**: Use presets first
2. **Iterate**: Adjust filters gradually
3. **Monitor Count**: Watch active filter count
4. **Reset Often**: Use RESET ALL between strategies
5. **Combine Thoughtfully**: Understand filter interactions
6. **Document Setups**: Note working configurations
7. **Test Thoroughly**: Verify results match expectations

## 📞 Support

**No Results?**
- Check active filter count
- Try RESET ALL
- Verify data is loading
- Check WebSocket connection

**Unexpected Results?**
- Review filter logic
- Check sort order
- Verify numeric inputs
- Clear browser cache if needed

## ✅ Summary

The Advanced Live Data Filters provide comprehensive, real-time control over trade and orderbook display. With 15+ filter options, 5 quick presets, and intuitive UI, you can customize your view for any trading strategy. Filters are performant, mobile-friendly, and fully integrated with both TradeFeed and OrderbookDepth panels.

**Key Advantages**:
- ✅ Unified control panel
- ✅ Real-time filtering
- ✅ No crypto ticker or prices distraction
- ✅ Clean, focused interface
- ✅ Quick preset buttons
- ✅ Advanced options when needed
- ✅ Mobile responsive
- ✅ Zero performance impact
- ✅ Type-safe implementation

**Ready to use!** 🚀