import { create } from "zustand";
import {
  Trade,
  Comment,
  Reaction,
  CryptoPrice,
  AggOrderbook,
  PriceChange,
  Market,
  PolymarketStore,
} from "@/types/polymarket";
import type {
  UserOrder,
  MarketMetadata,
  OrderbookDepth,
  ClobAuthState,
} from "@/services/clob";
import type { EventOutcomes, NormalizedMarket } from "@/types/markets";

const MAX_TRADES = 100;
const MAX_COMMENTS = 50;

export const usePolymarketStore = create<PolymarketStore>((set) => ({
  // Connection state
  connected: false,
  connecting: false,
  error: null,

  // Data
  trades: [],
  comments: [],
  reactions: [],
  cryptoPrices: new Map(),
  orderbooks: new Map(),
  priceChanges: new Map(),
  markets: new Map(),
  eventOutcomes: new Map(),

  // CLOB data
  clobAuth: {
    isAuthenticated: false,
    address: null,
    apiKey: null,
    error: null,
  },
  userOrders: [],
  marketMetadata: new Map(),
  orderbookDepth: new Map(),
  selectedMarket: null,

  // Actions
  setConnected: (connected) =>
    set({ connected, connecting: false, error: null }),

  setConnecting: (connecting) => set({ connecting }),

  setError: (error) => set({ error, connecting: false, connected: false }),

  addTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, MAX_TRADES),
    })),

  addComment: (comment) =>
    set((state) => ({
      comments: [comment, ...state.comments].slice(0, MAX_COMMENTS),
    })),

  addReaction: (reaction) =>
    set((state) => {
      const newReactions = [reaction, ...state.reactions];

      // Update comment likes/dislikes
      const updatedComments = state.comments.map((comment) => {
        if (comment.id === reaction.commentId) {
          return {
            ...comment,
            likes: reaction.type === "LIKE" ? comment.likes + 1 : comment.likes,
            dislikes:
              reaction.type === "DISLIKE"
                ? comment.dislikes + 1
                : comment.dislikes,
          };
        }
        return comment;
      });

      return {
        reactions: newReactions,
        comments: updatedComments,
      };
    }),

  updateCryptoPrice: (price) =>
    set((state) => {
      console.log(
        "🏪 Store: updateCryptoPrice called for",
        price.symbol,
        "Price:",
        price.price,
      );
      const newPrices = new Map(state.cryptoPrices);
      newPrices.set(price.symbol, price);
      console.log(
        "🏪 Store: cryptoPrices Map now has",
        newPrices.size,
        "entries",
      );
      return { cryptoPrices: newPrices };
    }),

  updateOrderbook: (orderbook) =>
    set((state) => {
      const newOrderbooks = new Map(state.orderbooks);
      newOrderbooks.set(orderbook.market, orderbook);
      return { orderbooks: newOrderbooks };
    }),

  updatePriceChange: (change) =>
    set((state) => {
      const newPriceChanges = new Map(state.priceChanges);
      newPriceChanges.set(change.market, change);
      return { priceChanges: newPriceChanges };
    }),

  hydrateEventOutcomes: (eventOutcome) =>
    set((state) => {
      const map = new Map(state.eventOutcomes);
      map.set(eventOutcome.eventId, {
        ...eventOutcome,
        markets: eventOutcome.markets.map((market) => ({
          ...market,
          outcomes: market.outcomes.map((outcome) => ({ ...outcome })),
          primaryOutcome: market.primaryOutcome
            ? { ...market.primaryOutcome }
            : undefined,
        })),
      });
      return { eventOutcomes: map };
    }),

  hydrateEventOutcomeSet: (events) =>
    set((state) => {
      const map = new Map(state.eventOutcomes);
      events.forEach((eventOutcome) => {
        map.set(eventOutcome.eventId, {
          ...eventOutcome,
          markets: eventOutcome.markets.map((market) => ({
            ...market,
            outcomes: market.outcomes.map((outcome) => ({ ...outcome })),
            primaryOutcome: market.primaryOutcome
              ? { ...market.primaryOutcome }
              : undefined,
          })),
        });
      });
      return { eventOutcomes: map };
    }),

  clearEventOutcomes: () => set(() => ({ eventOutcomes: new Map() })),

  updateEventOutcomeByCondition: (conditionId, updater) =>
    set((state) => {
      let hasUpdate = false;
      const map = new Map(state.eventOutcomes);

      map.forEach((eventOutcome, eventId) => {
        const markets = eventOutcome.markets.map((market) => {
          if (market.conditionId === conditionId || market.id === conditionId) {
            hasUpdate = true;
            const next = updater(structuredClone(market));
            return {
              ...next,
              outcomes: next.outcomes.map((outcome) => ({ ...outcome })),
              primaryOutcome: next.primaryOutcome
                ? { ...next.primaryOutcome }
                : undefined,
            };
          }
          return market;
        });

        if (hasUpdate) {
          map.set(eventId, {
            ...eventOutcome,
            markets,
            updatedAt: Date.now(),
          });
        }
      });

      return hasUpdate ? { eventOutcomes: map } : state;
    }),

  updateEventOutcomeByToken: (tokenId, updater) =>
    set((state) => {
      let hasUpdate = false;
      const map = new Map(state.eventOutcomes);

      map.forEach((eventOutcome, eventId) => {
        const markets = eventOutcome.markets.map((market) => {
          if (market.yesTokenId === tokenId || market.noTokenId === tokenId) {
            hasUpdate = true;
            const next = updater(structuredClone(market));
            return {
              ...next,
              outcomes: next.outcomes.map((outcome) => ({ ...outcome })),
              primaryOutcome: next.primaryOutcome
                ? { ...next.primaryOutcome }
                : undefined,
            };
          }
          return market;
        });

        if (hasUpdate) {
          map.set(eventId, {
            ...eventOutcome,
            markets,
            updatedAt: Date.now(),
          });
        }
      });

      return hasUpdate ? { eventOutcomes: map } : state;
    }),

  // CLOB actions
  setClobAuth: (auth) => set({ clobAuth: auth }),

  setUserOrders: (orders) => set({ userOrders: orders }),

  addUserOrder: (order) =>
    set((state) => ({
      userOrders: [order, ...state.userOrders],
    })),

  removeUserOrder: (orderId) =>
    set((state) => ({
      userOrders: state.userOrders.filter((o) => o.id !== orderId),
    })),

  updateMarketMetadata: (metadata) =>
    set((state) => {
      const newMetadata = new Map(state.marketMetadata);
      newMetadata.set(metadata.conditionId, metadata);
      return { marketMetadata: newMetadata };
    }),

  updateOrderbookDepth: (depth) =>
    set((state) => {
      const newDepth = new Map(state.orderbookDepth);
      newDepth.set(depth.asset, depth);
      return { orderbookDepth: newDepth };
    }),

  setSelectedMarket: (marketId) => set({ selectedMarket: marketId }),

  clear: () =>
    set({
      trades: [],
      comments: [],
      reactions: [],
      cryptoPrices: new Map(),
      orderbooks: new Map(),
      priceChanges: new Map(),
      connected: false,
      connecting: false,
      error: null,
      userOrders: [],
      marketMetadata: new Map(),
      orderbookDepth: new Map(),
      selectedMarket: null,
      eventOutcomes: new Map(),
      // Don't clear auth on general clear
    }),

  clearClobData: () =>
    set({
      clobAuth: {
        isAuthenticated: false,
        address: null,
        apiKey: null,
        error: null,
      },
      userOrders: [],
      marketMetadata: new Map(),
      orderbookDepth: new Map(),
    }),
}));
