"use client";

import { usePolymarketStore } from "@/store/usePolymarketStore";
import { formatPrice } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

interface OrderBookProps {
  marketId?: string;
}

export function OrderBook({ marketId }: OrderBookProps) {
  const orderbooks = usePolymarketStore((state) => state.orderbooks);

  const orderbook = useMemo(() => {
    if (!marketId) {
      const firstOrderbook = Array.from(orderbooks.values())[0];
      return firstOrderbook || null;
    }
    return orderbooks.get(marketId) || null;
  }, [orderbooks, marketId]);

  if (!orderbook) {
    return (
      <div className="panel h-full flex items-center justify-center min-h-[200px]">
        <div className="text-center text-muted-foreground font-mono text-[11px] sm:text-sm">
          NO ORDERBOOK DATA
        </div>
      </div>
    );
  }

  const maxSize = Math.max(
    ...orderbook.bids.map((b) => parseFloat(b.size)),
    ...orderbook.asks.map((a) => parseFloat(a.size)),
  );

  return (
    <div className="panel h-full min-h-0 flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-base sm:text-lg lg:text-xl font-mono font-bold">
          ORDER BOOK
        </h2>
        <div className="text-[11px] sm:text-xs font-mono text-muted-foreground">
          {orderbook.market}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 -mx-4 px-4">
        <div className="grid grid-cols-2 gap-4 pr-2">
          {/* Bids (Buy Orders) */}
          <div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-buy mb-2 pb-2 border-b border-border">
              BIDS
            </div>
            <div className="space-y-1">
              {orderbook.bids.slice(0, 15).map((bid, index) => {
                const size = parseFloat(bid.size);
                const width = (size / maxSize) * 100;

                return (
                  <div key={index} className="relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-buy/10"
                      style={{ width: `${width}%` }}
                    />
                    <div className="relative flex justify-between text-[11px] sm:text-xs font-mono py-1 px-2">
                      <span className="text-buy">
                        ${formatPrice(bid.price)}
                      </span>
                      <span className="text-muted-foreground">
                        {size.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-sell mb-2 pb-2 border-b border-border">
              ASKS
            </div>
            <div className="space-y-1">
              {orderbook.asks.slice(0, 15).map((ask, index) => {
                const size = parseFloat(ask.size);
                const width = (size / maxSize) * 100;

                return (
                  <div key={index} className="relative">
                    <div
                      className="absolute inset-y-0 right-0 bg-sell/10"
                      style={{ width: `${width}%` }}
                    />
                    <div className="relative flex justify-between text-[11px] sm:text-xs font-mono py-1 px-2">
                      <span className="text-sell">
                        ${formatPrice(ask.price)}
                      </span>
                      <span className="text-muted-foreground">
                        {size.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
