import { ClobClient, ApiKeyCreds, Side } from "@polymarket/clob-client";
import { ethers } from "ethers";

export interface ClobConfig {
  chainId: number;
  privateKey?: string;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
}

export interface OrderbookDepth {
  market: string;
  asset: string;
  hash: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  timestamp: number;
}

export interface OrderLevel {
  price: string;
  size: string;
}

export interface UserOrder {
  id: string;
  market: string;
  asset: string;
  side: "BUY" | "SELL";
  price: string;
  size: string;
  originalSize: string;
  status: "LIVE" | "MATCHED" | "CANCELLED";
  timestamp: number;
  outcome: string;
}

export interface MarketMetadata {
  conditionId: string;
  questionId: string;
  tokens: TokenMetadata[];
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  negRisk: boolean;
  tickSize: string;
  minSize: string;
  maxSize: string;
  clobTokenIds?: string[];
}

export interface TokenMetadata {
  tokenId: string;
  outcome: string;
  price: string;
  winner: boolean;
}

export interface ClobAuthState {
  isAuthenticated: boolean;
  address: string | null;
  apiKey: string | null;
  error: string | null;
}

class ClobService {
  private client: ClobClient | null = null;
  private isAuthenticated = false;
  private userAddress: string | null = null;
  private chainId: number = 137; // Polygon mainnet

  constructor() {
    // Initialize on client side only
    if (typeof window !== "undefined") {
      console.log("🔐 CLOB Service initialized (read-only mode)");
    }
  }

  /**
   * Initialize CLOB client with authentication
   * This should be called from a secure backend endpoint
   */
  public async authenticate(config: ClobConfig): Promise<ClobAuthState> {
    try {
      console.log("🔐 Authenticating with CLOB...");

      if (
        !config.privateKey &&
        (!config.apiKey || !config.apiSecret || !config.apiPassphrase)
      ) {
        throw new Error("Must provide either privateKey or API credentials");
      }

      // Create wallet from private key if provided
      let wallet: ethers.Wallet | undefined;
      if (config.privateKey) {
        wallet = new ethers.Wallet(config.privateKey);
        this.userAddress = wallet.address;
      }

      // Initialize CLOB client
      this.client = new ClobClient(
        "https://clob.polymarket.com",
        config.chainId || this.chainId,
        wallet,
        config.apiKey
          ? {
              key: config.apiKey,
              secret: config.apiSecret!,
              passphrase: config.apiPassphrase!,
            }
          : undefined,
      );

      this.isAuthenticated = true;
      console.log("✅ CLOB authentication successful");

      return {
        isAuthenticated: true,
        address: this.userAddress,
        apiKey: config.apiKey || null,
        error: null,
      };
    } catch (error) {
      console.error("❌ CLOB authentication failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        isAuthenticated: false,
        address: null,
        apiKey: null,
        error: errorMessage,
      };
    }
  }

  /**
   * Create or derive API key from private key
   * This should ONLY be called from a secure backend
   */
  public async createOrDeriveApiKey(
    privateKey: string,
  ): Promise<ApiKeyCreds | null> {
    try {
      const wallet = new ethers.Wallet(privateKey);

      // Create a temporary client to derive credentials
      const tempClient = new ClobClient(
        "https://clob.polymarket.com",
        this.chainId,
        wallet,
      );

      // Derive API credentials
      const credentials = await tempClient.deriveApiKey();

      console.log("✅ API credentials derived successfully");

      return credentials;
    } catch (error) {
      console.error("❌ Failed to derive API credentials:", error);
      return null;
    }
  }

