# Advanced Filters - Quick Reference Card

## 🎯 One-Page Cheat Sheet

### Access
Navigate to: **Main Dashboard > 📊 LIVE DATA**

---

## 📋 Filter Quick Reference

| Filter | Type | Purpose | Example |
|--------|------|---------|---------|
| **SIDE** | Dropdown | BUY/SELL/ALL | Track buy pressure |
| **TIME** | Dropdown | Recency filter | Last 5 minutes |
| **SORT BY** | Dropdown | Order trades | By value |
| **ORDER** | Dropdown | Direction | Largest first |
| **CONVICTION** | Toggle | Extreme prices | ≤15¢ or ≥85¢ |
| **SIZE** | Toggle | Large trades only | ≥$500 |
| **MIN VALUE** | Input | Min trade $ | $100+ |
| **MAX VALUE** | Input | Max trade $ | ≤$5000 |
| **MIN ORDER SIZE** | Input | Orderbook size | 50+ contracts |
| **MAX SPREAD** | Input | Spread limit | ≤2% |
| **MIN PRICE** | Input | Price floor | $0.20+ |
| **MAX PRICE** | Input | Price ceiling | ≤$0.80 |
| **SEARCH** | Text | Market filter | "Bitcoin" |
| **HIDE DUST** | Checkbox | Remove <$10 | Clean feed |

---

## ⚡ Quick Presets

### $100+ Trades
```
Min Value: $100
```
**Use**: Filter noise, meaningful trades

### High Conviction
```
High Conviction: ✓
Min Value: $50
```
**Use**: Strong sentiment trades

### Whale Watch
```
Min Value: $1000
Large Only: ✓
```
**Use**: Institutional activity

### Tight Spreads
```
Max Spread: 2%
Min Order Size: 50
```
**Use**: Liquid markets only

### Buy Flow
```
Side: BUY
Sort: VALUE
```
**Use**: Buying pressure analysis

---

## 🎨 Common Setups

### Scalper
```
⏱️ Time: 1 MIN
📊 Spread: 1%
📦 Size: 100+
🔄 Sort: TIME
```

### Day Trader
```
⏱️ Time: 5 MIN
💰 Min Value: $50
📊 Spread: 2%
🔄 Sort: VALUE
```

### Swing Trader
```
⏱️ Time: 1 HOUR
💰 Min Value: $500
✅ Conviction: HIGH
🔄 Sort: VALUE
```

### Whale Watcher
```
💰 Min Value: $1000
📦 Large Only: ✓
🔄 Sort: VALUE
↓ Order: DESC
```

### Market Maker
```
📊 Spread: 3%
📦 Min Size: 50+
🔍 Side: ALL
🔄 Sort: TIME
```

---

## 🔥 Power User Tips

### Combining Filters
✅ **DO**: Use multiple filters together
- Time + Value = Recent large trades
- Side + Sort = Buying/selling flow
- Spread + Size = Quality orderbook

❌ **DON'T**: Over-filter
- Too restrictive = no results
- Start broad, narrow down
- Use RESET ALL often

### Filter Strategy
1. **Start** with preset
2. **Adjust** one filter at a time
3. **Monitor** active count
4. **Reset** between strategies

### Performance Hacks
- Use Time Range to reduce data
- Hide Dust for cleaner feed
- Min Value filters noise
- Search for specific markets

---

## 📊 Filter Thresholds

| Filter | Threshold | Meaning |
|--------|-----------|---------|
| **High Conviction** | ≤$0.15 or ≥$0.85 | Extreme confidence |
| **Large Trades** | ≥$500 | Significant value |
| **Dust Trades** | <$10 | Very small |
| **Tight Spread** | ≤1% | Very liquid |
| **Wide Spread** | ≥5% | Illiquid |

---

## 🎯 Use Case Matrix

