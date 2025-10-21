# Crypto Pricing Integration

This document explains how live crypto pricing works in the Polymarket Live Monitor and how to use it effectively.

## 📊 Overview

The application integrates Polymarket's real-time crypto price feed to:

- **Display USD equivalents** for market prices (since markets are denominated in USDC on Polygon)
- **Track trading pairs** (MATIC/USDC, ETH/USDC, etc.)
- **Support cross-chain conversions** for future collateral changes
- **Provide live market context** for traders

## 🔌 Data Source

Crypto prices come directly from Polymarket's WebSocket feed via two topic subscriptions:

### Topic: `crypto_prices`
- **Type**: `price_update` - Individual price updates
- **Type**: `snapshot` - Initial batch of all prices

### Supported Assets

The feed provides real-time prices for major tokens:
- **USDC** - Primary stablecoin (always 1:1 USD)
- **MATIC/POL** - Polygon network token
- **ETH** - Ethereum
- **BTC** - Bitcoin
- **SOL** - Solana
- **XRP** - Ripple
- **ADA** - Cardano
- **DOGE** - Dogecoin
- **AVAX** - Avalanche
- **DOT** - Polkadot
- **LINK** - Chainlink

## 📡 Message Format

### Price Update Message

```json
{
  "topic": "crypto_prices",
  "type": "price_update",
  "payload": {
    "symbol": "MATIC-USD",
    "price": "0.6723",
    "change24h": "0.0245",
    "volume24h": "350000000",
    "marketCap": "6500000000",
    "timestamp": 1729451020000
  }
}
```

### Snapshot Message (Initial Data)

```json
{
  "topic": "crypto_prices",
  "type": "snapshot",
  "payload": [
    { "symbol": "USDC-USD", "price": "1.0000" },
    { "symbol": "MATIC-USD", "price": "0.6723" },
    { "symbol": "ETH-USD", "price": "2345.12" }
  ]
}
```

## 🏗️ Architecture

### Components

1. **Realtime Service** (`services/realtime.ts`)
   - Subscribes to `crypto_prices` topic
   - Handles both `price_update` and `snapshot` messages
   - Normalizes symbols (e.g., "MATIC-USD" → "MATICUSDT")
   - Updates Zustand store

2. **Zustand Store** (`store/usePolymarketStore.ts`)
   - Stores prices in a `Map<string, CryptoPrice>`
   - Provides `updateCryptoPrice(price)` action
   - Reactive updates to all components

3. **CryptoTicker Component** (`components/CryptoTicker.tsx`)
   - Horizontal auto-scrolling ticker
   - Shows price + 24h change for all assets
   - Pauses on hover
   - Color-coded gains/losses

4. **CryptoPrices Panel** (`components/CryptoPrices.tsx`)
   - Grid layout of crypto cards
   - Shows price, change, volume, market cap
   - Responsive design (1-5 columns)
   - Hover effects and animations

5. **Crypto Utilities** (`lib/crypto.ts`)
   - USD conversion functions
   - Token amount formatting
   - Price impact calculations
   - Freshness indicators

### Data Flow

```
WebSocket API
    ↓
RealTimeDataClient (onMessage)
    ↓
RealtimeService.handleCryptoPriceMessage()
    ↓
store.updateCryptoPrice()
    ↓
cryptoPrices Map updated
    ↓
Components re-render (CryptoTicker, CryptoPrices)
```

## 💻 Usage Examples

### Accessing Prices in Components

```typescript
import { usePolymarketStore } from "@/store/usePolymarketStore";

function MyComponent() {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  
  // Get specific price
  const maticPrice = cryptoPrices.get("MATICUSDT");
  console.log(`MATIC: $${maticPrice?.price}`);
  
  // Convert all prices to array
  const allPrices = Array.from(cryptoPrices.values());
  
  return <div>...</div>;
}
```

### Converting Token Amounts to USD

```typescript
import { getUSDEquivalent, formatUSD } from "@/lib/crypto";
import { usePolymarketStore } from "@/store/usePolymarketStore";

function MarketCard({ price, size }) {
  const cryptoPrices = usePolymarketStore((state) => state.cryptoPrices);
  
  // Convert USDC amount to USD (1:1)
  const usdValue = getUSDEquivalent(size, "USDC", cryptoPrices);
  
  return (
    <div>
      <p>Price: {price} USDC</p>
      <p>Size: {formatUSD(usdValue)}</p>
    </div>
  );
}
```

### Formatting Token Amounts

```typescript
import { formatTokenAmount } from "@/lib/crypto";

// Basic formatting
formatTokenAmount(100, "USDC") 
// → "100.00 USDC"

// With USD equivalent
formatTokenAmount(0.5, "ETH", true, cryptoPrices)
// → "0.50 ETH ($1,140.00)"
```

### Checking Price Freshness

```typescript
import { getPriceFreshness, isPriceStale } from "@/lib/crypto";

const price = cryptoPrices.get("ETHUSDT");
const freshness = getPriceFreshness(price.timestamp);

console.log(freshness.text); // "Live", "5s ago", or "Stale"
console.log(freshness.color); // "green", "yellow", or "red"

if (isPriceStale(price.timestamp, 60)) {
  console.warn("Price data is over 60 seconds old!");
}
```

### Calculating Portfolio Value

