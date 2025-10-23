import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Trade,
  Comment,
  Reaction,
  CryptoPrice,
  AggOrderbook,
  PriceChange,
  Market,
  PolymarketStore,
  SelectedMarketState,
} from "@/types/polymarket";
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
import { buildEventOutcomeSummary } from "@/lib/markets";

const MAX_TRADES = 100;
const MAX_COMMENTS = 50;
const MAX_HISTORY_POINTS = 720;
const MAX_RECENT_MARKETS = 5;

const cloneMarket = (market: NormalizedMarket): NormalizedMarket => ({
  ...market,
  outcomes: market.outcomes.map((outcome) => ({ ...outcome })),
  primaryOutcome: market.primaryOutcome
    ? { ...market.primaryOutcome }
    : undefined,
});

const cloneEventOutcome = (eventOutcome: EventOutcomes): EventOutcomes => {
  const markets = eventOutcome.markets.map(cloneMarket);
  const summary = buildEventOutcomeSummary(eventOutcome.eventId, markets, {
    totalVolume: eventOutcome.totalVolume,
    totalLiquidity: eventOutcome.totalLiquidity,
  });

  return {
    ...eventOutcome,
    markets,
    summary,
  };
};

const recordHistoryPoint = (
  historyMap: Map<string, Array<{ timestamp: number; probability: number }>>,
  marketId: string,
  probability: number,
  timestamp: number,
) => {
  if (!Number.isFinite(probability)) {
    return;
  }
  const pointTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now();
  const existing = historyMap.get(marketId) ?? [];
  const next = [...existing, { timestamp: pointTimestamp, probability }];
  if (next.length > MAX_HISTORY_POINTS) {
    next.splice(0, next.length - MAX_HISTORY_POINTS);
  }
  historyMap.set(marketId, next);
};

export const usePolymarketStore = create<PolymarketStore>()(
  persist(
    (set) => ({
  // Connection state
  connected: false,
  connecting: false,
  error: null,
  lastErrorCode: null,

  // UI Settings
  useSidebarNavigation: false,

  // Data
  trades: [],
  events: [],
  comments: [],
  reactions: [],
  cryptoPrices: new Map(),
  orderbooks: new Map(),
  priceChanges: new Map(),
  markets: new Map(),
  eventOutcomes: new Map(),
  marketHistories: new Map(),
  outcomeTimeframe: "1D",

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
  recentMarkets: [],

  // Actions
  setConnected: (connected) =>
    set({ connected, connecting: false, error: null }),

  setConnecting: (connecting) => set({ connecting }),

  setError: (error) => set({ error, connecting: false, connected: false }),
  setErrorWithCode: (error: string | null, code: number | null) => set({ error, connecting: false, connected: false, lastErrorCode: code }),

  // UI Actions
  setUseSidebarNavigation: (use) => set({ useSidebarNavigation: use }),

  addTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, MAX_TRADES),
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, MAX_TRADES),
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
      const history = new Map(state.marketHistories);
      const cloned = cloneEventOutcome(eventOutcome);
      cloned.summary?.rankedOutcomes.forEach((row) => {
        recordHistoryPoint(
          history,
          row.marketId,
          row.probability,
          row.lastUpdated,
        );
      });
      map.set(eventOutcome.eventId, cloned);
      return { eventOutcomes: map, marketHistories: history };
    }),

  hydrateEventOutcomeSet: (events) =>
    set((state) => {
      const map = new Map(state.eventOutcomes);
      const history = new Map(state.marketHistories);
      events.forEach((eventOutcome) => {
        const cloned = cloneEventOutcome(eventOutcome);
        cloned.summary?.rankedOutcomes.forEach((row) => {
          recordHistoryPoint(
            history,
            row.marketId,
            row.probability,
            row.lastUpdated,
          );
        });
        map.set(eventOutcome.eventId, cloned);
      });
      return { eventOutcomes: map, marketHistories: history };
    }),

  clearEventOutcomes: () =>
    set(() => ({ eventOutcomes: new Map(), marketHistories: new Map() })),

  updateEventOutcomeByCondition: (conditionId, updater) =>
    set((state) => {
      let hasUpdate = false;
      const map = new Map(state.eventOutcomes);
      const history = new Map(state.marketHistories);

      map.forEach((eventOutcome, eventId) => {
        let didUpdate = false;
        const markets = eventOutcome.markets.map((market) => {
          if (market.conditionId === conditionId || market.id === conditionId) {
            didUpdate = true;
            const next = updater(cloneMarket(market));
            return cloneMarket(next);
          }
          return market;
        });

        if (didUpdate) {
          hasUpdate = true;
          const summary = buildEventOutcomeSummary(eventOutcome.eventId, markets, {
            totalVolume: eventOutcome.totalVolume,
            totalLiquidity: eventOutcome.totalLiquidity,
          });

          summary.rankedOutcomes.forEach((row) => {
            recordHistoryPoint(
              history,
              row.marketId,
              row.probability,
              row.lastUpdated,
            );
          });

          map.set(eventId, {
            ...eventOutcome,
            markets,
            summary,
            updatedAt: Date.now(),
          });
        }
      });

      return hasUpdate ? { eventOutcomes: map, marketHistories: history } : state;
    }),

  updateEventOutcomeByToken: (tokenId, updater) =>
    set((state) => {
      let hasUpdate = false;
      const map = new Map(state.eventOutcomes);
      const history = new Map(state.marketHistories);

      map.forEach((eventOutcome, eventId) => {
        let didUpdate = false;
        const markets = eventOutcome.markets.map((market) => {
          if (market.yesTokenId === tokenId || market.noTokenId === tokenId) {
            didUpdate = true;
            const next = updater(cloneMarket(market));
            return cloneMarket(next);
          }
          return market;
        });

        if (didUpdate) {
          hasUpdate = true;
          const summary = buildEventOutcomeSummary(eventOutcome.eventId, markets, {
            totalVolume: eventOutcome.totalVolume,
            totalLiquidity: eventOutcome.totalLiquidity,
          });

          summary.rankedOutcomes.forEach((row) => {
            recordHistoryPoint(
              history,
              row.marketId,
              row.probability,
              row.lastUpdated,
            );
          });

          map.set(eventId, {
            ...eventOutcome,
            markets,
            summary,
            updatedAt: Date.now(),
          });
        }
      });

      return hasUpdate ? { eventOutcomes: map, marketHistories: history } : state;
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

  setSelectedMarket: (market) =>
    set((state) => {
      if (market) {
        // Add to recent markets (keeping last 5 unique)
        const filtered = state.recentMarkets.filter(
          (m) => m.marketId !== market.marketId
        );
        const recentMarkets = [market, ...filtered].slice(0, MAX_RECENT_MARKETS);
        return { selectedMarket: market, recentMarkets };
      }
      return { selectedMarket: null };
    }),

  clearSelectedMarket: () => set({ selectedMarket: null }),

  addRecentMarket: (market) =>
    set((state) => {
      const filtered = state.recentMarkets.filter(
        (m) => m.marketId !== market.marketId
      );
      const recentMarkets = [market, ...filtered].slice(0, MAX_RECENT_MARKETS);
      return { recentMarkets };
    }),

  setOutcomeTimeframe: (timeframe: OutcomeTimeframe) =>
    set({ outcomeTimeframe: timeframe }),

  clear: () =>
    set({
      trades: [],
      events: [],
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
      marketHistories: new Map(),
      outcomeTimeframe: "1D",
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
    }),
    {
      name: "polymarket-selection-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMarket: state.selectedMarket,
        recentMarkets: state.recentMarkets,
      }),
    }
  )
);
