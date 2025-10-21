import {
  RealTimeDataClient,
  ConnectionStatus,
} from "@polymarket/real-time-data-client";
import { Message } from "@polymarket/real-time-data-client";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import {
  Trade,
  Comment,
  Reaction,
  AggOrderbook,
  PriceChange,
} from "@/types/polymarket";
import { NormalizedMarket } from "@/types/markets";
import { mockDataGenerator } from "./mockData";
import { normalizeCryptoPricePayload } from "./cryptoPriceNormalizer";

type WebSocketLike = {
  readyState?: number;
  send?: (data: any) => void;
};

const SOCKET_READY_STATE_OPEN = 1;
const SOCKET_READY_STATE_CLOSING = 2;
const SOCKET_READY_STATE_CLOSED = 3;

class RealtimeService {
  private client: RealTimeDataClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 12;
  private reconnectDelay = 5000; // 5 seconds
  private connectionTimeout = 10000; // 10 seconds
  private connectionTimeoutId: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval = 30000; // 30 seconds
  private staleThreshold = 60000; // 1 minute
  private lastMessageAt = 0;
  private lastSocketEventAt = 0;
  private keepAliveGracePeriod = 10000; // 10 seconds grace after keep-alive
  private pendingKeepAlive = false;
  private keepAliveSentAt: number | null = null;
  private isConnected = false;
  private isConnecting = false;
  private useMockData = false;
  private mockDataStarted = false;
  private wsHost: string;
  private lastConnectionAttempt = 0;
  private minConnectionInterval = 2000; // Minimum 2 seconds between connection attempts
  private readonly defaultRealtimeHost = "wss://realtime.polymarket.com";

  // Trade buffering with adaptive release rate for smooth display + low latency
  private tradeBuffer: Trade[] = [];
  private tradeBufferTimer: NodeJS.Timeout | null = null;
  private currentReleaseInterval = 250; // Dynamic interval, starts at 250ms
  
  // Adaptive release rate thresholds
  private readonly minReleaseInterval = 50;    // Fastest: 50ms (20 trades/sec) during spikes
  private readonly maxReleaseInterval = 400;   // Slowest: 400ms (2.5 trades/sec) when quiet
  private readonly normalReleaseInterval = 250; // Normal: 250ms (4 trades/sec)

  constructor() {
    const realtimeHost =
      process.env.NEXT_PUBLIC_POLYMARKET_REALTIME_WS_URL?.trim();
    const legacyHost = process.env.NEXT_PUBLIC_POLYMARKET_WS_URL?.trim();
    const deprecatedHost = process.env.NEXT_PUBLIC_WS_URL?.trim();

    this.wsHost =
      realtimeHost || legacyHost || deprecatedHost || this.defaultRealtimeHost;

    if (deprecatedHost && !realtimeHost && typeof window !== "undefined") {
      console.warn(
        "[RealtimeService] NEXT_PUBLIC_WS_URL is deprecated. Set NEXT_PUBLIC_POLYMARKET_REALTIME_WS_URL instead.",
      );
    }

    if (this.wsHost.includes("/ws")) {
      console.warn(
        "[RealtimeService] Host appears to target the CLOB websocket. Expected real-time endpoint (e.g. wss://ws-live-data.polymarket.com).",
      );
    }

    if (typeof window !== "undefined") {
      console.log(`🌐 Real-time host configured: ${this.wsHost}`);
    }
  }

  private handleConnect = (client: RealTimeDataClient): void => {
    console.log(
      `✅ Connected to Polymarket Real-Time Service at ${this.wsHost}`,
    );
    console.log("🔌 WebSocket connection established successfully");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.lastMessageAt = Date.now();
    this.lastSocketEventAt = Date.now();
    this.pendingKeepAlive = false;
    this.keepAliveSentAt = null;

    // Clear connection timeout since we connected successfully
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopMockDataIfRunning();
    this.startHeartbeat();

    usePolymarketStore.getState().setConnected(true);

    // Subscribe to all configured topics
    console.log("📡 Starting topic subscriptions...");
    this.subscribeToTopics(client);
    console.log("✅ All subscriptions completed");
  };

