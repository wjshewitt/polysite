# Crypto Prices Layout Guide

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ POLYMARKET LIVE MONITOR                    [Connection Status]  │
│ 100% Real-Time Market Data Stream                               │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ BTC $45,123.45 +2.34% │ ETH $2,500.00 -1.23% │ SOL ... →   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Live Stats: Trades, Volume, etc.]                              │
├─────────────────────────────────────────────────────────────────┤
│ [Diagnostics: Connection, Activity Log]                         │
├─────────────────────────────────────────────────────────────────┤
│ CRYPTO PRICES                                      10 assets    │
│ ┌────────┬────────┬────────┬────────┬────────┐                │
│ │  BTC   │  ETH   │  SOL   │  XRP   │  ADA   │                │
│ │$45,123 │ $2,500 │  $100  │ $0.60  │ $0.50  │                │
│ │+2.34%  │-1.23%  │+5.67%  │-0.45%  │+1.89%  │ ← Grid View    │
│ ├────────┼────────┼────────┼────────┼────────┤                │
│ │  DOGE  │ MATIC  │  AVAX  │  DOT   │  LINK  │                │
│ │ $0.08  │ $0.80  │  $35   │  $6.00 │  $14   │                │
│ │+12.3%  │-2.34%  │+3.45%  │-1.23%  │+0.89%  │                │
│ └────────┴────────┴────────┴────────┴────────┘                │
│ Live prices via Polymarket WebSocket            [Scrollable]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────────────────────┐ ┌──────────┐                │
│ │      │ │                      │ │          │                │
│ │ TOP  │ │    TRADE FEED        │ │  ORDER   │                │
│ │MKTS  │ │    (Real-time)       │ │  BOOK    │                │
│ │      │ │                      │ │          │                │
│ └──────┘ └──────────────────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. CryptoTicker (Header Bar)
**Location**: Immediately below page title
**Height**: Auto (single row)
**Style**: 
- Background: `#0B0B0B`
- Border: `#1A1A1A`
- Overflow: Horizontal scroll
- Text: `#EAEAEA` (JetBrains Mono)

**Content Layout**:
```
[BTC] [$45,123.45] [+2.34%] │ [ETH] [$2,500.00] [-1.23%] │ ...
 ↑         ↑            ↑
Symbol   Price    24h Change
         (bold)   (color-coded)
```

### 2. CryptoPrices Panel
**Location**: Between Diagnostics and Main Grid
**Height**: Fixed 200px
**Style**:
- Background: `#0B0B0B`
- Border: `#1A1A1A`
- Hover Border: `#55AFFF`

**Grid Responsive Breakpoints**:
- Mobile (< 640px): 1 column
- SM (640px+): 2 columns
- LG (1024px+): 3 columns
- XL (1280px+): 5 columns

**Individual Card Layout**:
```
┌──────────────────┐
│ BTC        2m    │ ← Symbol + Timestamp
│                  │
│ $45,123.45       │ ← Price (large, bold)
│                  │
│ +2.34% 24h       │ ← Change (color-coded)
└──────────────────┘
```

## Color System

### Crypto Price Colors
- **Positive Change**: `#00FF9C` (bright green)
- **Negative Change**: `#FF3C3C` (bright red)
- **Neutral/Info**: `#55AFFF` (blue)

### Text Hierarchy
- **Primary Text**: `#EAEAEA` (almost white)
- **Muted Text**: `#666666` (gray)
- **Background**: `#0B0B0B` (near black)
- **Panel Background**: `#111111` (slightly lighter)
- **Borders**: `#1A1A1A` (dark gray)

## Typography

### Font Families
- **Primary**: JetBrains Mono (monospace)
- **Fallback**: Inter (sans-serif)

### Size Scale
- **Symbol Name**: 0.875rem (14px) - Bold
- **Price**: 1.125rem-1.25rem (18-20px) - Bold
- **Change %**: 0.75rem (12px) - SemiBold
- **Timestamp**: 0.75rem (12px) - Regular
- **Footer**: 0.75rem (12px) - Regular

