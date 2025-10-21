/**
 * Crypto Price Conversion Utilities
 *
 * Provides utilities for converting market prices to USD equivalents
 * using live crypto price data from Polymarket's WebSocket feed.
 */

import { CryptoPrice } from "@/types/polymarket";

/**
 * Get USD equivalent for a token amount
 * @param amount - The token amount (as string or number)
 * @param tokenSymbol - The token symbol (e.g., "USDC", "MATIC", "ETH")
 * @param cryptoPrices - Map of crypto prices from store
 * @returns USD value as number
 */
export function getUSDEquivalent(
  amount: string | number,
  tokenSymbol: string,
  cryptoPrices: Map<string, CryptoPrice>
): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;

  // USDC is already 1:1 with USD
  if (tokenSymbol === "USDC" || tokenSymbol === "USDC-USD") {
    return numAmount;
  }

  // Normalize symbol to match our price feed format
  const normalizedSymbol = normalizeSymbol(tokenSymbol);
  const price = cryptoPrices.get(normalizedSymbol);

  if (!price) {
    console.warn(`No price data for ${tokenSymbol}, using USDC 1:1 fallback`);
    return numAmount; // Fallback to 1:1 if no price data
  }

  const priceValue = parseFloat(price.price);
  return numAmount * priceValue;
}

/**
 * Normalize token symbol to match price feed format
 * @param symbol - Token symbol in any format
 * @returns Normalized symbol (e.g., "ETHUSDT", "MATIC-USD")
 */
export function normalizeSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();

  // Already in correct format
  if (upper.endsWith("USDT") || upper.endsWith("-USD")) {
    return upper;
  }

  // Map common variations
  const symbolMap: Record<string, string> = {
    USDC: "USDC-USD",
    MATIC: "MATIC-USD",
    ETH: "ETH-USD",
    BTC: "BTCUSDT",
    SOL: "SOLUSDT",
    XRP: "XRPUSDT",
    ADA: "ADAUSDT",
    DOGE: "DOGEUSDT",
    AVAX: "AVAXUSDT",
    DOT: "DOTUSDT",
    LINK: "LINKUSDT",
  };

  return symbolMap[upper] || `${upper}USDT`;
}

/**
 * Format USD amount with appropriate precision
 * @param amount - USD amount to format
 * @returns Formatted string (e.g., "$1,234.56", "$0.0012")
 */
