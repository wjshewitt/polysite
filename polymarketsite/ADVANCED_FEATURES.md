# Advanced Features Documentation

## Overview

The Polymarket Live Monitor now includes advanced CLOB (Central Limit Order Book) integration, tabbed navigation, enhanced orderbook depth visualization, and authenticated user order management.

## 🎯 New Features

### 1. Tabbed Navigation System

**Location**: Top of the page, below the main title

**Tabs Available**:
- **MAIN DASHBOARD**: Live markets, trades, crypto prices, and diagnostics
- **ORDERBOOK DEPTH**: Advanced market depth visualization with liquidity analysis
- **MY ORDERS**: User order management (requires authentication)

**Navigation**:
- Use arrow buttons (← →) to switch between tabs
- Click tab indicators at the bottom to jump directly
- Keyboard-friendly navigation

**Visual Indicators**:
- Active tab highlighted in blue (#55AFFF)
- Locked icon (🔒) on "My Orders" when not authenticated
- Tab descriptions shown in the header

---

## 🔐 CLOB Authentication

### Authentication Methods

**1. Private Key Authentication**
- Enter your Ethereum private key
- System derives API credentials securely on the server
- Never stored in browser

**2. API Key Authentication**
- Use existing Polymarket API credentials
- Requires: API Key, Secret, and Passphrase
- Validated through secure backend endpoint

### Security Features

✅ **Server-side credential derivation**
- Private keys never exposed to frontend
- API credentials generated via secure backend (`/api/clob/auth`)

✅ **No browser storage**
- Credentials kept in memory only
- Cleared on disconnect

✅ **Backend validation**
- All credentials validated before use
- Test connection before accepting credentials

### Authentication Flow

```
1. User clicks "CONNECT" button
2. Chooses authentication method (Private Key or API Key)
3. Enters credentials
4. Backend validates/derives credentials
5. CLOB client initialized
6. User can now access authenticated features
```

---

## 📊 Orderbook Depth (Tab 2)

### Features

**Market Selection**
- Select any market to view detailed orderbook
- Auto-refreshes every 5 seconds (configurable)
- Manual refresh mode available

**Orderbook Visualization**
- **Bids (Buy Orders)**: Green color-coded, left side
- **Asks (Sell Orders)**: Red color-coded, right side
- **Depth Bars**: Visual representation of order size
- **Price Levels**: Up to 20 levels per side

**Market Metadata**
- Tick size (minimum price increment)
- Minimum order size
- Negative risk flag indicator
- Market status (active/closed)

**Spread Analysis**
- Real-time spread calculation
- Spread percentage
- Number of bid/ask levels
- Last update timestamp

### Data Displayed

Each order level shows:
- **Price**: 4 decimal precision
- **Size**: Total quantity at that price
- **Total**: Price × Size (order value)
- **Depth Bar**: Visual size indicator (relative to max)

### Advanced Metrics

```
Spread: 0.0234 (4.68%)
Levels: 15 / 18
Last Updated: 12:34:56 PM
```

---

## 💼 My Orders (Tab 3)

**Requires Authentication** 🔒

### Features

**Order List**
- All open orders for authenticated user
- Auto-refreshes every 10 seconds
- Real-time status updates

**Order Information**
- Side: BUY or SELL (color-coded)
- Outcome: Market outcome selected
- Price: Limit price (4 decimals)
- Size: Remaining quantity
- Fill Progress: Visual progress bar
- Timestamp: When order was placed
- Order ID: Unique identifier

**Order Management**
- **Cancel Individual**: Click × button on any order
- **Cancel All**: Batch cancel all open orders
- **Status Tracking**: LIVE, MATCHED, CANCELLED

### Order Display

```
┌────────────────────────────────────┐
│ [BUY] Yes                          │
│ 5 minutes ago                  [×] │
│                                    │
│ Price        Size                  │
│ 0.6500       1,250                 │
│                                    │
│ Filled                      25.0%  │
│ ████████░░░░░░░░░░░░░░░░░░░░       │
│                                    │
│ ID: a1b2c3d4e5f6g7h8...            │
└────────────────────────────────────┘
```

---

## 🔄 Real-time WebSocket Topics

### New Subscriptions

**CLOB Market Topics**
```javascript
// Price changes for all markets
topic: "clob_market"
type: "price_change"

// Market resolution events
topic: "clob_market"
type: "market_resolved"

// Aggregated orderbook (requires asset IDs)
topic: "clob_market"
type: "agg_orderbook"
filters: JSON.stringify(["asset1", "asset2"])
```

**User Topics** (Authenticated)
```javascript
// User's trades
topic: "clob_user"
type: "trade"
```

### Subscription Management

```typescript
// Subscribe to orderbook for specific assets
realtimeService.subscribeToOrderbook(["100", "200", "300"]);

// Subscribe to authenticated user topics
realtimeService.subscribeToUserTopics();
```

---

## 🛠️ Technical Implementation

### CLOB Client Integration

**Read-Only Mode** (Default)
```typescript
// Initialized automatically on page load
await clobService.initializeReadOnly();

// Can fetch public data:
- Market metadata
- Orderbook depth
- Price information
```

**Authenticated Mode**
```typescript
// After user authenticates
await clobService.authenticate({
  chainId: 137,
  apiKey: credentials.apiKey,
  apiSecret: credentials.apiSecret,
  apiPassphrase: credentials.apiPassphrase,
});

// Can now:
- View user orders
- Place new orders
- Cancel orders
```

### State Management

**Zustand Store Additions**
```typescript
interface PolymarketStore {
  // CLOB Authentication
  clobAuth: ClobAuthState;
  setClobAuth: (auth: ClobAuthState) => void;
  clearClobData: () => void;
  
  // User Orders
  userOrders: UserOrder[];
  setUserOrders: (orders: UserOrder[]) => void;
  addUserOrder: (order: UserOrder) => void;
  removeUserOrder: (orderId: string) => void;
  
  // Market Data
  marketMetadata: Map<string, MarketMetadata>;
  orderbookDepth: Map<string, OrderbookDepth>;
  updateMarketMetadata: (metadata: MarketMetadata) => void;
  updateOrderbookDepth: (depth: OrderbookDepth) => void;
  
  // Selected Market
  selectedMarket: string | null;
  setSelectedMarket: (marketId: string | null) => void;
}
```

---

## 📡 API Endpoints

### `/api/clob/auth` (POST)

**Action: derive**
- Derives API credentials from private key
- Returns: address, credentials

**Action: validate**
- Validates existing API credentials
- Returns: valid (boolean)

**Security**
- Private keys processed server-side only
- Credentials never logged or stored
- Rate limiting recommended in production

---

## 🎨 UI Components

### New Components

1. **`TabNavigation`**
   - Arrow-based navigation
   - Tab indicators
   - Responsive design

2. **`ClobAuth`**
   - Authentication form
   - Connection status
   - Disconnect button

3. **`OrderbookDepth`**
   - Split bid/ask display
   - Depth visualization
   - Market metadata panel

4. **`MyOrders`**
   - Order cards
   - Cancel functionality
   - Fill progress bars

---

## 🔧 Configuration

### Environment Variables (Recommended for Production)

```env
# Private key for server-side operations (DO NOT COMMIT)
POLYMARKET_PRIVATE_KEY=0x...

# API credentials for service account
POLYMARKET_API_KEY=...
POLYMARKET_API_SECRET=...
POLYMARKET_API_PASSPHRASE=...

# Chain ID (137 = Polygon mainnet, 80001 = Mumbai testnet)
POLYMARKET_CHAIN_ID=137
```

### CLOB Configuration

```typescript
interface ClobConfig {
  chainId: number;          // 137 for Polygon mainnet
  privateKey?: string;      // Optional: for derivation
  apiKey?: string;          // Optional: existing credentials
  apiSecret?: string;
  apiPassphrase?: string;
}
```

---

## 📈 Performance Considerations

### Auto-Refresh Rates

- **Orderbook Depth**: 5 seconds (configurable)
- **User Orders**: 10 seconds (configurable)
- **Manual Mode**: Disabled auto-refresh, refresh on demand

### Data Efficiency

- Orderbook limited to 20 levels per side
- Map-based storage for O(1) lookups
- Selective state subscriptions (no unnecessary re-renders)

### WebSocket Optimization

- Filtered subscriptions (specific assets only)
- Message throttling for high-frequency updates
- Automatic reconnection with exponential backoff

---

## 🚨 Error Handling

### Connection Failures

- Automatic reconnection (up to 5 attempts)
- Exponential backoff (2s, 4s, 8s, 16s, 32s)
- Fallback to mock data after timeout
- Clear error messages to user

### Authentication Errors

- Invalid credentials: Show error message
- Network errors: Retry with backoff
- Session expiry: Prompt re-authentication

### Order Management Errors

- Failed cancel: Show error, keep order in list
- Rate limiting: Display warning, suggest retry
- Network timeout: Queue for retry

---

## 🔐 Security Best Practices

### DO ✅

- Use environment variables for sensitive keys
- Implement rate limiting on auth endpoint
- Use HTTPS only in production
- Validate all user inputs
- Log authentication attempts (securely)
- Implement session timeouts
- Use secure key management (AWS KMS, Vault)

### DON'T ❌

- Store private keys in browser
- Log API credentials
- Expose credentials in error messages
- Commit credentials to version control
- Use same credentials across environments
- Allow unlimited authentication attempts

---

## 🧪 Testing Checklist

### Authentication
- [ ] Private key authentication works
- [ ] API key authentication works
- [ ] Invalid credentials rejected
- [ ] Disconnect clears all data
- [ ] Re-authentication successful

### Orderbook Depth
- [ ] Orderbook loads for selected market
- [ ] Auto-refresh toggles correctly
- [ ] Spread calculation accurate
- [ ] Depth bars display properly
- [ ] Market metadata shows correctly

### My Orders
- [ ] Orders display when authenticated
- [ ] Cancel individual order works
- [ ] Cancel all orders works
- [ ] Fill progress accurate
- [ ] Real-time updates reflected

### Navigation
- [ ] Tab switching smooth
- [ ] Arrow navigation works
- [ ] Tab indicators clickable
- [ ] Auth-locked tab shows lock icon
- [ ] Layout responsive on all screens

---

## 📚 Additional Resources

### Polymarket SDK Documentation
- CLOB Client: https://github.com/Polymarket/clob-client
- Real-time Data Client: https://github.com/Polymarket/real-time-data-client

### API References
- Gamma API: https://docs.polymarket.com/#gamma-api
- CLOB API: https://docs.polymarket.com/#clob-api

### Related Files
- `services/clob.ts` - CLOB client service
- `app/api/clob/auth/route.ts` - Authentication endpoint
- `components/TabNavigation.tsx` - Tab system
- `components/OrderbookDepth.tsx` - Orderbook visualization
- `components/MyOrders.tsx` - Order management
- `components/ClobAuth.tsx` - Authentication UI

---

## 🚀 Future Enhancements

### Planned Features

1. **Order Placement UI**
   - Form to create new orders
   - Price validation
   - Size validation
   - Estimated fees

2. **Historical Data**
   - Trade history for user
   - P&L tracking
   - Portfolio analytics

3. **Advanced Charting**
   - Price charts with technical indicators
   - Volume profile
   - Order flow visualization

4. **Notifications**
   - Order fill alerts
   - Market resolution notifications
   - Price alerts

5. **Multi-Market Trading**
   - Batch order placement
   - Portfolio rebalancing
   - Market making tools

6. **Mobile Optimization**
   - Touch-friendly controls
   - Swipe navigation
   - Mobile-specific layouts

---

## 📞 Support & Troubleshooting

### Common Issues

**"Waiting for crypto prices"**
- Check WebSocket connection status
- Verify subscription logs in console
- Ensure mock data fallback is working

**"Authentication failed"**
- Verify private key format (0x...)
- Check API credentials are correct
- Ensure network connectivity
- Try alternative auth method

**"No orderbook data available"**
- Verify market/asset ID is correct
- Check if market is active
- Enable auto-refresh
- Manually refresh

**Orders not showing**
- Confirm authentication successful
- Check if you have open orders
- Verify correct Polygon chain
- Refresh the orders list

### Debug Mode

Enable verbose logging:
```javascript
localStorage.setItem('DEBUG', 'polymarket:*');
```

This will show detailed logs for:
- WebSocket connections
- API calls
- State updates
- Error details

---

## 📝 Changelog

### v2.0.0 - CLOB Integration

**Added**
- Tabbed navigation system
- CLOB client integration
- Authentication (private key & API key)
- Orderbook depth visualization
- User order management
- Advanced market metadata
- Real-time CLOB topics

**Enhanced**
- Crypto price subscriptions (10 symbols)
- Layout reorganization
- Error handling
- Type safety

**Security**
- Server-side credential handling
- No client-side key storage
- Backend validation
- Secure API endpoints

---

*For additional help or feature requests, please refer to the project README or open an issue on GitHub.*