  private handleMessage = (
    client: RealTimeDataClient,
    message: Message,
  ): void => {
    try {
      this.lastMessageAt = Date.now();
      this.lastSocketEventAt = this.lastMessageAt;
      if (this.pendingKeepAlive) {
        this.pendingKeepAlive = false;
      }
      if (this.keepAliveSentAt !== null) {
        this.keepAliveSentAt = null;
      }
      if (this.reconnectAttempts !== 0) {
        this.reconnectAttempts = 0;
      }
      console.log(
        "📨 Message received - Topic:",
        message.topic,
        "Type:",
        message.type,
      );

      // Extra logging for crypto prices to debug
      if (message.topic === "crypto_prices") {
        console.log(
          "💰 Crypto price message payload:",
          JSON.stringify(message.payload).substring(0, 200),
        );
      }

      this.dispatchMessage(message);
    } catch (error: unknown) {
      console.error("❌ Error handling message:", error);
    }
  };

  private handleStatusChange = (status: ConnectionStatus): void => {
    console.log("📡 Connection status changed:", status);

    if (status === ConnectionStatus.CONNECTED) {
      console.log("✅ Connected via status change");
      this.isConnected = true;
      this.isConnecting = false;
      this.lastMessageAt = Date.now();
      this.lastSocketEventAt = Date.now();
      this.pendingKeepAlive = false;
      this.keepAliveSentAt = null;
      this.reconnectAttempts = 0;
      usePolymarketStore.getState().setConnected(true);
    } else if (status === ConnectionStatus.DISCONNECTED) {
      console.log("⚠️ Disconnected from Polymarket Real-Time Service");
      this.isConnected = false;
      this.isConnecting = false;
      this.client = null;
      this.stopHeartbeat();
      this.pendingKeepAlive = false;
      this.lastSocketEventAt = Date.now();
      this.keepAliveSentAt = null;
      usePolymarketStore.getState().setConnected(false);

      // Don't attempt reconnect if using mock data
      if (!this.useMockData) {
        this.attemptReconnect("status_change");
      }
    } else if (status === ConnectionStatus.CONNECTING) {
      console.log("🔄 Connecting to Polymarket Real-Time Service");
      this.isConnecting = true;
      this.lastSocketEventAt = Date.now();
      this.keepAliveSentAt = null;
      usePolymarketStore.getState().setConnecting(true);
    }
  };

