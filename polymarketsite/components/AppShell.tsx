"use client";

import { useEffect } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { validateStoredMarket } from "@/lib/marketSearch";
import { DashboardHeader } from "@/components/DashboardHeader";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const selectedMarket = usePolymarketStore((state) => state.selectedMarket);
  const clearSelectedMarket = usePolymarketStore(
    (state) => state.clearSelectedMarket,
  );

  // Validate stored market on mount
  useEffect(() => {
    if (selectedMarket) {
      // Only validate if market is older than 5 seconds (not just selected)
      const age = Date.now() - selectedMarket.selectedAt;
      if (age > 5000) {
        validateStoredMarket(selectedMarket)
          .then((isValid) => {
            if (!isValid) {
              // Market is expired or no longer available - this is expected behavior
              if (process.env.NODE_ENV === "development") {
                console.debug(
                  "[AppShell] Clearing expired market selection:",
                  selectedMarket.slug || selectedMarket.marketId,
                );
              }
              clearSelectedMarket();

              // Optionally show a toast notification
              // toast.info("Selected market has ended. Showing all markets.");
            }
          })
          .catch(() => {
            // Validation error - clear selection silently
            // This is expected for markets that have been removed
            clearSelectedMarket();
          });
      }
    }
  }, [selectedMarket, clearSelectedMarket]);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
