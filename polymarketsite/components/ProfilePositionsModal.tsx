"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowUpDown, User } from "lucide-react";
import type { CommentProfile } from "@/services/gamma";
import type { NormalizedMarket, Outcome } from "@/types/markets";

interface ProfilePositionsModalProps {
  profile: CommentProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markets: NormalizedMarket[];
}

interface EnrichedPosition {
  tokenId: string;
  positionSize: string;
  positionSizeNum: number;
  outcomeName: string;
  probability: number;
  marketTitle: string;
  marketId: string;
  outcome?: Outcome;
}

type SortOption =
  | "probability-desc"
  | "probability-asc"
  | "size-desc"
  | "size-asc"
  | "name-asc"
  | "name-desc";

export function ProfilePositionsModal({
  profile,
  open,
  onOpenChange,
  markets,
}: ProfilePositionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("probability-desc");

  // Enrich positions with market and outcome data
  const enrichedPositions = useMemo<EnrichedPosition[]>(() => {
    if (!profile?.positions || !markets.length) return [];

    const positions: EnrichedPosition[] = [];

    profile.positions.forEach((position) => {
      // Find the market and outcome that matches this position's tokenId
      for (const market of markets) {
        const outcome = market.outcomes.find(
          (o) => o.tokenId === position.tokenId,
        );
        if (outcome) {
          positions.push({
            tokenId: position.tokenId,
            positionSize: position.positionSize,
            positionSizeNum: parseFloat(position.positionSize) || 0,
            outcomeName: outcome.name,
            probability: outcome.probability,
            marketTitle: market.title,
            marketId: market.id,
            outcome,
          });
          break;
        }
      }
    });

    return positions;
  }, [profile?.positions, markets]);

  // Filter positions based on search query
  const filteredPositions = useMemo(() => {
    if (!searchQuery.trim()) return enrichedPositions;

    const query = searchQuery.toLowerCase();
    return enrichedPositions.filter(
      (pos) =>
        pos.outcomeName.toLowerCase().includes(query) ||
        pos.marketTitle.toLowerCase().includes(query),
    );
  }, [enrichedPositions, searchQuery]);

  // Sort positions
  const sortedPositions = useMemo(() => {
    const sorted = [...filteredPositions];

    switch (sortBy) {
      case "probability-desc":
        sorted.sort((a, b) => b.probability - a.probability);
        break;
      case "probability-asc":
        sorted.sort((a, b) => a.probability - b.probability);
        break;
      case "size-desc":
        sorted.sort((a, b) => b.positionSizeNum - a.positionSizeNum);
        break;
      case "size-asc":
        sorted.sort((a, b) => a.positionSizeNum - b.positionSizeNum);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.outcomeName.localeCompare(b.outcomeName));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.outcomeName.localeCompare(a.outcomeName));
        break;
    }

    return sorted;
  }, [filteredPositions, sortBy]);

  const formatProbability = (value: number): string =>
    `${(value * 100).toFixed(1)}%`;

  const formatPositionSize = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "probability-desc":
        return "Probability (High to Low)";
      case "probability-asc":
        return "Probability (Low to High)";
      case "size-desc":
        return "Position Size (Large to Small)";
      case "size-asc":
        return "Position Size (Small to Large)";
      case "name-asc":
        return "Name (A to Z)";
      case "name-desc":
        return "Name (Z to A)";
    }
  };

  if (!profile) return null;

  const displayName =
    profile.name ||
    profile.pseudonym ||
    (profile.baseAddress
      ? `${profile.baseAddress.slice(0, 6)}...${profile.baseAddress.slice(-4)}`
      : "Anonymous");

  const totalPositions = enrichedPositions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 z-[100]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-16 h-16 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-mono font-bold mb-1">
                {displayName}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>
                  {totalPositions} position{totalPositions !== 1 ? "s" : ""}
                </span>
                {profile.isMod && (
                  <span className="text-buy font-bold">MOD</span>
                )}
                {profile.isCreator && (
                  <span className="text-neutral font-bold">CREATOR</span>
                )}
              </div>
              {profile.bio && (
                <p className="text-xs font-mono text-muted-foreground mt-2 line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border flex-shrink-0 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search positions by outcome or market name..."
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

          {/* Sort Controls */}
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
              <option value="size-desc">Position Size (Large to Small)</option>
              <option value="size-asc">Position Size (Small to Large)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-xs font-mono text-muted-foreground">
            Showing {sortedPositions.length} of {totalPositions} position
            {totalPositions !== 1 ? "s" : ""}
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            {sortedPositions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-mono text-muted-foreground">
                  {searchQuery
                    ? "No positions match your search"
                    : "No positions found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPositions.map((position, index) => {
                  const probabilityColor =
                    position.probability >= 0.7
                      ? "text-buy"
                      : position.probability <= 0.3
                        ? "text-sell"
                        : "text-neutral";

                  return (
                    <div
                      key={`${position.tokenId}-${index}`}
                      className="border border-border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      {/* Outcome Name & Probability */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-sm font-mono font-bold flex-1">
                          {position.outcomeName}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-sm font-mono font-bold ${probabilityColor}`}
                          >
                            {formatProbability(position.probability)}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            probability
                          </span>
                        </div>
                      </div>

                      {/* Market Title */}
                      <div className="text-xs font-mono text-muted-foreground mb-3">
                        {position.marketTitle}
                      </div>

                      {/* Position Details */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground">
                              Position:{" "}
                            </span>
                            <span className="font-bold">
                              {formatPositionSize(position.positionSizeNum)}{" "}
                              shares
                            </span>
                          </div>
                          {position.outcome?.price !== undefined && (
                            <div>
                              <span className="text-muted-foreground">
                                Price:{" "}
                              </span>
                              <span className="font-bold">
                                {(position.outcome.price * 100).toFixed(1)}¢
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Value Indicator */}
                        {position.outcome?.price !== undefined && (
                          <div className="text-xs font-mono">
                            <span className="text-muted-foreground">
                              Value:{" "}
                            </span>
                            <span className="font-bold">
                              $
                              {(
                                position.positionSizeNum *
                                position.outcome.price
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 relative h-2 bg-muted overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 transition-all ${
                            position.probability >= 0.7
                              ? "bg-buy"
                              : position.probability <= 0.3
                                ? "bg-sell"
                                : "bg-neutral"
                          }`}
                          style={{
                            width: `${position.probability * 100}%`,
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
