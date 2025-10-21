import {
  NormalizedMarket,
  Outcome,
  EventOutcomes,
  MarketType,
  PrimaryOutcome,
} from "@/types/markets";

const randomId = (): string => {
  if (typeof globalThis === "object") {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return uuid;
  }

  return `market-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clampProbability = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const parseJsonArray = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn("Failed to parse JSON array", error);
    }
  }

  return [];
};

const parseMarketArrays = (raw: any) => {
  const outcomes = parseJsonArray(raw?.outcomes ?? raw?.outcomes_array ?? []);
  const outcomePrices = parseJsonArray(
    raw?.outcomePrices ?? raw?.outcome_prices ?? [],
  );
  const clobTokenIds = parseJsonArray(
    raw?.clobTokenIds ?? raw?.clob_token_ids ?? [],
  );

  const tokens = Array.isArray(raw?.tokens)
    ? raw.tokens.map((token: any) => ({
        tokenId: token?.tokenId || token?.token_id,
        yesTokenId: token?.yesTokenId || token?.yes_token_id,
        noTokenId: token?.noTokenId || token?.no_token_id,
        outcome: token?.outcome,
        price: token?.price,
        volume: token?.volume,
        liquidity: token?.liquidity,
        change24h: token?.change24h,
      }))
    : clobTokenIds.map((tokenId) => ({ tokenId }));

  return { outcomes, outcomePrices, clobTokenIds, tokens };
};

const GENERIC_OUTCOME_NAMES = new Set([
  "yes",
  "no",
  "y",
  "n",
  "buy",
  "sell",
  "long",
  "short",
]);

const stripQuotes = (value: string): string => value.replace(/["'`]/g, "");

const cleanOutcomeName = (value?: string): string | undefined => {
  if (!value) return undefined;
  const stripped = stripQuotes(value).trim();
  if (!stripped) return undefined;
  return stripped.replace(/\s+/g, " ").trim();
};