| Goal | Filters to Use |
|------|----------------|
| Find whales | Min Value: $1000, Large: ✓ |
| Track sentiment | Conviction: ✓, Sort: VALUE |
| Monitor market | Search: "market name" |
| Recent activity | Time: 1 MIN, Sort: TIME |
| Liquid markets | Spread: 2%, Size: 50+ |
| Buy pressure | Side: BUY, Sort: VALUE |
| Sell pressure | Side: SELL, Sort: VALUE |
| Large orders | Min Size: 100+ |
| Price range | Min: $0.30, Max: $0.70 |
| Clean feed | Hide Dust: ✓ |

---

## 🚨 Quick Troubleshooting

### No Trades Showing?
→ Check filter count (green number)  
→ Click **RESET ALL**  
→ Lower Min Value threshold

### Orderbook Hidden?
→ Spread exceeds Max Spread  
→ Increase threshold or clear  
→ Look for warning banner

### Too Much Data?
→ Use Time Range filter  
→ Increase Min Value  
→ Enable Hide Dust

### Can't Find Market?
→ Use Search filter  
→ Check spelling  
→ Try partial names

---

## ⌨️ Keyboard Shortcuts

| Action | Method |
|--------|--------|
| Open filters | Click panel header |
| Clear filter | Click ✕ button |
| Reset all | Click RESET ALL |
| Apply preset | Click preset button |
| Expand advanced | Click ADVANCED OPTIONS |

---

## 📱 Mobile Tips

- **Tap** preset buttons for quick filters
- **Swipe** to scroll filter panel
- **Touch** dropdowns for selection
- **Clear** with ✕ buttons
- **Collapse** panel to save space

---

## 🎨 Visual Cues

| Indicator | Meaning |
|-----------|---------|
| **(3)** green number | 3 active filters |
| **✓** checkmark | Toggle is ON |
| **✕** button | Clear this filter |
| **↓** chevron | Expand/collapse |
| Green border | Active filter |
| Gray border | Inactive filter |
| ⚠ Banner | Spread warning |

---

## 🔄 Filter Logic

**Filters are combined with AND logic:**
```
Time: 5 MIN
AND Min Value: $100
AND Side: BUY
= Recent $100+ buy trades only
```

**All filters must match for trade to show**

---

## 💡 Pro Moves

### 1. Preset Hopping
Switch between presets to compare:
- $100+ Trades → Whale Watch → High Conviction

### 2. Incremental Filtering
Start loose, tighten gradually:
1. All trades (no filters)
2. Add Time: 15 MIN
3. Add Min Value: $50
4. Add Conviction: ✓

### 3. Market Deep Dive
Focus on specific market:
1. Search: "market name"
2. Sort: VALUE
3. Time: 1 HOUR
4. Watch order flow

### 4. Order Flow Analysis
Track buy/sell imbalance:
1. Side: BUY, note count
2. Side: SELL, compare count
3. Side: ALL, Sort: TIME
4. Identify pressure direction

---

## 📊 Stats Display

**Header shows:**
```
100 TRADES | 15B / 12A
```
- **100 TRADES**: Filtered trade count
- **15B**: Bid levels (after filters)
- **12A**: Ask levels (after filters)

---

## 🎓 Learning Path

### Beginner
1. Try each preset
2. Adjust one filter
3. Click RESET ALL
4. Repeat

### Intermediate
1. Combine 2-3 filters
2. Save mental presets
3. Quick preset → adjust
4. Monitor filter count

### Advanced
1. Custom filter combos
2. Strategy-specific setups
3. Market-aware filtering
4. Flow analysis

---

## ✅ Filter Checklist

Before trading:
- [ ] Set time range (recent data)
- [ ] Filter by value (noise reduction)
- [ ] Check spread (liquidity)
- [ ] Sort by priority metric
- [ ] Monitor filtered count

---

## 🔗 Related Docs

- `ADVANCED_LIVE_DATA_FILTERS.md` - Full documentation
- `FILTERING_FEATURE.md` - Original filters
- `LIVE_DATA_SUBTAB.md` - Live Data view guide

---

## 📞 Need Help?

**No results?** → RESET ALL  
**Too many results?** → Add filters  
**Confused?** → Try presets first  
**Want specific setup?** → Check use case matrix

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Status**: ✅ Production Ready