  private subscribeToTopics(client: RealTimeDataClient): void {
    try {
      console.log("📡 [1/5] Subscribing to activity:trades...");
      // Subscribe to activity trades
      client.subscribe({
        subscriptions: [
          {
            topic: "activity",
            type: "trades",
            filters: "", // Empty means no filter
          },
        ],
      });
      console.log("✓ Subscribed to activity:trades");

      console.log("📡 [2/5] Subscribing to comments...");
      // Subscribe to all comments
      client.subscribe({
        subscriptions: [
          {
            topic: "comments",
            type: "*", // All comment types
            filters: "",
          },
        ],
      });
      console.log("✓ Subscribed to comments");

      // Subscribe to crypto prices - Each symbol needs its own subscription with filters
      console.log(
        "📡 [3/5] Subscribing to crypto_prices for multiple symbols...",
      );

      const cryptoSymbols = Array.from(
        new Set([
          "BTCUSDT",
          "ETHUSDT",
          "SOLUSDT",
          "XRPUSDT",
          "ADAUSDT",
          "DOGEUSDT",
          "MATICUSDT",
          "AVAXUSDT",
          "DOTUSDT",
          "LINKUSDT",
        ]),
      );

      try {
        // Subscribe to each crypto symbol individually with proper filters.
        // The realtime API expects lowercase tokens with "-usd" suffix in filters.
        let subscriptionCount = 0;
        cryptoSymbols.forEach((symbol) => {
          const filterSymbol = symbol.toLowerCase().replace("usdt", "-usd");

          try {
            client.subscribe({
              subscriptions: [
                {
                  topic: "crypto_prices",
                  type: "update",
                  filters: JSON.stringify({ symbol: filterSymbol }),
                },
              ],
            });
            subscriptionCount++;
            console.log(
              `  ✓ [${subscriptionCount}/${cryptoSymbols.length}] Subscribed to crypto_prices:${filterSymbol}`,
            );
          } catch (err) {
            console.error(`  ✗ Failed to subscribe to ${filterSymbol}:`, err);
          }
        });
        console.log(
          `✅ Successfully subscribed to ${subscriptionCount}/${cryptoSymbols.length} crypto symbols`,
        );
      } catch (error: unknown) {
        console.error("❌ Critical error subscribing to crypto_prices:", error);
      }

      console.log("📡 [4/5] Subscribing to CLOB market topics...");
      // Subscribe to CLOB market topics
      // Price changes for all markets
      const assetFilters = this.getTrackedAssetIds();
      if (assetFilters.length > 0) {
        client.subscribe({
          subscriptions: [
            {
              topic: "clob_market",
              type: "price_change",
              filters: JSON.stringify(assetFilters),
            },
          ],
        });
        console.log(
          `✓ Subscribed to clob_market:price_change for ${assetFilters.length} assets`,
        );
      } else {
        console.warn(
          "⚠️ Skipping clob_market:price_change subscription - no asset filters available",
        );
      }

      console.log("📡 [5/5] Subscribing to market resolved events...");
      // Market resolved events
      client.subscribe({
        subscriptions: [
          {
            topic: "clob_market",
            type: "market_resolved",
            filters: "",
          },
        ],
      });
      console.log("✓ Subscribed to clob_market:market_resolved");

      console.log("🎉 All topic subscriptions completed successfully!");
    } catch (error: unknown) {
      console.error("Error subscribing to topics:", error);
    }
  }

  private getTrackedAssetIds(): string[] {
    const state = usePolymarketStore.getState();
    const assetSet = new Set<string>();

    state.orderbooks.forEach((orderbook) => {
      if (orderbook.asset) {
        assetSet.add(orderbook.asset);
      }
    });

    state.priceChanges.forEach((change) => {
      if (change.asset) {
        assetSet.add(change.asset);
      }
    });

    state.markets.forEach((market) => {
      (market.clobTokenIds || []).forEach((tokenId) => assetSet.add(tokenId));
    });

    return Array.from(assetSet).filter(Boolean);
  }

  private dispatchMessage(message: Message): void {
    const store = usePolymarketStore.getState();

    try {
      switch (message.topic) {
        case "activity":
          if (message.type === "trades" || message.type === "orders_matched") {
            this.handleTradeMessage(message.payload, store);
          }
          break;

        case "comments":
          if (message.type === "comment_created") {
            this.handleCommentMessage(message.payload, store);
          } else if (
            message.type === "reaction_created" ||
            message.type === "reaction_removed"
          ) {
            this.handleReactionMessage(message.payload, store);
          }
          break;

        case "crypto_prices":
        case "crypto_prices_chainlink":
          if (message.type === "update") {
            this.handleCryptoPriceMessage(message.payload, store);
          }
          break;

        case "clob_market":
          if (message.type === "agg_orderbook") {
            this.handleOrderbookMessage(message.payload, store);
          } else if (message.type === "price_change") {
            this.handlePriceChangeMessage(message.payload, store);
          } else if (message.type === "market_resolved") {
            this.handleMarketResolvedMessage(message.payload, store);
          }
          break;

        case "clob_user":
          if (message.type === "trade") {
            this.handleUserTradeMessage(message.payload, store);
          }
          break;

        default:
          console.log("Unhandled message topic:", message.topic, message.type);
      }
    } catch (error: unknown) {
      console.error("Error dispatching message:", error);
    }
  }

