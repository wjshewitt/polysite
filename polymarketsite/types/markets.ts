export type MarketType = "binary" | "multi";

export type PriceSource = "midpoint" | "last_trade" | "fallback" | "calculated_complement";

export interface Outcome {
  // Display data
  name: string;
  price: number; // Calculated display price
  priceSource: PriceSource;

  // Orderbook data
  bestBid: number | null;
  bestAsk: number | null;
  spread: number;
  spreadWarning: boolean;

  // Probability/prediction
  impliedProbability: number; // Always midpoint for forecasting

  // Historical
  lastTradedPrice: number | null;

  // Metadata
  lastUpdated: number;
  orderbookUpdated: number;

  // Legacy (keep for backward compatibility)
  probability: number; // Map to impliedProbability

  // other fields
  tokenId?: string;
  volume?: number;
  liquidity?: number;
  change24h?: number;
}

export interface PrimaryOutcome {
  name: string;
  probability: number;
  yesTokenId?: string;
  noTokenId?: string;
}

export interface NormalizedMarket {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: MarketType;
  outcomes: Outcome[];
  volume?: number;
  liquidity?: number;
  openInterest?: number;
  startDate?: number;
  endDate?: number;
  active: boolean;
  closed: boolean;
  lastUpdated: number;
  commentCount?: number;
  icon?: string;
  image?: string;
  featured?: boolean;
  tags?: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
  clobTokenIds?: string[];
  yesTokenId?: string;
  noTokenId?: string;
  eventId?: string;
  conditionId?: string;
  marketType: MarketType;
  outcomeIndex?: number;
  totalOutcomes?: number;
  negRisk?: boolean;
  negRiskMarketId?: string;
  primaryOutcome?: PrimaryOutcome;
  displayName?: string;
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  potentialProfit?: number;
}

export interface EventOutcomeMetadata {
  conditionId?: string;
}

export type OutcomeTier = "favorite" | "contender" | "longshot";
export type OutcomeTimeframe = "1H" | "6H" | "1D" | "1W" | "1M" | "ALL";

export interface EventOutcomeRow {
  eventId: string;
  marketId: string;
  conditionId?: string;
  slug?: string;
  name: string;
  probability: number;
  price: number;
  potentialProfit: number;
  oddsText: string;
  change24h?: number;
  volume?: number;
  liquidity?: number;
  yesTokenId?: string;
  noTokenId?: string;
  bestYesBid?: number;
  bestYesAsk?: number;
  bestNoBid?: number;
  bestNoAsk?: number;
  volume24h?: number;
  changeAbs?: number;
  changePct?: number;
  lastQuoteAt?: number;
  rank: number;
  tier: OutcomeTier;
  lastUpdated: number;
}

export interface EventOutcomeSummary {
  eventId: string;
  isMultiOutcome: boolean;
  totalOutcomes: number;
  rankedOutcomes: EventOutcomeRow[];
  favorites: EventOutcomeRow[];
  contenders: EventOutcomeRow[];
  longshots: EventOutcomeRow[];
  topOutcome?: EventOutcomeRow;
  updatedAt: number;
  totalVolume?: number;
  totalLiquidity?: number;
  lastPriceUpdateAt?: number;
  timeframe: OutcomeTimeframe;
  infoNote?: string;
}

export interface EventOutcomes {
  eventId: string;
  title: string;
  slug: string;
  markets: NormalizedMarket[];
  totalVolume?: number;
  totalLiquidity?: number;
  updatedAt: number;
  negRisk?: boolean;
  summary?: EventOutcomeSummary;
}