export function formatUSD(amount: number): string {
  if (isNaN(amount)) return "$0.00";

  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  } else if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`;
  } else if (amount >= 1) {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (amount >= 0.01) {
    return `$${amount.toFixed(4)}`;
  } else {
    return `$${amount.toFixed(6)}`;
  }
}

/**
 * Get current price for a token
 * @param tokenSymbol - Token symbol
 * @param cryptoPrices - Map of crypto prices from store
 * @returns Price as number, or 1.0 for USDC, or 0 if unavailable
 */
export function getTokenPrice(
  tokenSymbol: string,
  cryptoPrices: Map<string, CryptoPrice>
): number {
  if (tokenSymbol === "USDC" || tokenSymbol === "USDC-USD") {
    return 1.0;
  }

  const normalizedSymbol = normalizeSymbol(tokenSymbol);
  const price = cryptoPrices.get(normalizedSymbol);

  if (!price) {
    return 0;
  }

  return parseFloat(price.price);
}

/**
 * Format token amount with symbol
 * @param amount - Token amount
 * @param symbol - Token symbol
 * @param includeUSD - Whether to include USD equivalent in parentheses
 * @param cryptoPrices - Map of crypto prices from store (required if includeUSD is true)
 * @returns Formatted string (e.g., "100 USDC", "0.5 ETH ($1,140.00)")
 */
export function formatTokenAmount(
  amount: string | number,
  symbol: string,
  includeUSD: boolean = false,
  cryptoPrices?: Map<string, CryptoPrice>
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `0 ${symbol}`;

  const displaySymbol = symbol.replace("-USD", "").replace("USDT", "");
  let formatted = `${numAmount.toFixed(2)} ${displaySymbol}`;

  if (includeUSD && cryptoPrices) {
    const usdValue = getUSDEquivalent(numAmount, symbol, cryptoPrices);
    formatted += ` (${formatUSD(usdValue)})`;
  }

  return formatted;
}

/**
 * Calculate price impact percentage
 * @param currentPrice - Current price
 * @param newPrice - New price after trade
 * @returns Price impact as percentage (e.g., 0.05 for 5%)
 */
export function calculatePriceImpact(
  currentPrice: number,
  newPrice: number
): number {
  if (currentPrice === 0) return 0;
  return Math.abs((newPrice - currentPrice) / currentPrice);
}

/**
 * Format price impact with color coding
 * @param impact - Impact as decimal (e.g., 0.05 for 5%)
 * @returns Object with formatted text and severity level
 */
export function formatPriceImpact(impact: number): {
  text: string;
  severity: "low" | "medium" | "high";
} {
  const percentage = impact * 100;

  let severity: "low" | "medium" | "high" = "low";
  if (percentage > 5) {
    severity = "high";
  } else if (percentage > 1) {
    severity = "medium";
  }

  return {
    text: `${percentage.toFixed(2)}%`,
    severity,
  };
}

/**
 * Get display name for token symbol
 * @param symbol - Token symbol in any format
 * @returns Display name (e.g., "BTC", "ETH", "MATIC")
 */
export function getTokenDisplayName(symbol: string): string {
  const symbolMap: Record<string, string> = {
    BTCUSDT: "BTC",
    ETHUSDT: "ETH",
    SOLUSDT: "SOL",
    XRPUSDT: "XRP",
    ADAUSDT: "ADA",
    DOGEUSDT: "DOGE",
    MATICUSDT: "MATIC",
    AVAXUSDT: "AVAX",
    DOTUSDT: "DOT",
    LINKUSDT: "LINK",
    "MATIC-USD": "MATIC",
    "ETH-USD": "ETH",
    "USDC-USD": "USDC",
  };

  return (
    symbolMap[symbol.toUpperCase()] ||
    symbol.replace("USDT", "").replace("-USD", "").toUpperCase()
  );
}

/**
 * Check if price data is stale
 * @param timestamp - Price timestamp in milliseconds
 * @param maxAgeSeconds - Maximum age in seconds (default: 60)
 * @returns True if price is stale
 */
export function isPriceStale(
  timestamp: number,
  maxAgeSeconds: number = 60
): boolean {
  const ageSeconds = (Date.now() - timestamp) / 1000;
  return ageSeconds > maxAgeSeconds;
}

/**
 * Get price freshness indicator
 * @param timestamp - Price timestamp in milliseconds
 * @returns Object with indicator text and color
 */
export function getPriceFreshness(timestamp: number): {
  text: string;
  color: "green" | "yellow" | "red";
} {
  const ageSeconds = (Date.now() - timestamp) / 1000;

  if (ageSeconds < 10) {
    return { text: "Live", color: "green" };
  } else if (ageSeconds < 60) {
    return { text: `${Math.floor(ageSeconds)}s ago`, color: "green" };
  } else if (ageSeconds < 300) {
    return { text: `${Math.floor(ageSeconds / 60)}m ago`, color: "yellow" };
  } else {
    return { text: "Stale", color: "red" };
  }
}

/**
 * Calculate total value in USD for multiple token positions
 * @param positions - Array of {amount, symbol} objects
 * @param cryptoPrices - Map of crypto prices from store
 * @returns Total USD value
 */
export function calculatePortfolioValue(
  positions: Array<{ amount: string | number; symbol: string }>,
  cryptoPrices: Map<string, CryptoPrice>
): number {
  return positions.reduce((total, position) => {
    return total + getUSDEquivalent(position.amount, position.symbol, cryptoPrices);
  }, 0);
}