  private handleTradeMessage(payload: any, store: any): void {
    const trade: Trade = {
      id: payload.id || `${Date.now()}-${Math.random()}`,
      market: payload.conditionId || payload.market || "",
      marketTitle: payload.title || payload.eventSlug || "Unknown Market",
      eventSlug: payload.eventSlug || payload.event_slug || undefined,
      asset: payload.asset || "",
      side: payload.side || "BUY",
      size: payload.size?.toString() || "0",
      price: payload.price?.toString() || "0",
      timestamp: payload.timestamp || Date.now(),
      maker: payload.maker_address || "",
      taker: payload.proxyWallet || "",
      tradeId: payload.id || payload.transactionHash || "",
      outcome: payload.outcome || "",
      outcomeIndex: payload.outcomeIndex || 0,
      feeRateBps: payload.fee_rate_bps || "0",
      status: payload.status || "matched",
    };

    // Add trade to buffer instead of directly to store
    this.tradeBuffer.push(trade);

    // Start the release timer if not already running
    if (!this.tradeBufferTimer) {
      this.startTradeBufferRelease();
    }
  }

  // Release trades from buffer with adaptive rate based on buffer size
  // - During spikes: faster release for low latency
  // - During normal flow: slower release for smoothness
  private startTradeBufferRelease(): void {
    if (this.tradeBufferTimer) {
      return; // Already running
    }

    const releaseOneTrade = () => {
      const store = usePolymarketStore.getState();
      const bufferSize = this.tradeBuffer.length;

      // Adaptive interval based on buffer size
      if (bufferSize === 0) {
        // Empty buffer - maintain current interval
        this.currentReleaseInterval = this.normalReleaseInterval;
      } else if (bufferSize >= 15) {
        // Large spike: 15+ trades queued - clear very fast
        this.currentReleaseInterval = this.minReleaseInterval;
      } else if (bufferSize >= 10) {
        // Significant spike: 10-14 trades - clear fast
        this.currentReleaseInterval = 75;
      } else if (bufferSize >= 6) {
        // Moderate spike: 6-9 trades - speed up
        this.currentReleaseInterval = 125;
      } else if (bufferSize >= 3) {
        // Small buildup: 3-5 trades - slightly faster
        this.currentReleaseInterval = 200;
      } else {
        // Low buffer: 1-2 trades - smooth normal pace
        this.currentReleaseInterval = this.normalReleaseInterval;
      }

      // Release one trade if available
      if (bufferSize > 0) {
        const trade = this.tradeBuffer.shift()!;
        store.addTrade(trade);
      }

      // Schedule next release with adaptive interval
      if (this.tradeBufferTimer) {
        clearTimeout(this.tradeBufferTimer);
      }
      this.tradeBufferTimer = setTimeout(releaseOneTrade, this.currentReleaseInterval) as any;
    };

    // Start the release cycle
    this.tradeBufferTimer = setTimeout(releaseOneTrade, this.currentReleaseInterval) as any;
  }

  // Stop releasing trades from buffer
  private stopTradeBufferRelease(): void {
    if (this.tradeBufferTimer) {
      clearTimeout(this.tradeBufferTimer);
      this.tradeBufferTimer = null;
    }
  }

  // Flush remaining buffered trades to store (called on disconnect)
  private flushTradeBuffer(): void {
    const store = usePolymarketStore.getState();
    while (this.tradeBuffer.length > 0) {
      const trade = this.tradeBuffer.shift()!;
      store.addTrade(trade);
    }
  }