## Responsive Behavior

### Desktop (1280px+)
```
Header: Full width ticker (scrollable)
Panel: 5-column grid
Cards: 200px wide each
```

### Tablet (768px - 1279px)
```
Header: Full width ticker (scrollable)
Panel: 3-column grid
Cards: Flexible width
```

### Mobile (< 768px)
```
Header: Full width ticker (must scroll)
Panel: 1-2 column grid
Cards: Full width with padding
```

## Interaction States

### Card Hover
```
Before: border-[#1A1A1A]
After:  border-[#55AFFF] + transition-colors
```

### Scroll Behavior
- **Ticker**: Horizontal scroll, no vertical
- **Panel**: Vertical scroll (ScrollArea component)
- **Cards**: No individual scroll

## Data Flow Diagram

```
Polymarket WebSocket
       ↓
[crypto_prices topic]
       ↓
RealTimeDataClient
       ↓
handleCryptoPriceMessage()
       ↓
Zustand Store (Map<symbol, CryptoPrice>)
       ↓        ↓
  CryptoTicker  CryptoPrices
       ↓        ↓
    [UI Updates in Real-Time]
```

## Update Frequency

- **Real-time Mode**: 1-5 seconds (WebSocket push)
- **Mock Mode**: 3 seconds (setInterval)
- **Timestamp Display**: Updates every render
- **Visual Update**: On state change only (React optimization)

## Accessibility Features

### Color Contrast
- All text meets WCAG AA standards
- Green: 4.5:1 ratio minimum
- Red: 4.5:1 ratio minimum

### Semantic HTML
```html
<div role="region" aria-label="Cryptocurrency Prices">
  <h2>CRYPTO PRICES</h2>
  <div role="grid">
    <div role="gridcell">...</div>
  </div>
</div>
```

### Keyboard Navigation
- Tab through cards
- Hover states visible
- Focus indicators on interactive elements

## Performance Optimizations

### State Management
```typescript
// Using Map for O(1) lookups
cryptoPrices: Map<string, CryptoPrice>

// Selective subscriptions
usePolymarketStore((state) => state.cryptoPrices)
```

### Rendering
- Components only re-render when their subscribed state changes
- Array.from() conversion done only on state change
- Sort operation done once per update

### Memory
- Map replaces old values (no accumulation)
- Max 10 symbols = minimal memory footprint
- No history stored (future enhancement)

## Integration Points

### 1. Main Layout (app/page.tsx)
```typescript
<CryptoTicker />  // Header section
// ... other components
<CryptoPrices />  // Before main grid
```

### 2. Store Integration
```typescript
const cryptoPrices = usePolymarketStore(
  (state) => state.cryptoPrices
);
```

### 3. Real-time Service
```typescript
client.subscribe({
  subscriptions: [{
    topic: "crypto_prices",
    type: "update",
    filters: JSON.stringify({ symbol: "btcusdt" }),
  }],
});
```

## Testing Checklist

- [ ] All 10 cryptos load and display
- [ ] Prices update in real-time
- [ ] Colors change correctly (green/red)
- [ ] Timestamp updates properly
- [ ] Responsive grid works on all breakpoints
- [ ] Horizontal scroll works in ticker
- [ ] Vertical scroll works in panel
- [ ] Hover states function
- [ ] Mock data fallback activates on disconnect
- [ ] No console errors
- [ ] Performance acceptable (< 100ms updates)
- [ ] Accessibility tab order correct

## Known Limitations

1. **24h Change**: Currently set to "0" - requires historical API data
2. **Volume/Market Cap**: Currently set to "0" - requires additional API
3. **No Charts**: Future enhancement
4. **No Favorites**: Future enhancement
5. **Fixed Symbol List**: No dynamic addition/removal

## Future Layout Enhancements

1. **Expandable Cards**: Click to see detailed price history
2. **Mini Charts**: Sparklines in each card
3. **Customizable Grid**: Drag & drop to reorder
4. **Price Alerts**: Visual indicators for threshold breaches
5. **Full-Screen Mode**: Dedicated crypto prices page