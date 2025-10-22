import { ClobClient } from "@polymarket/clob-client";
import { calculateDisplayPrice } from "@/lib/markets";

// Initialize read-only client
const clobClient = new ClobClient("https://clob.polymarket.com", 137);

export async function fetchInitialPrices(tokenIds: string[]) {
  if (!tokenIds || tokenIds.length === 0) {
    return null;
  }

  try {
    // Fetch orderbooks for spread calculation
    const orderbooks = await clobClient.getOrderBooks(
      tokenIds.map((id) => ({ token_id: id }))
    );

    // Calculate display prices
    return tokenIds.map((tokenId) => {
      const orderbook = orderbooks[tokenId];
      const bestBid = orderbook.bids[0]?.price || null;
      const bestAsk = orderbook.asks[0]?.price || null;

      return {
        tokenId,
        ...calculateDisplayPrice(
          bestBid ? parseFloat(bestBid) : null,
          bestAsk ? parseFloat(bestAsk) : null,
          null // No last trade on init
        ),
      };
    });
  } catch (error) {
    console.error("Failed to fetch initial prices:", error);
    // Fallback to WebSocket-only pricing
    return null;
  }
}