```typescript
import { calculatePortfolioValue } from "@/lib/crypto";

const positions = [
  { amount: 1000, symbol: "USDC" },
  { amount: 0.5, symbol: "ETH" },
  { amount: 100, symbol: "MATIC" }
];

const totalValue = calculatePortfolioValue(positions, cryptoPrices);
console.log(`Total: ${formatUSD(totalValue)}`);
```

## 🎨 UI Components

### CryptoTicker

**Location**: Top of page, below header  
**Features**:
- Auto-scrolling animation (60s loop)
- Duplicated prices for seamless scrolling
- Pauses on hover
- Color-coded 24h changes (green/red)
- Compact display with separators

**Customization**:
```typescript
// Adjust scroll speed by changing animation duration
<style jsx>{`
  .animate-scroll {
    animation: scroll 40s linear infinite; // Faster: 40s instead of 60s
  }
`}</style>
```

### CryptoPrices Panel

**Location**: Main dashboard, between stats and markets  
**Features**:
- Responsive grid (1-5 columns)
- Price, 24h change, volume, market cap
- Sparkline placeholder (ready for charts)
- Live update indicator (pulsing dot)
- Hover effects with glow
- Time since last update

**Customization**:
```typescript
// Change grid columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
```

## 🔧 Configuration

### Subscription Setup

In `services/realtime.ts`:

```typescript
private subscribeToTopics(client: RealTimeDataClient): void {
  // Subscribe to price updates
  client.subscribe({
    subscriptions: [
      {
        topic: "crypto_prices",
        type: "price_update",
        filters: "",
      },
    ],
  });

  // Subscribe to snapshots
  client.subscribe({
    subscriptions: [
      {
        topic: "crypto_prices",
        type: "snapshot",
        filters: "",
      },
    ],
  });
}
```

### Mock Data Fallback

When WebSocket is unavailable, the app falls back to mock data:

```typescript
// In services/mockData.ts
public generateCryptoPrice(symbol: string): CryptoPrice {
  const basePrices: Record<string, number> = {
    BTCUSDT: 43500,
    ETHUSDT: 2280,
    // ... more prices
  };
  
  // Add realistic variation
  const variation = (Math.random() - 0.5) * basePrice * 0.01;
  // ...
}
```

## 🐛 Debugging

### Enable Verbose Logging

The crypto price handler logs all updates:

```typescript
console.log("💰 Crypto price update received:", payload);
console.log(`💰 Updated ${cryptoPrice.symbol}: $${cryptoPrice.price}`);
```

### Check Store State

```typescript
// In browser console
window.usePolymarketStore = require("@/store/usePolymarketStore").usePolymarketStore;
const cryptoPrices = window.usePolymarketStore.getState().cryptoPrices;
console.log("Prices in store:", Array.from(cryptoPrices.entries()));
```

### Verify Subscriptions

Check console for:
```
📊 Subscribing to crypto_prices topic...
✓ Subscribed to crypto_prices topic
✓ Subscribed to crypto_prices snapshots
```

## 📈 Performance

### Update Frequency
- Price updates arrive **every 2-5 seconds** depending on market activity
- More volatile assets update more frequently
- Stablecoins (USDC) update less frequently

### Memory Management
- Prices stored in `Map` (O(1) lookups)
- Only latest price kept per symbol
- No historical data accumulation

### Optimization Tips

1. **Memoize calculations**:
```typescript
const usdValue = useMemo(
  () => getUSDEquivalent(amount, symbol, cryptoPrices),
  [amount, symbol, cryptoPrices]
);
```

2. **Debounce UI updates** for high-frequency components

3. **Use selective subscriptions** if you only need specific tokens

## 🚀 Future Enhancements

### Planned Features
- [ ] **Mini sparkline charts** - 24h price trends
- [ ] **Price alerts** - Notifications for price thresholds
- [ ] **Historical data** - Store and display price history
- [ ] **Advanced analytics** - RSI, MACD, Bollinger Bands
- [ ] **Custom watchlists** - User-selected crypto tracking
- [ ] **Cross-pair calculations** - ETH/MATIC, BTC/ETH, etc.

### Integration Ideas
- Use prices in order books for better USD context
- Show trade values in both USDC and USD
- Calculate total portfolio value
- Display market cap rankings
- Add price change notifications

## 🔐 Security Notes

- **Read-only data**: No authentication required for price feed
- **No API keys**: Crypto prices are public data
- **Validated inputs**: All conversions validate numbers
- **Fallback handling**: Graceful degradation if prices unavailable

## 📚 API Reference

See `lib/crypto.ts` for complete function documentation:

- `getUSDEquivalent()` - Convert token to USD
- `formatUSD()` - Format USD amounts
- `getTokenPrice()` - Get current token price
- `formatTokenAmount()` - Format with symbol
- `calculatePriceImpact()` - Calculate trade impact
- `getTokenDisplayName()` - Get display name
- `isPriceStale()` - Check freshness
- `getPriceFreshness()` - Get indicator
- `calculatePortfolioValue()` - Sum portfolio

## 🤝 Contributing

To add support for new tokens:

1. Add to `symbolMap` in components
2. Add to `mockData.ts` base prices
3. Update subscription filters if needed
4. Add to documentation

## 📞 Support

- Check browser console for errors
- Verify WebSocket connection in Network tab
- Ensure Polymarket API is accessible
- Test with mock data mode if issues persist