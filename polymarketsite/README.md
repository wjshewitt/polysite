# 🎯 Polymarket Live Real-Time Monitor

A **100% real-time** monitoring dashboard for Polymarket that streams live trading data, order books, market activity, and crypto prices using Polymarket's WebSocket API.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔴 **100% Live Data** - Real-time WebSocket streaming from Polymarket
- 📊 **Live Trade Feed** - See every trade as it happens
- 📈 **Order Book Visualization** - Real-time bid/ask spreads with depth
- 💹 **Live Crypto Prices** - Real-time price feed for BTC, ETH, SOL, MATIC, and more
- 💰 **USD Conversion** - Automatic USD equivalents for all market prices
- 📉 **Live Statistics** - Volume, markets, trade ratios, and more
- 🎨 **Straight-Line Design** - No rounded corners, high-contrast dark mode
- ⚡ **Blazing Fast** - Built with Next.js 15 App Router
- 🔄 **Auto-Reconnection** - Exponential backoff reconnection logic
- 🎯 **Type-Safe** - Full TypeScript implementation

## 🎨 Design System

- **Background**: `#0B0B0B` (Pure dark)
- **Foreground**: `#EAEAEA` (High-contrast text)
- **Buy Color**: `#00FF9C` (Green)
- **Sell Color**: `#FF3C3C` (Red)
- **Neutral Color**: `#55AFFF` (Blue)
- **Typography**: JetBrains Mono (monospace) + Inter (sans-serif)
- **Aesthetic**: Rectangular panels, 1px borders, zero border-radius

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**

### Installation

```bash
# Clone or navigate to the project
cd polysite/polymarketsite

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your live monitor!

## 📦 Dependencies

### Core
- `next` - Next.js 15 framework
- `react` & `react-dom` - React 18
- `typescript` - Type safety

### Polymarket Integration
- `@polymarket/realtime-client` - WebSocket client for real-time data
- `@polymarket/clob-client` - CLOB API client (optional)
- `ethers` - Ethereum utilities

### State & UI
- `zustand` - Lightweight state management
- `tailwindcss` - Utility-first CSS
- `shadcn/ui` - Headless UI components
- `lucide-react` - Icon library
- `recharts` - Chart library

## 🏗️ Project Structure

```
polymarketsite/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles & design system
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── ConnectionStatus.tsx # WebSocket connection indicator
│   ├── TradeFeed.tsx       # Live trade feed
│   ├── OrderBook.tsx       # Order book visualization
│   ├── CryptoTicker.tsx    # Crypto price ticker
│   └── LiveStats.tsx       # Statistics dashboard
├── services/
│   ├── realtime.ts         # WebSocket service
│   ├── mockData.ts         # Mock data generator for fallback
│   └── clob.ts             # CLOB client service (optional)
├── store/
│   └── usePolymarketStore.ts # Zustand global store
├── types/
│   └── polymarket.ts       # TypeScript type definitions
├── lib/
│   ├── utils.ts            # Utility functions
│   └── crypto.ts           # Crypto price conversion utilities
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🔌 WebSocket Topics

The app subscribes to the following Polymarket WebSocket topics:

### Market Activity
- `activity:trades` - Live trade executions
- `activity:orders_matched` - Order matching events
- `comments:comment_created` - User comments on markets
- `comments:reaction_created` - Comment likes/dislikes

### Crypto Prices
- `crypto_prices:price_update` - Individual crypto price updates
- `crypto_prices:snapshot` - Initial batch of all crypto prices

Supported cryptocurrencies:
- **BTC** (Bitcoin), **ETH** (Ethereum), **SOL** (Solana)
- **USDC** (USD Coin), **MATIC** (Polygon)
- **XRP** (Ripple), **ADA** (Cardano), **DOGE** (Dogecoin)
- **AVAX** (Avalanche), **DOT** (Polkadot), **LINK** (Chainlink)

### CLOB Market Data
- `clob_market:agg_orderbook` - Aggregated order book snapshots (with filters)
- `clob_market:price_change` - Market price changes (with filters)
- `clob_market:market_resolved` - Market resolution events

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file for optional configuration:

```bash
# WebSocket URL (defaults to production)
NEXT_PUBLIC_WS_URL=wss://realtime.polymarket.com

# Optional: CLOB API credentials (for authenticated features)
# NEXT_PUBLIC_CLOB_API_KEY=your_api_key
# NEXT_PUBLIC_CLOB_SECRET=your_secret
# NEXT_PUBLIC_CLOB_PASSPHRASE=your_passphrase
```

### WebSocket Reconnection

The app automatically handles disconnections with:
- **Max Attempts**: 10
- **Initial Delay**: 1000ms
- **Strategy**: Exponential backoff
- **Heartbeat**: 30 seconds

## 🎯 State Management

### Zustand Store

Global state is managed with Zustand for maximum performance:

```typescript
const store = usePolymarketStore();

// Market Activity Data
store.trades          // Array of recent trades (max 100)
store.comments        // Array of recent comments (max 50)
store.reactions       // Array of comment reactions

// Crypto Pricing Data
store.cryptoPrices    // Map<string, CryptoPrice> - Live crypto prices

// CLOB Data
store.orderbooks      // Map of order books by market
store.priceChanges    // Map of price changes by market
store.clobAuth        // CLOB authentication state

// Connection State
store.connected       // WebSocket connection status
store.connecting      // Connection in progress
store.error           // Connection error message
```

### Crypto Price Utilities

Use the crypto utilities for USD conversions:

```typescript
import { getUSDEquivalent, formatUSD } from "@/lib/crypto";

// Convert token amount to USD
const usdValue = getUSDEquivalent(100, "USDC", cryptoPrices);

// Format USD amount
const formatted = formatUSD(usdValue); // "$100.00"
```

See [CRYPTO_PRICES.md](./CRYPTO_PRICES.md) for complete crypto pricing documentation.
```


## 🎨 Customization

### Adding New Components

All components follow the straight-line design system:

```tsx
<div className="panel">
  {/* Your content */}
</div>
```

### Custom Colors

Edit `tailwind.config.ts` to modify the color palette:

```typescript
colors: {
  buy: "#00FF9C",    // Change buy color
  sell: "#FF3C3C",   // Change sell color
  neutral: "#55AFFF" // Change neutral color
}
```

### Adding Topics

Subscribe to additional WebSocket topics in `app/page.tsx`:

```typescript
realtimeService.subscribe("your_topic_here", {
  // Optional filters
});
```

## 📊 Performance

- **Target Latency**: < 200ms from WebSocket to UI
- **Max Trades Stored**: 100 (prevents memory bloat)
- **Max Comments Stored**: 50
- **Reconnection**: Automatic with exponential backoff
- **Rendering**: React 18 concurrent features

## 🐛 Debugging

Enable console logs to debug WebSocket connections:

```typescript
// In services/realtime.ts
console.log("Message received:", message);
```

Check connection status in the UI:
- 🟢 **Green** = Connected
- 🔵 **Blue** = Connecting (pulsing)
- 🔴 **Red** = Disconnected

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment

Make sure to set environment variables in your deployment platform.

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Polymarket** - For the real-time WebSocket API
- **Next.js Team** - For the amazing framework
- **shadcn** - For the beautiful UI components
- **Zustand** - For lightweight state management

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check Polymarket API documentation
- Review the PRD in the project

## 📚 Documentation

- **[CRYPTO_PRICES.md](./CRYPTO_PRICES.md)** - Complete crypto pricing integration guide
- **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - CLOB integration and advanced features
- **[FEATURES.md](./FEATURES.md)** - Detailed feature documentation

## 🔮 Future Enhancements

### Crypto Pricing
- [ ] Mini sparkline charts for 24h price trends
- [ ] Price alerts and notifications
- [ ] Historical price data storage
- [ ] Advanced analytics (RSI, MACD, Bollinger Bands)
- [ ] Custom crypto watchlists

### General Features
- [ ] Historical data replay
- [ ] Custom alerts & notifications
- [ ] Market-specific filtering
- [ ] Advanced charting (candlesticks, volume)
- [ ] User authentication for private data
- [ ] Export data to CSV
- [ ] Mobile app version
- [ ] Multi-market comparison
- [ ] Telegram/Discord bot integration

---

**Built with ❤️ using Next.js 15, TypeScript, and the Polymarket API**