const toTitleCase = (value: string): string =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const extractFromQuestion = (question?: string): string | undefined => {
  const cleaned = cleanOutcomeName(question);
  if (!cleaned) return undefined;

  const willPattern = cleaned.match(
    /^will\s+(.+?)(\s+(win|be|happen|occur|take\s+place|reach|happen))?$/i,
  );
  if (willPattern) {
    const candidate = cleanOutcomeName(willPattern[1]);
    if (candidate && !GENERIC_OUTCOME_NAMES.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  const toPattern = cleaned.match(
    /^(.+?)\s+to\s+(win|be|happen|occur|take\s+place|reach)/i,
  );
  if (toPattern) {
    const candidate = cleanOutcomeName(toPattern[1]);
    if (candidate && !GENERIC_OUTCOME_NAMES.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  const commaPattern = cleaned.match(/^([^,]+),?.*$/);
  if (commaPattern) {
    const candidate = cleanOutcomeName(commaPattern[1]);
    if (candidate && !GENERIC_OUTCOME_NAMES.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  if (
    cleaned.length <= 80 &&
    !GENERIC_OUTCOME_NAMES.has(cleaned.toLowerCase())
  ) {
    return cleaned;
  }

  return undefined;
};

const slugToName = (slug?: string): string | undefined => {
  if (!slug) return undefined;
  const formatted = cleanOutcomeName(toTitleCase(slug.replace(/\//g, "-")));
  if (formatted && !GENERIC_OUTCOME_NAMES.has(formatted.toLowerCase())) {
    return formatted;
  }
  return undefined;
};

const deriveMarketOutcomeName = (raw: any, event?: any): string | undefined => {
  const hasMultipleMarkets =
    Array.isArray(event?.markets) && event.markets.length > 1;

  const groupItemTitle = cleanOutcomeName(
    raw?.groupItemTitle ?? raw?.group_item_title ?? raw?.groupItemName,
  );
  if (
    groupItemTitle &&
    !GENERIC_OUTCOME_NAMES.has(groupItemTitle.toLowerCase())
  ) {
    return groupItemTitle;
  }

  if (Array.isArray(raw?.tokens)) {
    const tokenOutcome = raw.tokens
      .map((token: any) => cleanOutcomeName(token?.outcome))
      .find(
        (name: string | null) =>
          name && !GENERIC_OUTCOME_NAMES.has(name.toLowerCase()),
      );
    if (tokenOutcome) {
      return tokenOutcome;
    }
  }

  const { outcomes } = parseMarketArrays(raw);
  if (outcomes.length >= 2) {
    const yesItem = cleanOutcomeName(String(outcomes[1]));
    if (yesItem && !GENERIC_OUTCOME_NAMES.has(yesItem.toLowerCase())) {
      return yesItem;
    }

    const specificOutcome = outcomes.slice(0, 4).find((outcome) => {
      const name = cleanOutcomeName(String(outcome));
      return name && !GENERIC_OUTCOME_NAMES.has(name.toLowerCase());
    });
    if (specificOutcome) {
      return cleanOutcomeName(String(specificOutcome));
    }
  }

  const questionCandidate = extractFromQuestion(raw?.question);
  if (questionCandidate && hasMultipleMarkets) {
    return questionCandidate;
  }

  const tickerCandidate = cleanOutcomeName(raw?.ticker);
  if (
    tickerCandidate &&
    hasMultipleMarkets &&
    !GENERIC_OUTCOME_NAMES.has(tickerCandidate.toLowerCase())
  ) {
    return tickerCandidate;
  }

  const slugCandidate = slugToName(raw?.slug);
  if (slugCandidate && hasMultipleMarkets) {
    return slugCandidate;
  }

  const eventTitleCandidate = hasMultipleMarkets
    ? extractFromQuestion(event?.title)
    : undefined;
  if (eventTitleCandidate) {
    return eventTitleCandidate;
  }

  const eventTickerCandidate = hasMultipleMarkets
    ? cleanOutcomeName(event?.ticker)
    : undefined;
  if (
    eventTickerCandidate &&
    !GENERIC_OUTCOME_NAMES.has(eventTickerCandidate.toLowerCase())
  ) {
    return eventTickerCandidate;
  }

  return undefined;
};

export const extractOutcomesArray = (raw: any): string[] => {
  if (!raw) return [];

  const { outcomes } = parseMarketArrays(raw);
  if (outcomes.length > 0) {
    return outcomes.filter(Boolean).map((item) => String(item));
  }

  if (Array.isArray(raw.tokens)) {
    return raw.tokens
      .map((token: any) => token?.outcome)
      .filter(Boolean)
      .map((tokenOutcome: any) => String(tokenOutcome));
  }

  return [];
};

export const extractPricesArray = (raw: any): number[] => {
  if (!raw) return [];

  const mapToNumbers = (items: unknown[]): number[] =>
    items.map((item) => clampProbability(Number(item)));

  const { outcomePrices } = parseMarketArrays(raw);
  if (outcomePrices.length > 0) {
    return mapToNumbers(outcomePrices);
  }

  if (Array.isArray(raw.tokens)) {
    return mapToNumbers(raw.tokens.map((token: any) => token?.price ?? 0));
  }

  return [];
};

export const detectMarketType = (raw: any): "binary" | "multi" => {
  const outcomes = extractOutcomesArray(raw);
  if (outcomes.length >= 3) return "multi";
  if (outcomes.length === 2) return "binary";
  return "binary";
};

const normalizeOutcomes = (
  raw: any,
  now: number,
  derivedYesName?: string,
): Outcome[] => {
  const outcomes = extractOutcomesArray(raw);
  const prices = extractPricesArray(raw);
  const { tokens } = parseMarketArrays(raw);

  const normalized: Outcome[] = outcomes.map((name, index) => {
    const price = clampProbability(prices[index] ?? 0);
    const token = tokens[index] ?? {};
    const lowerName = name.toLowerCase();
    const resolvedName =
      derivedYesName && lowerName === "yes" ? derivedYesName : name;

    return {
      name: resolvedName,
      price,
      probability: price,
      tokenId: token?.tokenId || token?.token_id || undefined,
      volume: token?.volume ? Number(token.volume) : undefined,
      liquidity: token?.liquidity ? Number(token.liquidity) : undefined,
      change24h: token?.change24h ? Number(token.change24h) : undefined,
      lastUpdated: now,
    };
  });

  normalized.sort((a, b) => b.price - a.price);

  return normalized;
};

const parseDate = (value: any): number | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getTime();
};

const parseNumber = (value: any): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return number;
};

const parseStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch (error) {
      console.warn("Failed to parse string array", error);
    }
  }

  return undefined;
};

const safeString = (value: any, fallback = ""): string => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const resolveMarketId = (raw: any): string => {
  if (!raw) return randomId();
  return (
    raw.id ??
    raw.conditionId ??
    raw.slug ??
    raw.marketId ??
    raw.market ??
    randomId()
  ).toString();
};

const resolveClobTokenIds = (raw: any): string[] | undefined => {
  if (!raw) return undefined;
  const { clobTokenIds } = parseMarketArrays(raw);
  if (clobTokenIds.length > 0) {
    return clobTokenIds.map((item) => String(item));
  }

  if (Array.isArray(raw.clobTokenIds)) {
    return raw.clobTokenIds.map((item: unknown) => String(item));
  }

  if (typeof raw.clobTokenIds === "string") {
    try {
      const parsed = JSON.parse(raw.clobTokenIds);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch (error) {
      console.warn("Failed to parse clobTokenIds", error);
    }
  }

  if (Array.isArray(raw.tokens)) {
    return raw.tokens
      .map((token: any) => token?.tokenId || token?.token_id)
      .filter(Boolean)
      .map((tokenId: any) => String(tokenId));
  }

  return undefined;
};

const resolveNegRisk = (raw: any) => {
  if (!raw) return { negRisk: undefined, negRiskMarketId: undefined };
  const negRisk = Boolean(raw.negRisk ?? raw.enableNegRisk ?? raw.neg_risk);
  const negRiskMarketId =
    raw.negRiskMarketID || raw.negRiskMarketId || raw.neg_risk_market_id;
  return {
    negRisk: negRisk ? true : undefined,
    negRiskMarketId: negRiskMarketId ? String(negRiskMarketId) : undefined,
  };
};

export const normalizeMarketData = (
  raw: any,
  options: {
    eventId?: string;
    outcomeIndex?: number;
    totalOutcomes?: number;
    eventMetadata?: any;
  } = {},
): NormalizedMarket => {
  const now = Date.now();
  const { tokens, clobTokenIds: parsedClobTokenIds } = parseMarketArrays(raw);
  const normalizedClobIds = parsedClobTokenIds.length
    ? parsedClobTokenIds.map((item) => String(item))
    : undefined;
  const yesTokenIdFromTokens = tokens[1]?.yesTokenId || tokens[0]?.yesTokenId;
  const noTokenIdFromTokens = tokens[0]?.noTokenId || tokens[1]?.noTokenId;
  const fallbackClobIds = normalizedClobIds ?? resolveClobTokenIds(raw);
  const yesTokenId = yesTokenIdFromTokens ?? fallbackClobIds?.[1];
  const noTokenId = noTokenIdFromTokens ?? fallbackClobIds?.[0];

  const outcomeNames = extractOutcomesArray(raw);
  const prices = extractPricesArray(raw);
  const derivedName = deriveMarketOutcomeName(raw, options.eventMetadata);
  const yesOutcomeIndex = outcomeNames.findIndex(
    (name) => name?.toLowerCase() === "yes",
  );
  const yesProbability = clampProbability(
    yesOutcomeIndex !== -1
      ? (prices[yesOutcomeIndex] ?? prices[0] ?? 0)
      : (prices[1] ?? prices[0] ?? 0),
  );

  const primaryOutcome: PrimaryOutcome | undefined = derivedName
    ? {
        name: derivedName,
        probability: yesProbability,
        yesTokenId,
        noTokenId,
      }
    : yesTokenId || noTokenId
      ? {
          name: "Yes",
          probability: yesProbability,
          yesTokenId,
          noTokenId,
        }
      : undefined;

  const outcomes = normalizeOutcomes(raw, now, primaryOutcome?.name);
  const resolvedClobTokenIds = fallbackClobIds;
  const marketType: MarketType = detectMarketType(raw);
  const conditionId = raw.conditionId ?? raw.market ?? raw.marketId;
  const { negRisk, negRiskMarketId } = resolveNegRisk(raw);

  return {
    id: resolveMarketId(raw),
    slug: safeString(raw.slug),
    title: safeString(raw.title ?? raw.question ?? raw.marketTitle, "Untitled"),
    description: raw.description ? String(raw.description) : undefined,
    type: marketType,
    outcomes,
    volume: parseNumber(raw.volume),
    liquidity: parseNumber(raw.liquidity),
    openInterest: parseNumber(raw.openInterest),
    startDate: parseDate(raw.startDate),
    endDate: parseDate(raw.endDate),
    active: Boolean(raw.active ?? true),
    closed: Boolean(raw.closed ?? false),
    lastUpdated: now,
    commentCount: parseNumber(raw.commentCount),
    icon: raw.icon ? String(raw.icon) : undefined,
    image: raw.image ? String(raw.image) : undefined,
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((tag: any) => ({
          id: safeString(tag.id),
          label: safeString(tag.label),
          slug: safeString(tag.slug),
        }))
      : undefined,
    clobTokenIds: resolvedClobTokenIds,
    eventId: options.eventId,
    conditionId: conditionId ? String(conditionId) : undefined,
    marketType,
    outcomeIndex: options.outcomeIndex,
    totalOutcomes: options.totalOutcomes,
    negRisk,
    negRiskMarketId,
    yesTokenId,
    noTokenId,
    primaryOutcome,
    displayName: primaryOutcome?.name ?? undefined,
  };
};

export const normalizeEventMarkets = (event: any): NormalizedMarket[] => {
  if (!event || !Array.isArray(event.markets)) {
    return [];
  }

  const totalOutcomes = event.markets.length;

  return event.markets.map((market: any, index: number) =>
    normalizeMarketData(
      {
        ...market,
        title: event.title,
        icon: event.icon,
        image: event.image,
        featured: event.featured,
        commentCount: event.commentCount,
        negRisk: market.negRisk ?? event.enableNegRisk,
      },
      {
        eventId: event.id ?? event.slug,
        outcomeIndex: index,
        totalOutcomes,
        eventMetadata: event,
      },
    ),
  );
};

export const normalizeEventPrimaryMarket = (
  event: any,
): NormalizedMarket | null => {
  const [market] = normalizeEventMarkets(event);
  return market ?? null;
};

export const buildEventOutcomes = (event: any): EventOutcomes | null => {
  if (!event) return null;
  const markets = normalizeEventMarkets(event);
  if (!markets.length) return null;

  const totalVolume = markets.reduce(
    (sum, market) => sum + (market.volume ?? 0),
    0,
  );
  const totalLiquidity = markets.reduce(
    (sum, market) => sum + (market.liquidity ?? 0),
    0,
  );

  return {
    eventId: String(
      event.id ?? event.slug ?? markets[0]?.eventId ?? randomId(),
    ),
    title: safeString(
      event.title ?? event.ticker ?? markets[0]?.title ?? "Untitled",
    ),
    slug: safeString(event.slug ?? markets[0]?.slug ?? ""),
    markets,
    totalVolume,
    totalLiquidity,
    updatedAt: Date.now(),
    negRisk: Boolean(event.enableNegRisk ?? event.negRisk),
  };
};