  private handleCommentMessage(payload: any, store: any): void {
    const comment: Comment = {
      id: payload.id || `${Date.now()}`,
      marketId: payload.parentEntityID?.toString() || "",
      userId: payload.userAddress || "",
      username: payload.userAddress?.slice(0, 8) || "Anonymous",
      userImage: undefined,
      content: payload.body || "",
      timestamp: payload.createdAt
        ? new Date(payload.createdAt).getTime()
        : Date.now(),
      replyTo: payload.parentCommentID || undefined,
      likes: 0,
      dislikes: 0,
    };

    store.addComment(comment);
  }

  private handleReactionMessage(payload: any, store: any): void {
    const reaction: Reaction = {
      id: payload.id || `${Date.now()}`,
      commentId: payload.commentID?.toString() || "",
      userId: payload.userAddress || "",
      username: payload.userAddress?.slice(0, 8) || "Anonymous",
      type: payload.reactionType === "like" ? "LIKE" : "DISLIKE",
      timestamp: payload.createdAt
        ? new Date(payload.createdAt).getTime()
        : Date.now(),
    };

    store.addReaction(reaction);
  }

  private handleCryptoPriceMessage(payload: any, store: any): void {
    console.log("💰 Crypto price update received");
    console.log("   Payload keys:", Object.keys(payload).join(", "));
    console.log("   Full payload:", JSON.stringify(payload, null, 2));

    // Handle snapshot format (initial batch of prices)
    if (Array.isArray(payload)) {
      console.log(`💰 Processing snapshot with ${payload.length} prices`);
      payload.forEach((priceData: any) => {
        const cryptoPrice = normalizeCryptoPricePayload(priceData);

        if (cryptoPrice) {
          console.log(
            `💰 Snapshot: ${cryptoPrice.symbol} = $${cryptoPrice.price}`,
          );
          store.updateCryptoPrice(cryptoPrice);
        } else {
          console.warn("⚠️ Snapshot entry missing symbol or price:", priceData);
        }
      });
      return;
    }

    // Handle single price update format (most common)
    // Message format: { symbol: "ETHUSDT", timestamp: 123456, value: 2345.12 }
    if (payload.symbol) {
      const cryptoPrice = normalizeCryptoPricePayload(payload);

      if (cryptoPrice) {
        console.log(`💰 Update: ${cryptoPrice.symbol} = $${cryptoPrice.price}`);
        store.updateCryptoPrice(cryptoPrice);
      } else {
        console.warn("⚠️ Crypto price update missing usable fields:", payload);
      }
      return;
    }

    // Handle data array format (historical or batch updates)
    if (
      payload.data &&
      Array.isArray(payload.data) &&
      payload.data.length > 0
    ) {
      const latest = payload.data[payload.data.length - 1];
      if (latest) {
        const cryptoPrice = normalizeCryptoPricePayload(latest, payload.symbol);

        if (cryptoPrice) {
          console.log(
            `💰 Array update: ${cryptoPrice.symbol} = $${cryptoPrice.price}`,
          );
          store.updateCryptoPrice(cryptoPrice);
        } else {
          console.warn(
            "⚠️ Array update missing symbol after normalization:",
            latest,
          );
        }
        return;
      }
    }

    console.warn("⚠️ Crypto price message has unexpected format:", payload);
  }

  private handleOrderbookMessage(payload: any, store: any): void {
    const orderbook: AggOrderbook = {
      market: payload.market || "",
      asset: payload.asset_id || "",
      timestamp: payload.timestamp || Date.now(),
      bids: (payload.bids || []).map((bid: any) => ({
        price: bid.price || "0",
        size: bid.size || "0",
      })),
      asks: (payload.asks || []).map((ask: any) => ({
        price: ask.price || "0",
        size: ask.size || "0",
      })),
    };

    store.updateOrderbook(orderbook);

    if (orderbook.market) {
      store.updateEventOutcomeByCondition(
        orderbook.market,
        (marketData: NormalizedMarket) => ({
          ...marketData,
          lastUpdated: Date.now(),
        }),
      );
    }
  }

