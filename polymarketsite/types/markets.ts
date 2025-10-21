export type MarketType = "binary" | "multi";

export interface Outcome {
  name: string;
  price: number;
  probability: number;
  tokenId?: string;
  volume?: number;
  liquidity?: number;
  lastUpdated?: number;
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
}

export interface EventOutcomeMetadata {
  conditionId?: string;
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
}
