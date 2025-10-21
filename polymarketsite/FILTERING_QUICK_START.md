# Filtering Quick Start Guide

## 🚀 Getting Started

The filtering feature helps you focus on high-value and high-conviction trades without cluttering the UI.

## 📍 Where to Find Filters

### Live Trades Feed
Look for the **FILTER** button in the top-right area of the Live Trades panel, next to the trade count.

### Orderbook Depth
Look for the **FILTER** button in the top-right area, next to the AUTO/MANUAL toggle.

## 🎯 Common Use Cases

### 1. Focus on Large Trades Only

**Goal**: See only trades worth $100 or more

1. Open Live Trades panel
2. Click **FILTER** button
3. Set **MIN VALUE** to `100`
4. Done! Only trades ≥$100 will show

**Why use this?**
- Filter out noise from small trades
- Focus on market-moving activity
- Track "whale" movements

---

### 2. Find High Conviction Bets

**Goal**: See only trades with extreme prices (strong conviction)

1. Open Live Trades panel
2. Click **FILTER** button
3. Toggle **HIGH CONVICTION** on
4. See trades with price ≤15¢ or ≥85¢

**Why use this?**
- Identify strong market sentiment
- Find opportunities where traders are very confident
- Spot potential arbitrage situations

---

### 3. Clean Orderbook View

**Goal**: Remove small orders to see real liquidity

1. Open Orderbook Depth panel
2. Click **FILTER** button
3. Set **MIN SIZE** to `50` (or higher)
4. See only significant orders

**Why use this?**
- Focus on real liquidity
- Ignore dust orders
- Better understand true market depth

---

### 4. Avoid Wide Spreads

**Goal**: Hide markets with poor liquidity

1. Open Orderbook Depth panel
2. Click **FILTER** button
3. Set **MAX SPREAD** to `2` (2%)
4. Markets exceeding this show a warning

**Why use this?**
- Identify illiquid markets
- Avoid poor execution prices
- Find markets with tight spreads

---

## 🎨 Visual Cues

| Element | Meaning |
|---------|---------|
| **FILTER** (gray) | No filters active |
| **FILTER (2)** (green) | 2 filters active |
| **✓** checkmark | Filter is enabled |
| **✕** button | Clear individual filter |
| **CLEAR ALL** | Reset all filters |
| **⚠ Warning** (red) | Spread threshold exceeded |

---

## 💡 Pro Tips

### Combine Filters
You can use multiple filters together:
- **MIN VALUE: $100** + **HIGH CONVICTION** = Large, confident trades only
- **MIN SIZE: 50** + **MAX SPREAD: 2%** = Significant orders in liquid markets

### Quick Reset
- Click **✕** to clear one filter
- Click **CLEAR ALL** to reset everything
- Filters don't persist (reset on page refresh)

### No Apply Button Needed
Filters work instantly as you type or toggle them.

### Check Active Filters
The number in parentheses shows how many filters are active: **FILTER (2)**

---

## 📊 Filter Reference

### Live Trades Filters

| Filter | Type | Default | Purpose |
|--------|------|---------|---------|
| MIN VALUE | Input ($) | 0 | Minimum trade value (price × size) |
| HIGH CONVICTION | Toggle | Off | Price ≤15¢ or ≥85¢ |

### Orderbook Filters

| Filter | Type | Default | Purpose |
|--------|------|---------|---------|
| MIN SIZE | Input | 0 | Minimum order size |
| MAX SPREAD | Input (%) | 0 | Maximum spread percentage |

---

## 🔍 Examples

### Example 1: Day Trading Setup
```
Live Trades:
- MIN VALUE: $50
- HIGH CONVICTION: Off

Orderbook:
- MIN SIZE: 100
- MAX SPREAD: 1.5%
```
**Result**: Medium-value trades with tight spreads

---

### Example 2: Whale Watching
```
Live Trades:
- MIN VALUE: $1000
- HIGH CONVICTION: Off

Orderbook:
- MIN SIZE: 500
- MAX SPREAD: Off
```
**Result**: Only very large trades and orders

---

### Example 3: Sentiment Tracking
```
Live Trades:
- MIN VALUE: $0
- HIGH CONVICTION: On

Orderbook:
- MIN SIZE: 0
- MAX SPREAD: Off
```
**Result**: All high-conviction trades regardless of size

---

## ❓ FAQ

**Q: Do filters persist after refresh?**
A: No, filters reset when you refresh the page.

**Q: Do filters affect the backend?**
A: No, all filtering happens in your browser. No extra API calls.

**Q: Can I save filter presets?**
A: Not yet, but it's a planned feature!

**Q: What's a "high conviction" trade?**
A: A trade with extreme price (≤15¢ or ≥85¢), indicating strong belief in the outcome.

**Q: Why does the orderbook disappear?**
A: If MAX SPREAD is set and the spread exceeds it, the book is hidden with a warning.

**Q: Do filters slow down the app?**
A: No, filters are highly optimized and have zero impact when inactive.

---

## 🎯 Best Practices

1. **Start Simple**: Try one filter at a time to understand its effect
2. **Adjust Gradually**: Increase thresholds slowly to find your sweet spot
3. **Watch the Count**: Monitor the displayed trade count to see filter impact
4. **Reset Often**: Use CLEAR ALL when switching strategies
5. **Mobile Friendly**: Filters work great on mobile too!

---

## 🆘 Troubleshooting

**No trades showing?**
- Check if your filters are too restrictive
- Click CLEAR ALL to reset
- MIN VALUE might be set too high

**Orderbook is hidden?**
- Check MAX SPREAD filter
- Spread might exceed your threshold
- Lower the threshold or clear the filter

**Filter button not responding?**
- Try refreshing the page
- Check browser console for errors
- Make sure JavaScript is enabled

---

## 🚦 Quick Actions

| I want to... | Action |
|--------------|--------|
| See only big trades | Set MIN VALUE: $100+ |
| Find strong bets | Toggle HIGH CONVICTION |
| Clean orderbook | Set MIN SIZE: 50+ |
| Avoid illiquid markets | Set MAX SPREAD: 2% |
| Reset everything | Click CLEAR ALL |
| Hide filters | Click FILTER button again |

---

## 📝 Notes

- Filters are **additive** (AND logic, not OR)
- Filtering happens **instantly** in real-time
- No data is hidden permanently
- Filters are **per-component** (TradeFeed vs Orderbook)
- Mobile-responsive with smaller text sizes

---

**Happy Trading! 📈**