  private handlePriceChangeMessage(payload: any, store: any): void {
    if (payload.pc && Array.isArray(payload.pc)) {
      payload.pc.forEach((change: any) => {
        const priceChange: PriceChange = {
          market: payload.m || "",
          asset: change.a || "",
          price: change.p || "0",
          priceChange: "0",
          priceChangePercent: "0",
          timestamp: payload.t || Date.now(),
        };
        store.updatePriceChange(priceChange);

        if (priceChange.market) {
          store.updateEventOutcomeByCondition(
            priceChange.market,
            (marketData: NormalizedMarket) => {
              const outcomeIndex = change.oi ?? marketData.outcomeIndex ?? 0;
              const probability = Number(change.p);

              const outcomes = marketData.outcomes.map((outcome, index) => {
                if (index === outcomeIndex) {
                  return {
                    ...outcome,
                    price: probability,
                    probability,
                    lastUpdated: Date.now(),
                  };
                }
                return outcome;
              });

              return {
                ...marketData,
                outcomes,
                lastUpdated: Date.now(),
              };
            },
          );
        }
      });
    }
  }

  private handleMarketResolvedMessage(payload: any, store: any): void {
    console.log("🏁 Market resolved:", payload);
    // Could add notification system here
    // For now, just log the event
  }

  private handleUserTradeMessage(payload: any, store: any): void {
    console.log("💼 User trade:", payload);
    // This requires authentication and would update user's trade history
    // Implementation depends on authenticated user flow
  }

