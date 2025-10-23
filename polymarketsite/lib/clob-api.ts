import { ClobClient, Side } from "@polymarket/clob-client";
import { calculateDisplayPrice } from "@/lib/markets";

// Initialize read-only client
const clobClient = new ClobClient("https://clob.polymarket.com", 137);

export async function fetchInitialPrices(tokenIds: string[]) {
  if (!tokenIds || tokenIds.length === 0) {
    return null;
  }

  try {
    // Fetch orderbooks for spread calculation (using BUY side to get both bids and asks)
    const orderbooks = await clobClient.getOrderBooks(
      tokenIds.map((id) => ({ token_id: id, side: Side.BUY }))
    );

    // Calculate display prices
    return tokenIds.map((tokenId, index) => {
      const orderbook = orderbooks[index];
      const bestBid = orderbook?.bids?.[0]?.price || null;
      const bestAsk = orderbook?.asks?.[0]?.price || null;

      return {
        tokenId,
        ...calculateDisplayPrice(
          bestBid ? parseFloat(bestBid) : null,
          bestAsk ? parseFloat(bestAsk) : null,
          null // No last trade on init
        ),
      };
    });
  } catch (error: any) {
    // Only log unexpected errors in development
    const isNetworkError = error?.name === "TypeError" || error?.message?.includes("fetch");
    if (!isNetworkError && process.env.NODE_ENV === "development") {
      console.debug("Failed to fetch initial prices:", error?.message);
    }
    // Fallback to WebSocket-only pricing
    return null;
  }
}
