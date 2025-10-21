# Crypto Pricing Quick Start Guide

Get up and running with live crypto prices in under 5 minutes! 🚀

## 🎯 What You Get

- **Live prices** for 10+ cryptocurrencies (BTC, ETH, SOL, MATIC, etc.)
- **Auto-scrolling ticker** at the top of your dashboard
- **Detailed price panel** with volume, market cap, and 24h changes
- **USD conversion** for all market prices (USDC → USD)
- **Automatic fallback** to mock data if WebSocket unavailable

## ⚡ Quick Usage

### 1. Display Current Prices

```typescript
import { usePolymarketStore } from "@/store/usePolymarketStore";

function MyComponent() {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  
  // Get a specific price
  const btcPrice = cryptoPrices.get("BTCUSDT");
  
  return (
    <div>
      Bitcoin: ${btcPrice?.price}
    </div>
  );
}
```

### 2. Convert Token to USD

```typescript
import { getUSDEquivalent, formatUSD } from "@/lib/crypto";
import { usePolymarketStore } from "@/store/usePolymarketStore";

function MarketValue() {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  
  // Convert 1000 USDC to USD
  const usdValue = getUSDEquivalent(1000, "USDC", cryptoPrices);
  
  return <div>{formatUSD(usdValue)}</div>; // "$1,000.00"
}
```

### 3. Format Token Amounts

```typescript
import { formatTokenAmount } from "@/lib/crypto";

// Basic formatting
formatTokenAmount(100, "USDC");
// → "100.00 USDC"

// With USD equivalent
formatTokenAmount(0.5, "ETH", true, cryptoPrices);
// → "0.50 ETH ($1,140.00)"
```

## 🎨 UI Components

### CryptoTicker (Header)

Already included at the top of your dashboard. Shows:
- All crypto prices in a scrolling ticker
- 24h percentage changes
- Color-coded gains (green) and losses (red)
- Pauses on hover

**Location**: `components/CryptoTicker.tsx`

### CryptoPrices (Panel)

Displays detailed crypto cards. Shows:
- Current price with smart precision
- 24h change percentage
- Volume 24h (B/M/K format)
- Market cap (T/B/M format)
- Time since last update

**Location**: `components/CryptoPrices.tsx`

## 📊 Supported Cryptocurrencies

| Symbol | Name | Example Price |
|--------|------|---------------|
| BTC | Bitcoin | $43,500 |
| ETH | Ethereum | $2,280 |
| SOL | Solana | $98 |
| MATIC | Polygon | $0.67 |
| USDC | USD Coin | $1.00 |
| XRP | Ripple | $0.52 |
| ADA | Cardano | $0.48 |
| DOGE | Dogecoin | $0.082 |
| AVAX | Avalanche | $34.20 |
| DOT | Polkadot | $6.15 |
| LINK | Chainlink | $14.80 |

## 🛠️ Utility Functions

All utilities are in `lib/crypto.ts`:

### Price Conversion

```typescript
// Get USD equivalent
getUSDEquivalent(amount, symbol, cryptoPrices)

// Get token price only
getTokenPrice(symbol, cryptoPrices)
```

### Formatting

```typescript
// Format USD amounts
formatUSD(1234.56) // "$1,234.56"
formatUSD(1234567) // "$1.23M"

// Format token amounts
formatTokenAmount(100, "USDC", false)
formatTokenAmount(0.5, "ETH", true, cryptoPrices)
```

### Price Analysis

```typescript
// Calculate trading impact
calculatePriceImpact(currentPrice, newPrice)

// Format impact with severity
formatPriceImpact(0.05) // { text: "5.00%", severity: "high" }
```

### Data Freshness

```typescript
// Check if stale
isPriceStale(timestamp, 60) // true if > 60 seconds old

// Get freshness indicator
getPriceFreshness(timestamp)
// → { text: "Live", color: "green" }
// → { text: "5s ago", color: "green" }
// → { text: "Stale", color: "red" }
```

### Portfolio

```typescript
// Calculate total portfolio value
const positions = [
  { amount: 1000, symbol: "USDC" },
  { amount: 0.5, symbol: "ETH" },
];

calculatePortfolioValue(positions, cryptoPrices)
// → 2140.00 (1000 + 1140)
```

## 🔌 How It Works

1. **WebSocket Connection** - App connects to Polymarket's real-time API
2. **Topic Subscription** - Subscribes to `crypto_prices` topic
3. **Live Updates** - Receives price updates every 2-5 seconds
4. **Store Update** - Updates Zustand store's `cryptoPrices` Map
5. **UI Re-render** - Components automatically refresh with new data

## 🐛 Troubleshooting

### No Prices Showing

**Check WebSocket status:**
```typescript
const connected = usePolymarketStore((state) => state.connected);
console.log("Connected:", connected);
```

**Check price data:**
```typescript
const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
console.log("Prices:", Array.from(cryptoPrices.entries()));
```

### Stale Prices

Prices should update every few seconds. If not:
1. Check WebSocket connection (ConnectionStatus component)
2. Look for errors in browser console
3. Verify network connectivity
4. App will fall back to mock data after 10s timeout

### Incorrect Values

Make sure you're using the right symbol format:
- ✅ `BTCUSDT`, `ETHUSDT`, `MATICUSDT`
- ✅ `MATIC-USD`, `ETH-USD`, `USDC-USD`
- ❌ `BTC`, `ETH`, `MATIC` (without suffix)

## 📈 Next Steps

### Add Sparkline Charts

The CryptoPrices panel has sparkline placeholders ready:

```typescript
// Store historical prices
const [priceHistory, setPriceHistory] = useState<number[]>([]);

useEffect(() => {
  const price = parseFloat(cryptoPrice.price);
  setPriceHistory(prev => [...prev.slice(-20), price]);
}, [cryptoPrice.price]);

// Use recharts or react-sparklines
<Sparklines data={priceHistory} />
```

### Add Price Alerts

```typescript
useEffect(() => {
  const btcPrice = parseFloat(cryptoPrices.get("BTCUSDT")?.price || "0");
  
  if (btcPrice > 45000) {
    new Notification("🚀 BTC above $45k!");
  }
}, [cryptoPrices]);
```

### Custom Watchlist

```typescript
const [watchlist, setWatchlist] = useState(["BTCUSDT", "ETHUSDT"]);

const watchedPrices = watchlist.map(symbol => cryptoPrices.get(symbol));
```

## 📚 Full Documentation

- **[CRYPTO_PRICES.md](./CRYPTO_PRICES.md)** - Complete integration guide
- **[CRYPTO_IMPLEMENTATION_SUMMARY.md](./CRYPTO_IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[lib/crypto.ts](./lib/crypto.ts)** - Source code with JSDoc comments

## ✅ Checklist

- [x] WebSocket connected (check ConnectionStatus)
- [x] Crypto prices visible in ticker
- [x] CryptoPrices panel showing data
- [x] USD conversions working in TopMarkets
- [x] No console errors
- [x] Prices updating every few seconds

## 🎉 You're Ready!

That's it! You now have live crypto pricing integrated into your Polymarket monitor.

**Key Points to Remember:**
- Prices update automatically via WebSocket
- All utilities are in `lib/crypto.ts`
- Components are in `components/Crypto*.tsx`
- Store is `usePolymarketStore().cryptoPrices`
- USDC is always 1:1 with USD

**Happy Trading! 📊💰**