  private attemptReconnect(reason: string = "unknown"): void {
    if (this.useMockData) {
      console.warn(
        `⚠️ Skipping reconnect attempt (${reason}) because mock data mode is active`,
      );
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    this.stopHeartbeat();
    this.pendingKeepAlive = false;
    this.keepAliveSentAt = null;
    this.isConnecting = false;
    usePolymarketStore.getState().setConnecting(false);

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(
        "⚠️ Max reconnection attempts reached, switching to mock data",
      );
      usePolymarketStore
        .getState()
        .setError("Using mock data - Real-time service unavailable");
      this.startMockDataIfNeeded();
      return;
    }

    this.reconnectAttempts++;
    const baseDelay =
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    const cappedDelay = Math.min(baseDelay, 60000);
    const jitter = Math.random() * 500;
    const delay = Math.floor(cappedDelay + jitter);

    const store = usePolymarketStore.getState();
    if (reason !== "manual") {
      store.setError(
        reason === "idle"
          ? "Connection idle — retrying"
          : "Connection lost — retrying",
      );
    }

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}) — reason: ${reason}`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.client = null;
      this.connect();
    }, delay);
  }

  private startMockDataIfNeeded(): void {
    if (this.mockDataStarted || this.useMockData) {
      return;
    }

    console.log("🎭 Starting mock data generator as fallback...");
    this.useMockData = true;
    this.mockDataStarted = true;
    usePolymarketStore.getState().setConnected(true);
    usePolymarketStore
      .getState()
      .setError("Using mock data - WebSocket unavailable");

    const store = usePolymarketStore.getState();

    mockDataGenerator.start(
      (trade) => store.addTrade(trade),
      (comment) => store.addComment(comment),
      (price) => {
        console.log("🎭 Mock crypto price:", price.symbol, price.price);
        store.updateCryptoPrice(price);
      },
      (orderbook) => store.updateOrderbook(orderbook),
    );
  }

  private stopMockDataIfRunning(): void {
    if (!this.mockDataStarted) {
      this.useMockData = false;
      return;
    }

    mockDataGenerator.stop();
    this.mockDataStarted = false;
    this.useMockData = false;
    console.log("🎭 Mock data generator stopped after reconnect");
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.lastMessageAt = Date.now();
    this.lastSocketEventAt = this.lastMessageAt;
    this.pendingKeepAlive = false;
    this.keepAliveSentAt = null;

    const monitorInterval = Math.max(5000, Math.floor(this.heartbeatInterval / 2));

    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected || this.useMockData || !this.client) {
        return;
      }

      const ws = (this.client as any)?.ws as WebSocketLike | undefined;
      if (!ws || typeof ws.readyState !== "number") {
        return;
      }

      const now = Date.now();
      const silenceDuration = now - this.lastMessageAt;

      if (ws.readyState === SOCKET_READY_STATE_OPEN) {
        if (silenceDuration > this.staleThreshold) {
          if (!this.pendingKeepAlive) {
            console.warn(
              `🫥 No messages for ${Math.round(silenceDuration / 1000)}s — sending keep-alive ping`,
            );
            try {
              ws.send?.("ping");
              this.pendingKeepAlive = true;
              this.keepAliveSentAt = now;
              this.lastSocketEventAt = now;
            } catch (error) {
              console.error("❌ Failed to send keep-alive ping:", error);
              this.forceReconnect("keep_alive_ping_failed");
            }
          } else if (
            this.keepAliveSentAt !== null &&
            now - this.keepAliveSentAt > this.keepAliveGracePeriod
          ) {
            console.warn(
              `🫥 Keep-alive unanswered for ${Math.round((now - this.keepAliveSentAt) / 1000)}s — forcing reconnect`,
            );
            this.forceReconnect("keep_alive_timeout");
          }
        }
      } else if (
        ws.readyState === SOCKET_READY_STATE_CLOSING ||
        ws.readyState === SOCKET_READY_STATE_CLOSED
      ) {
        console.warn(
          `⚠️ WebSocket readyState=${ws.readyState}, forcing reconnect`,
        );
        this.forceReconnect("socket_not_open");
      }
    }, monitorInterval) as any;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.pendingKeepAlive = false;
    this.keepAliveSentAt = null;
  }

  private forceReconnect(reason: string): void {
    console.warn(`🔄 Forcing reconnect (${reason})`);
    this.stopHeartbeat();
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (error) {
        console.error("Error forcing disconnect:", error);
      }
      this.client = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    usePolymarketStore.getState().setConnected(false);
    usePolymarketStore.getState().setConnecting(false);
    this.attemptReconnect(reason);
  }

  public connect(): void {
    // Prevent rapid reconnection attempts
    const timeSinceLastAttempt = Date.now() - this.lastConnectionAttempt;
    if (
      timeSinceLastAttempt < this.minConnectionInterval &&
      this.lastConnectionAttempt > 0
    ) {
      console.log(
        `⏳ Cooldown: ${Math.round((this.minConnectionInterval - timeSinceLastAttempt) / 1000)}s remaining`,
      );
      return;
    }

    if (this.client || this.isConnected || this.isConnecting) {
      console.log("Already connected or connecting");
      return;
    }

    try {
      this.lastConnectionAttempt = Date.now();
      this.isConnecting = true;
      this.stopHeartbeat();

      console.log("🔌 Initializing Polymarket Real-Time Client...");
      console.log(`🌐 Target Host: ${this.wsHost}`);
      console.log(
        `🔄 Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`,
      );
      usePolymarketStore.getState().setConnecting(true);

      // Set a timeout to fallback to mock data if connection takes too long
      this.connectionTimeoutId = setTimeout(() => {
        if (!this.isConnected) {
          console.warn(
            `⏱️ Connection timeout after ${this.connectionTimeout}ms`,
          );
          this.isConnecting = false;
          this.stopHeartbeat();

          // Only fall back to mock data after multiple attempts
          if (this.reconnectAttempts >= 4) {
            console.warn(
              "Falling back to mock data after multiple failed attempts",
            );
            usePolymarketStore
              .getState()
              .setError("Connection timeout - using mock data");
            this.startMockDataIfNeeded();
          } else {
            this.attemptReconnect("connect_timeout");
          }
        }
      }, this.connectionTimeout);

      const realtimeClient = new RealTimeDataClient({
        host: this.wsHost,
        onMessage: this.handleMessage,
        onConnect: this.handleConnect,
        onStatusChange: this.handleStatusChange,
        autoReconnect: false,
        pingInterval: this.heartbeatInterval,
      });

      (realtimeClient as any).autoReconnect = false;
      this.client = realtimeClient;

      console.log("🚀 Calling client.connect()...");
      this.client?.connect();
      console.log("⏳ Waiting for connection to establish...");
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";
      console.error("❌ Failed to initialize Real-Time Client:", errorMessage);
      this.isConnecting = false;

      const message =
        !errorMessage || errorMessage === "{}"
          ? "Failed to connect to Polymarket real-time service"
          : `Failed to connect: ${errorMessage}`;

      usePolymarketStore.getState().setError(message);

      // Clear timeout if we hit immediate error
      if (this.connectionTimeoutId) {
        clearTimeout(this.connectionTimeoutId as any);
        this.connectionTimeoutId = null;
      }
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Attempt reconnect or fall back to mock data
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect("connect_failed");
      } else {
        this.startMockDataIfNeeded();
      }
    }
  }

  public disconnect(): void {
    // Clear any pending connection timeout
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId as any);
      this.connectionTimeoutId = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    // Clean up trade buffer
    this.stopTradeBufferRelease();
    this.flushTradeBuffer();

    if (this.client) {
      try {
        this.client.disconnect();
        this.client = null;
      } catch (error: unknown) {
        console.error("Error disconnecting:", error);
      }
    }

    if (this.mockDataStarted) {
      mockDataGenerator.stop();
      this.mockDataStarted = false;
    }

    this.isConnected = false;
    this.useMockData = false;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.lastMessageAt = 0;
  }

  public subscribe(
    topic: string,
    type: string = "*",
    filters: string = "",
  ): void {
    if (this.client && this.isConnected) {
      try {
        this.client.subscribe({
          subscriptions: [
            {
              topic,
              type,
              filters,
            },
          ],
        });
        console.log(`📡 Subscribed to: ${topic}:${type}`);
      } catch (error: unknown) {
        console.error("Error subscribing:", error);
      }
    } else {
      console.warn("Cannot subscribe - client not connected");
    }
  }

  /**
   * Subscribe to orderbook updates for specific assets
   */
  public subscribeToOrderbook(assetIds: string[]): void {
    if (this.client && this.isConnected) {
      try {
        this.client.subscribe({
          subscriptions: [
            {
              topic: "clob_market",
              type: "agg_orderbook",
              filters: JSON.stringify(assetIds),
            },
          ],
        });
        console.log(`📊 Subscribed to orderbook for ${assetIds.length} assets`);
      } catch (error: unknown) {
        console.error("Error subscribing to orderbook:", error);
      }
    }
  }

  /**
   * Subscribe to authenticated user topics (requires CLOB authentication)
   */
  public subscribeToUserTopics(): void {
    if (this.client && this.isConnected) {
      try {
        // User trades
        this.client.subscribe({
          subscriptions: [
            {
              topic: "clob_user",
              type: "trade",
              filters: "",
            },
          ],
        });
        console.log("👤 Subscribed to user topics");
      } catch (error: unknown) {
        console.error("Error subscribing to user topics:", error);
      }
    }
  }

  public unsubscribe(topic: string, type: string = "*"): void {
    if (this.client && this.isConnected) {
      try {
        this.client.unsubscribe({
          subscriptions: [
            {
              topic,
              type,
              filters: "",
            },
          ],
        });
        console.log(`📴 Unsubscribed from: ${topic}:${type}`);
      } catch (error: unknown) {
        console.error("Error unsubscribing:", error);
      }
    }
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  public isMockDataMode(): boolean {
    return this.useMockData;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public resetReconnectAttempts(): void {
    console.log("🔄 Resetting reconnect attempts");
    this.reconnectAttempts = 0;
    this.lastConnectionAttempt = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const realtimeService = new RealtimeService();
