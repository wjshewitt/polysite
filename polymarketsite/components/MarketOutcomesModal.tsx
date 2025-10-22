"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import type {
  NormalizedMarket,
  Outcome,
  EventOutcomeSummary,
} from "@/types/markets";
import { MultiOutcomeBoard } from "@/components/markets/MultiOutcomeBoard";

interface MarketOutcomesModalProps {
  market: NormalizedMarket | null;
  markets?: NormalizedMarket[];
  summary?: EventOutcomeSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SortOption =
  | "probability-desc"
  | "probability-asc"
  | "price-desc"
  | "price-asc"
  | "volume-desc"
  | "volume-asc"
  | "name-asc"
  | "name-desc";

export function MarketOutcomesModal({
  market,
  markets,
  summary,
  open,
  onOpenChange,
}: MarketOutcomesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("probability-desc");

  const multiSummary = summary?.isMultiOutcome ? summary : null;
  const marketList = markets ?? (market ? [market] : []);
  const primaryMarket = market ?? marketList[0] ?? null;

  // Filter outcomes based on search query
  const filteredOutcomes = useMemo(() => {
    if (!primaryMarket?.outcomes) return [];
    if (!searchQuery.trim()) return primaryMarket.outcomes;

    const query = searchQuery.toLowerCase();
    return primaryMarket.outcomes.filter((outcome) =>
      outcome.name.toLowerCase().includes(query)
    );
  }, [primaryMarket?.outcomes, searchQuery]);

  // Sort outcomes
  const sortedOutcomes = useMemo(() => {
    const sorted = [...filteredOutcomes];

    switch (sortBy) {
      case "probability-desc":
        sorted.sort((a, b) => b.probability - a.probability);
        break;
      case "probability-asc":
        sorted.sort((a, b) => a.probability - b.probability);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "volume-desc":
        sorted.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
        break;
      case "volume-asc":
        sorted.sort((a, b) => (a.volume ?? 0) - (b.volume ?? 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return sorted;
  }, [filteredOutcomes, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!primaryMarket?.outcomes) return null;

    const totalVolume = primaryMarket.outcomes.reduce(
      (sum, o) => sum + (o.volume ?? 0),
      0
    );
    const avgProbability =
      primaryMarket.outcomes.reduce((sum, o) => sum + o.probability, 0) /
      primaryMarket.outcomes.length;
    const topOutcome = [...primaryMarket.outcomes].sort(
      (a, b) => b.probability - a.probability
    )[0];

    return {
      totalVolume,
      avgProbability,
      topOutcome,
      totalOutcomes: primaryMarket.outcomes.length,
    };
  }, [primaryMarket?.outcomes]);

  const formatProbability = (value: number): string =>
    `${(value * 100).toFixed(1)}%`;

  const formatPrice = (value: number): string =>
    `${(value * 100).toFixed(1)}¢`;

  const formatVolume = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatChange24h = (value?: number): string | null => {
    if (value === undefined) return null;
    const sign = value >= 0 ? "+" : "";
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  if (!multiSummary && !primaryMarket) return null;

  const isBinary =
    !multiSummary &&
    primaryMarket !== null &&
    (primaryMarket.type === "binary" || primaryMarket.outcomes.length <= 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="space-y-3">
            <div>
              <DialogTitle className="text-xl font-mono font-bold mb-2">
                {multiSummary ? "Event Outcomes" : primaryMarket?.title}
              </DialogTitle>
              {primaryMarket?.description && !multiSummary && (
                <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                  {primaryMarket.description}
                </p>
              )}
            </div>

            {/* Stats Row */}
            {!multiSummary && stats && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Outcomes:</span>
                  <span className="font-bold text-foreground">
                    {stats.totalOutcomes}
                  </span>
                </div>
                {stats.totalVolume > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total Volume:</span>
                    <span className="font-bold text-foreground">
                      {formatVolume(stats.totalVolume)}
                    </span>
                  </div>
                )}
                {stats.topOutcome && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Leading:</span>
                    <span className="font-bold text-buy">
                      {stats.topOutcome.name}
                    </span>
                    <span className="text-buy">
                      ({formatProbability(stats.topOutcome.probability)})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Market Tags */}
            {primaryMarket?.tags && primaryMarket.tags.length > 0 && !multiSummary && (
              <div className="flex flex-wrap gap-1">
                {primaryMarket.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-1 border border-border"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border flex-shrink-0 space-y-3">
          {!multiSummary && primaryMarket && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search outcomes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-2 bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                >
                  <option value="probability-desc">
                    Probability (High to Low)
                  </option>
                  <option value="probability-asc">Probability (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  {sortedOutcomes.some((o) => o.volume !== undefined) && (
                    <>
                      <option value="volume-desc">Volume (High to Low)</option>
                      <option value="volume-asc">Volume (Low to High)</option>
                    </>
                  )}
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                </select>
              </div>

              <div className="text-xs font-mono text-muted-foreground">
                Showing {sortedOutcomes.length} of {primaryMarket.outcomes.length} outcome
                {primaryMarket.outcomes.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            {multiSummary ? (
              <MultiOutcomeBoard
                summary={multiSummary}
                markets={marketList}
                loading={false}
              />
            ) : sortedOutcomes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-mono text-muted-foreground">
                  {searchQuery
                    ? "No outcomes match your search"
                    : "No outcomes available"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOutcomes.map((outcome, index) => {
                  const probabilityColor =
                    outcome.probability >= 0.7
                      ? "text-buy"
                      : outcome.probability <= 0.3
                        ? "text-sell"
                        : "text-neutral";

                  const priceChange = formatChange24h(outcome.change24h);
                  const isPositiveChange =
                    outcome.change24h !== undefined && outcome.change24h >= 0;

                  return (
                    <div
                      key={`${outcome.name}-${outcome.tokenId || index}`}
                      className="border border-border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-mono font-bold mb-1">
                            {outcome.name}
                          </h3>
                          {outcome.tokenId && (
                            <p className="text-xs font-mono text-muted-foreground">
                              Token: {outcome.tokenId.slice(0, 8)}...
                              {outcome.tokenId.slice(-6)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-lg font-mono font-bold ${probabilityColor}`}
                          >
                            {formatProbability(outcome.probability)}
                          </span>
                          {priceChange && (
                            <div
                              className={`flex items-center gap-1 text-xs font-mono ${
                                isPositiveChange ? "text-buy" : "text-sell"
                              }`}
                            >
                              {isPositiveChange ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {priceChange}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border">
                        <div>
                          <span className="text-xs font-mono text-muted-foreground block mb-1">
                            Price
                          </span>
                          <span className="text-sm font-mono font-bold">
                            {formatPrice(outcome.price)}
                          </span>
                        </div>

                        {outcome.volume !== undefined && (
                          <div>
                            <span className="text-xs font-mono text-muted-foreground block mb-1">
                              Volume
                            </span>
                            <span className="text-sm font-mono font-bold">
                              {formatVolume(outcome.volume)}
                            </span>
                          </div>
                        )}

                        {outcome.liquidity !== undefined && (
                          <div>
                            <span className="text-xs font-mono text-muted-foreground block mb-1">
                              Liquidity
                            </span>
                            <span className="text-sm font-mono font-bold">
                              {formatVolume(outcome.liquidity)}
                            </span>
                          </div>
                        )}

                        {outcome.lastUpdated && (
                          <div>
                            <span className="text-xs font-mono text-muted-foreground block mb-1">
                              Updated
                            </span>
                            <span className="text-sm font-mono font-bold">
                              {new Date(outcome.lastUpdated).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 relative h-2 bg-muted overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 transition-all ${
                            outcome.probability >= 0.7
                              ? "bg-buy"
                              : outcome.probability <= 0.3
                                ? "bg-sell"
                                : "bg-neutral"
                          }`}
                          style={{
                            width: `${outcome.probability * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