  /**
   * Get detailed orderbook for a specific token
   */
  public async getOrderbook(tokenId: string): Promise<OrderbookDepth | null> {
    if (!this.client) {
      console.warn("⚠️ CLOB client not initialized");
      return null;
    }

    try {
      const orderbook = await this.client.getOrderBook(tokenId);

      return {
        market: orderbook.market || "",
        asset: tokenId,
        hash: orderbook.hash || "",
        bids: (orderbook.bids || []).map((bid: any) => ({
          price: bid.price,
          size: bid.size,
        })),
        asks: (orderbook.asks || []).map((ask: any) => ({
          price: ask.price,
          size: ask.size,
        })),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("❌ Failed to fetch orderbook:", error);
      return null;
    }
  }

  /**
   * Get market metadata including tick size and neg-risk status
   */
  public async getMarketMetadata(
    conditionId: string,
  ): Promise<MarketMetadata | null> {
    if (!this.client) {
      console.warn("⚠️ CLOB client not initialized");
      return null;
    }

    try {
      const market = await this.client.getMarket(conditionId);

      return {
        conditionId: market.condition_id,
        questionId: market.question_id || "",
        tokens: (market.tokens || []).map((token: any) => ({
          tokenId: token.token_id,
          outcome: token.outcome,
          price: token.price || "0",
          winner: token.winner || false,
        })),
        description: market.description || "",
        outcomes: market.outcomes || [],
        outcomePrices: market.outcome_prices || [],
        volume: market.volume || "0",
        active: market.active || false,
        closed: market.closed || false,
        negRisk: market.neg_risk || false,
        tickSize: market.tick_size || "0.01",
        minSize: market.minimum_order_size || "1",
        maxSize: market.maximum_order_size || "100000",
        clobTokenIds: Array.isArray(market.clob_token_ids)
          ? market.clob_token_ids
          : undefined,
      };
    } catch (error) {
      console.error("❌ Failed to fetch market metadata:", error);
      return null;
    }
  }

  /**
   * Get user's open orders (requires authentication)
   */
  public async getOpenOrders(): Promise<UserOrder[]> {
    if (!this.client || !this.isAuthenticated) {
      console.warn("⚠️ User not authenticated");
      return [];
    }

    try {
      // Use getOpenOrders method which returns array directly
      const orders = await this.client.getOpenOrders();

      return (orders || []).map((order: any) => ({
        id: order.id,
        market: order.market,
        asset: order.asset_id,
        side: order.side === "BUY" ? "BUY" : "SELL",
        price: order.price,
        size: order.size,
        originalSize: order.original_size || order.size,
        status: order.status || "LIVE",
        timestamp: order.created_at
          ? new Date(order.created_at).getTime()
          : Date.now(),
        outcome: order.outcome || "",
      }));
    } catch (error) {
      console.error("❌ Failed to fetch open orders:", error);
      return [];
    }
  }

  /**
   * Get all available markets
   */
  public async getMarkets(): Promise<any[]> {
    if (!this.client) {
      console.warn("⚠️ CLOB client not initialized");
      return [];
    }

    try {
      const markets = await this.client.getMarkets();
      // Handle pagination response
      if (markets && typeof markets === "object" && "data" in markets) {
        return (markets as any).data || [];
      }
      return Array.isArray(markets) ? markets : [];
    } catch (error) {
      console.error("❌ Failed to fetch markets:", error);
      return [];
    }
  }

  /**
   * Place a new order (requires authentication)
   */
  public async placeOrder(params: {
    tokenId: string;
    side: "BUY" | "SELL";
    price: string;
    size: string;
  }): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!this.client || !this.isAuthenticated) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    try {
      const order = await this.client.createOrder({
        tokenID: params.tokenId,
        price: Number(params.price),
        size: Number(params.size),
        side: params.side as Side,
      });

      return {
        success: true,
        orderId:
          typeof order.orderID === "string"
            ? order.orderID
            : String(order.orderID),
      };
    } catch (error) {
      console.error("❌ Failed to place order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Cancel an existing order (requires authentication)
   */
  public async cancelOrder(
    orderId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.client || !this.isAuthenticated) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    try {
      await this.client.cancelOrder({ orderID: orderId });

      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ Failed to cancel order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Cancel all orders for a market (requires authentication)
   */
  public async cancelAllOrders(
    marketId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.client || !this.isAuthenticated) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    try {
      if (marketId) {
        await this.client.cancelMarketOrders({ market: marketId });
      } else {
        await this.client.cancelAll();
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ Failed to cancel all orders:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get authentication status
   */
  public getAuthStatus(): ClobAuthState {
    return {
      isAuthenticated: this.isAuthenticated,
      address: this.userAddress,
      apiKey: null, // Never expose API key
      error: null,
    };
  }

  /**
   * Initialize read-only client (no authentication required)
   */
  public async initializeReadOnly(): Promise<boolean> {
    try {
      console.log("📖 Initializing CLOB client in read-only mode...");

      this.client = new ClobClient("https://clob.polymarket.com", this.chainId);

      console.log("✅ CLOB client initialized (read-only)");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize CLOB client:", error);
      return false;
    }
  }

  /**
   * Disconnect and clear authentication
   */
  public disconnect(): void {
    this.client = null;
    this.isAuthenticated = false;
    this.userAddress = null;
    console.log("🔌 CLOB client disconnected");
  }

  public isClientAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public getUserAddress(): string | null {
    return this.userAddress;
  }
}

export const clobService = new ClobService();
