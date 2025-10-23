import type {
  UserOrder,
  MarketMetadata,
  OrderbookDepth,
  ClobAuthState,
} from "@/services/clob";
import type {
  EventOutcomes,
  NormalizedMarket,
  OutcomeTimeframe,
} from "@/types/markets";

// Core Message Types
export interface BaseMessage {
  type: string;
  timestamp: number;
}

// Trade Message
export interface TradeMessage extends BaseMessage {
  type: "activity:trades";
  data: Trade;
}

export interface Trade {
  id: string;
  market: string;
  marketTitle: string;
  eventSlug?: string;
  asset: string;
  side: "BUY" | "SELL";
  size: string;
  price: string;
  timestamp: number;
  maker: string;
  taker: string;
  tradeId: string;
  outcome: string;
  outcomeIndex: number;
  feeRateBps: string;
  status: string;
}

export interface Event {
  id: string;
  type: "orderbook" | "trade" | "order" | "liquidity";
  market: string;
  timestamp: number;
}

// Order Matched
export interface OrderMatchedMessage extends BaseMessage {
  type: "activity:orders_matched";
  data: OrderMatched;
}

export interface OrderMatched {
  id: string;
  market: string;
  marketTitle: string;
  asset: string;
  side: "BUY" | "SELL";
  size: string;
  price: string;
  timestamp: number;
  orderId: string;
  outcome: string;
  maker: boolean;
}

// Comment Message
export interface CommentMessage extends BaseMessage {
  type: "comments:comment_created";
  data: Comment;
}

export interface Comment {
  id: string;
  marketId: string;
  userId: string;
  username: string;
  userImage?: string;
  content: string;
  timestamp: number;
  replyTo?: string;
  likes: number;
  dislikes: number;
}

// Reaction Message
export interface ReactionMessage extends BaseMessage {
  type: "comments:reaction_created";
  data: Reaction;
}

export interface Reaction {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  type: "LIKE" | "DISLIKE";
  timestamp: number;
}

// Crypto Price Message
export interface CryptoPriceMessage extends BaseMessage {
  type: "crypto_prices:update";
  data: CryptoPrice;
}

export interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  timestamp: number;
}

// CLOB Market Messages
export interface AggOrderbookMessage extends BaseMessage {
  type: "clob_market:agg_orderbook";
  data: AggOrderbook;
}

export interface AggOrderbook {
  market: string;
  asset: string;
  timestamp: number;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface PriceChangeMessage extends BaseMessage {
  type: "clob_market:price_change";
  data: PriceChange;
}

export interface PriceChange {
  market: string;
  asset: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  timestamp: number;
}

// Union Types
export type PolymarketMessage =
  | TradeMessage
  | OrderMatchedMessage
  | CommentMessage
  | ReactionMessage
  | CryptoPriceMessage
  | AggOrderbookMessage
  | PriceChangeMessage;

// Market Info
export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  outcomes: string[];
  endDate: string;
  volume: string;
  liquidity: string;
  active: boolean;
  clobTokenIds?: string[];
}

// Polymarket Event (from Gamma API)
export interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  createdAt: number;
  updatedAt: number;
  image?: string;
  icon?: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  volume: string;
  liquidity: string;
  openInterest: string;
  commentCount: number;
  markets: PolymarketMarket[];
}

// Polymarket Market (from Gamma API)
export interface PolymarketMarket {
  id: string;
  conditionId: string;
  slug: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
  startDate: number;
  endDate: number;
  createdAt: number;
  updatedAt: number;
  spread?: number;
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  clobTokenIds?: string[];
  negRisk?: boolean;
  negRiskMarketID?: string;
  outcomeIndex?: number;
  totalOutcomes?: number;
  eventId?: string;
  yesTokenId?: string;
  noTokenId?: string;
}

// Market Stats
export interface MarketStats {
  volume24h: string;
  totalVolume: string;
  liquidity: string;
  uniqueTraders: number;
  totalTrades: number;
  lastUpdated: number;
}

// WebSocket Configuration
export interface WSConfig {
  reconnect: boolean;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

// Selected Market State (rich metadata for UI and filtering)
export interface SelectedMarketState {
  marketId: string;
  conditionId?: string;
  slug: string;
  name: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  yesTokenId?: string;
  noTokenId?: string;
  clobTokenIds?: string[];
  icon?: string;
  image?: string;
  selectedAt: number;
  isEventView?: boolean;
}

// Store State
export interface PolymarketStore {
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastErrorCode: number | null;

  // Data
  trades: Trade[];
  events: Event[];
  comments: Comment[];
  reactions: Reaction[];
  cryptoPrices: Map<string, CryptoPrice>;
  orderbooks: Map<string, AggOrderbook>;
  priceChanges: Map<string, PriceChange>;
  markets: Map<string, Market>;
  eventOutcomes: Map<string, EventOutcomes>;
  marketHistories: Map<string, Array<{ timestamp: number; probability: number }>>;
  outcomeTimeframe: OutcomeTimeframe;

  // CLOB data
  clobAuth: ClobAuthState;
  userOrders: UserOrder[];
  marketMetadata: Map<string, MarketMetadata>;
  orderbookDepth: Map<string, OrderbookDepth>;
  selectedMarket: SelectedMarketState | null;
  recentMarkets: SelectedMarketState[];

  // Actions
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  setErrorWithCode: (error: string | null, code: number | null) => void;
  addTrade: (trade: Trade) => void;
  addEvent: (event: Event) => void;
  addComment: (comment: Comment) => void;
  addReaction: (reaction: Reaction) => void;
  updateCryptoPrice: (price: CryptoPrice) => void;
  updateOrderbook: (orderbook: AggOrderbook) => void;
  updatePriceChange: (change: PriceChange) => void;
  hydrateEventOutcomes: (eventOutcome: EventOutcomes) => void;
  hydrateEventOutcomeSet: (events: EventOutcomes[]) => void;
  clearEventOutcomes: () => void;
  updateEventOutcomeByCondition: (
    conditionId: string,
    updater: (current: NormalizedMarket) => NormalizedMarket,
  ) => void;
  updateEventOutcomeByToken: (
    tokenId: string,
    updater: (current: NormalizedMarket) => NormalizedMarket,
  ) => void;

  // CLOB actions
  setClobAuth: (auth: ClobAuthState) => void;
  setUserOrders: (orders: UserOrder[]) => void;
  addUserOrder: (order: UserOrder) => void;
  removeUserOrder: (orderId: string) => void;
  updateMarketMetadata: (metadata: MarketMetadata) => void;
  updateOrderbookDepth: (depth: OrderbookDepth) => void;
  setSelectedMarket: (market: SelectedMarketState | null) => void;
  clearSelectedMarket: () => void;
  addRecentMarket: (market: SelectedMarketState) => void;
  setOutcomeTimeframe: (timeframe: OutcomeTimeframe) => void;

  clear: () => void;
  clearClobData: () => void;
}
