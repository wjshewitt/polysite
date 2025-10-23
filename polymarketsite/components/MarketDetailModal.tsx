"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GammaEvent,
  gammaAPI,
  GammaComment,
  CommentProfile,
} from "@/services/gamma";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { MarketOutcomes } from "@/components/markets/MarketOutcomes";
import { MultiOutcomeBoard } from "@/components/markets/MultiOutcomeBoard";
import { buildEventOutcomeSummary } from "@/lib/markets";
import { ProfilePositionsModal } from "@/components/ProfilePositionsModal";
import { MarketOutcomesModal } from "@/components/MarketOutcomesModal";
import { toSelectedMarketState } from "@/lib/marketSearch";
import type { NormalizedMarket, EventOutcomeSummary } from "@/types/markets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ExternalLink,
  Calendar,
  BarChart3,
  MessageSquare,
  Activity,
  ThumbsUp,
  ThumbsDown,
  User,
  Loader2,
} from "lucide-react";

interface MarketDetailModalProps {
  market: GammaEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketDetailModal({
  market,
  open,
  onOpenChange,
}: MarketDetailModalProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<GammaComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentOffset, setCommentOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentSortOrder, setCommentSortOrder] = useState<
    "recent" | "oldest" | "likes"
  >("recent");
  const [hideAllReplies, setHideAllReplies] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [selectedProfile, setSelectedProfile] = useState<CommentProfile | null>(
    null,
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [outcomesModalOpen, setOutcomesModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventOutcomes = usePolymarketStore((state) => state.eventOutcomes);
  const selectedMarketState = usePolymarketStore(
    (state) => state.selectedMarket,
  );
  const setGlobalSelectedMarket = usePolymarketStore(
    (state) => state.setSelectedMarket,
  );

  // Local state for tracking which outcome is shown in detail view
  const [localSelectedMarketId, setLocalSelectedMarketId] = useState<
    string | null
  >(selectedMarketState?.marketId || null);

  const normalizedMarkets = useMemo<NormalizedMarket[]>(() => {
    if (!market) return [];
    const cached = eventOutcomes.get(market.id);
    if (cached?.markets?.length) return cached.markets;
    return gammaAPI.getNormalizedMarketsFromEvent(market);
  }, [market, eventOutcomes]);

  const normalizedMarket = useMemo<NormalizedMarket | null>(() => {
    if (!normalizedMarkets.length) return null;
    if (localSelectedMarketId) {
      const match = normalizedMarkets.find(
        (item) => item.id === localSelectedMarketId,
      );
      if (match) return match;
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const outcomeSlug = params.get("outcome");
    if (outcomeSlug) {
      const match = normalizedMarkets.find((item) => item.slug === outcomeSlug);
      if (match) return match;
    }
    return normalizedMarkets[0] ?? null;
  }, [normalizedMarkets, localSelectedMarketId, searchParams]);

  // Build or retrieve event-level outcome summary for multi-outcome board
  const eventSummary = useMemo<EventOutcomeSummary | null>(() => {
    if (!market || !normalizedMarkets.length) return null;
    const cached = eventOutcomes.get(market.id)?.summary;
    if (cached) return cached;
    const totalVolume = normalizedMarkets.reduce(
      (sum, m) => sum + (m.volume ?? 0),
      0,
    );
    const totalLiquidity = normalizedMarkets.reduce(
      (sum, m) => sum + (m.liquidity ?? 0),
      0,
    );
    return buildEventOutcomeSummary(String(market.id), normalizedMarkets, {
      totalVolume,
      totalLiquidity,
    });
  }, [market, normalizedMarkets, eventOutcomes]);

  // Fetch comments when modal opens or comments section is toggled
  useEffect(() => {
    if (open && showComments && market && comments.length === 0) {
      fetchComments();
    }
  }, [open, showComments, market]);

  // Auto-collapse non-essential sections when comments are shown
  useEffect(() => {
    if (showComments && collapsedSections.size === 0) {
      // Auto-collapse tags, resolution source, and technical info when opening comments
      setCollapsedSections(new Set(["tags", "resolution", "technical"]));
    } else if (!showComments && collapsedSections.size > 0) {
      // Expand all sections when hiding comments
      setCollapsedSections(new Set());
    }
  }, [showComments]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowComments(false);
      setComments([]);
      setCommentsError(null);
      setCommentOffset(0);
      setHasMoreComments(true);
    }
  }, [open]);

  // Reset local selection when modal closes
  useEffect(() => {
    if (!open && localSelectedMarketId) {
      setLocalSelectedMarketId(null);
    }
  }, [open, localSelectedMarketId]);

  useEffect(() => {
    if (!market || !open) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const eventParam = params.get("event");
    const outcomeParam = params.get("outcome");

    if (!eventParam || eventParam !== market.slug) {
      params.set("event", market.slug);
    }
    if (
      normalizedMarket &&
      (!outcomeParam || outcomeParam !== normalizedMarket.slug)
    ) {
      params.set("outcome", normalizedMarket.slug);
    }
    router.replace(`?${params.toString()}`);
  }, [market, open, normalizedMarket, router, searchParams]);

  const fetchComments = async (reset = true) => {
    if (!market) return;

    try {
      if (reset) {
        setLoadingComments(true);
        setCommentOffset(0);
      } else {
        setLoadingMoreComments(true);
      }
      setCommentsError(null);

      const offset = reset ? 0 : commentOffset;
      const order =
        commentSortOrder === "likes" ? "reactionCount" : "createdAt";
      const ascending = commentSortOrder === "oldest";

      console.log(
        `[MarketDetailModal] Fetching comments for event ID: ${market.id}, offset: ${offset}, order: ${order}, ascending: ${ascending}`,
      );

      const fetchedComments = await gammaAPI.fetchComments({
        parent_entity_type: "Event",
        parent_entity_id: parseInt(market.id),
        limit: 50,
        offset: offset,
        order: order,
        ascending: ascending,
        get_positions: true,
      });

      if (reset) {
        setComments(fetchedComments);
      } else {
        setComments((prev) => [...prev, ...fetchedComments]);
      }

      setCommentOffset(offset + fetchedComments.length);
      setHasMoreComments(fetchedComments.length === 50);

      console.log(
        `[MarketDetailModal] Loaded ${fetchedComments.length} comments (total: ${reset ? fetchedComments.length : comments.length + fetchedComments.length})`,
      );
    } catch (error) {
      console.error("[MarketDetailModal] Error fetching comments:", error);
      setCommentsError("Failed to load comments");
    } finally {
      setLoadingComments(false);
      setLoadingMoreComments(false);
    }
  };

  const loadMoreComments = () => {
    fetchComments(false);
  };

  // Refetch comments when sort order changes
  useEffect(() => {
    if (showComments && comments.length > 0) {
      fetchComments(true);
    }
  }, [commentSortOrder]);

  // Organize comments into threads
  const organizedComments = useMemo(() => {
    const topLevel: GammaComment[] = [];
    const repliesMap = new Map<string, GammaComment[]>();

    comments.forEach((comment) => {
      if (comment.parentCommentID) {
        const parentId = comment.parentCommentID;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    return { topLevel, repliesMap };
  }, [comments]);

  const toggleReplies = (commentId: string) => {
    setCollapsedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: GammaComment, isReply = false) => {
    const replies = organizedComments.repliesMap.get(comment.id) || [];
    const hasReplies = replies.length > 0;
    const isCollapsed = collapsedReplies.has(comment.id);

    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-2" : ""}>
        <div
          className={`border border-border p-3 hover:bg-muted/50 transition-colors ${isReply ? "border-l-2 border-l-primary" : ""}`}
        >
          {/* Comment Header */}
          <div className="flex items-start gap-2 mb-2">
            <button
              onClick={() => {
                if (
                  comment.profile?.positions &&
                  comment.profile.positions.length > 0
                ) {
                  setSelectedProfile(comment.profile);
                  setProfileModalOpen(true);
                }
              }}
              className={`flex-shrink-0 relative ${
                comment.profile?.positions &&
                comment.profile.positions.length > 0
                  ? "cursor-pointer hover:opacity-80 transition-opacity group"
                  : "cursor-default"
              }`}
              disabled={
                !comment.profile?.positions ||
                comment.profile.positions.length === 0
              }
              title={
                comment.profile?.positions &&
                comment.profile.positions.length > 0
                  ? `View ${comment.profile.positions.length} position${comment.profile.positions.length !== 1 ? "s" : ""}`
                  : undefined
              }
            >
              {comment.profile?.profileImage ? (
                <img
                  src={comment.profile.profileImage}
                  alt=""
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {comment.profile?.positions &&
                comment.profile.positions.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-mono font-bold text-background">
                      {comment.profile.positions.length}
                    </span>
                  </div>
                )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => {
                    if (
                      comment.profile?.positions &&
                      comment.profile.positions.length > 0
                    ) {
                      setSelectedProfile(comment.profile);
                      setProfileModalOpen(true);
                    }
                  }}
                  className={`text-xs font-mono font-bold truncate ${
                    comment.profile?.positions &&
                    comment.profile.positions.length > 0
                      ? "cursor-pointer hover:text-primary transition-colors underline decoration-dotted decoration-primary/30 hover:decoration-solid"
                      : "cursor-default"
                  }`}
                  disabled={
                    !comment.profile?.positions ||
                    comment.profile.positions.length === 0
                  }
                  title={
                    comment.profile?.positions &&
                    comment.profile.positions.length > 0
                      ? `View ${comment.profile.positions.length} position${comment.profile.positions.length !== 1 ? "s" : ""}`
                      : undefined
                  }
                >
                  {comment.profile?.name ||
                    comment.profile?.pseudonym ||
                    `${comment.userAddress?.slice(0, 6)}...${comment.userAddress?.slice(-4)}`}
                </button>
                {comment.profile?.isMod && (
                  <span className="text-xs font-mono text-buy">MOD</span>
                )}
                {comment.profile?.isCreator && (
                  <span className="text-xs font-mono text-neutral">
                    CREATOR
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {formatCommentTime(comment.createdAt)}
              </div>
            </div>
          </div>

          {/* Comment Body */}
          <div className="text-sm font-mono leading-relaxed mb-2 whitespace-pre-wrap break-words">
            {comment.body}
          </div>

          {/* Comment Footer */}
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            {comment.reactionCount !== undefined &&
              comment.reactionCount > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {comment.reactionCount}
                </span>
              )}
            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                disabled={hideAllReplies}
                className={`flex items-center gap-1 transition-colors ${
                  hideAllReplies
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-primary"
                }`}
                title={
                  hideAllReplies
                    ? "Enable replies to expand individual threads"
                    : undefined
                }
              >
                <MessageSquare className="w-3 h-3" />
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
                {!hideAllReplies && (
                  <span className="ml-1">{isCollapsed ? "▼" : "▲"}</span>
                )}
              </button>
            )}
          </div>

          {/* Position Info */}
          {comment.profile?.positions &&
            comment.profile.positions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs font-mono text-muted-foreground">
                  Position: {comment.profile.positions[0].positionSize} shares
                </div>
              </div>
            )}
        </div>

        {/* Render Replies */}
        {hasReplies && !isCollapsed && !hideAllReplies && (
          <div className="mt-2">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (!market) return null;

  const mainMarket =
    normalizedMarket ??
    gammaAPI.getNormalizedPrimaryMarket(market) ??
    (market.markets[0] ? gammaAPI.normalizeMarket(market.markets[0]) : null);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number): string => {
    return `${(price * 100).toFixed(1)}¢`;
  };

  const formatCommentTime = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`${showComments ? "max-w-[95vw]" : "max-w-5xl"} max-h-[90vh] overflow-hidden flex flex-col p-0 transition-all duration-300`}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-start gap-4">
              {market.icon && (
                <img
                  src={market.icon}
                  alt=""
                  className="w-16 h-16 object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <DialogTitle className="text-2xl font-mono font-bold mb-2">
                  {market.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mb-2">
                  {market.featured && (
                    <span className="text-xs font-mono bg-buy/20 text-buy px-2 py-1 border border-buy">
                      FEATURED
                    </span>
                  )}
                  {market.active && (
                    <span className="text-xs font-mono bg-neutral/20 text-neutral px-2 py-1 border border-neutral">
                      ACTIVE
                    </span>
                  )}
                  {market.closed && (
                    <span className="text-xs font-mono bg-muted-foreground/20 text-muted-foreground px-2 py-1 border border-muted-foreground">
                      CLOSED
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Market Focus Button */}
                <Link
                  href="/dashboard?tab=main&subtab=marketfocus"
                  onClick={() => {
                    // Set the selected market in the store
                    if (normalizedMarket && market) {
                      const selectedState = toSelectedMarketState(
                        normalizedMarket,
                        market,
                      );
                      setGlobalSelectedMarket(selectedState);
                    }
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border font-mono text-sm transition-colors bg-card border-border hover:bg-muted"
                >
                  <Activity className="w-4 h-4" />
                  <span>MARKET FOCUS</span>
                </Link>
                {/* Comments Toggle Button */}
                <button
                  onClick={() => {
                    setShowComments(!showComments);
                    if (!showComments && comments.length === 0) {
                      fetchComments();
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 border font-mono text-sm transition-all duration-300 ${
                    showComments
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{showComments ? "HIDE" : "SHOW"} COMMENTS</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Compact mode indicator */}
          {showComments && (
            <div className="px-6 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2 text-xs font-mono text-primary animate-in slide-in-from-top duration-300">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>
                Compact view enabled • Click section headers to expand/collapse
              </span>
            </div>
          )}

          <div className="flex-1 min-h-0 flex">
            {/* Main Content - Scrollable - Fixed Width */}
            <ScrollArea
              className={`flex-1 px-6 py-4 transition-all duration-300 ${
                showComments ? "border-r border-border/50" : ""
              }`}
              style={{ maxWidth: showComments ? "60%" : "100%" }}
            >
              <div className="space-y-6 pr-2">
                {/* Key Stats Grid - Responsive Layout */}
                <div
                  className={`grid gap-3 transition-all duration-300 ${
                    showComments ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                  }`}
                >
                  <div
                    className={`panel transition-all duration-300 ${
                      showComments ? "py-2" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${showComments ? "mb-1" : "mb-2"}`}
                    >
                      <BarChart3
                        className={`${showComments ? "w-3.5 h-3.5" : "w-4 h-4"} text-neutral`}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        24H VOLUME
                      </span>
                    </div>
                    <div
                      className={`font-mono font-bold transition-all duration-300 ${
                        showComments ? "text-lg" : "text-xl"
                      }`}
                    >
                      {formatNumber(market.volume)}
                    </div>
                  </div>

                  <div
                    className={`panel transition-all duration-300 ${
                      showComments ? "py-2" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${showComments ? "mb-1" : "mb-2"}`}
                    >
                      <DollarSign
                        className={`${showComments ? "w-3.5 h-3.5" : "w-4 h-4"} text-buy`}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        LIQUIDITY
                      </span>
                    </div>
                    <div
                      className={`font-mono font-bold transition-all duration-300 ${
                        showComments ? "text-lg" : "text-xl"
                      }`}
                    >
                      {formatNumber(market.liquidity)}
                    </div>
                  </div>

                  <div
                    className={`panel transition-all duration-300 ${
                      showComments ? "py-2" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${showComments ? "mb-1" : "mb-2"}`}
                    >
                      <Activity
                        className={`${showComments ? "w-3.5 h-3.5" : "w-4 h-4"} text-sell`}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        OPEN INTEREST
                      </span>
                    </div>
                    <div
                      className={`font-mono font-bold transition-all duration-300 ${
                        showComments ? "text-lg" : "text-xl"
                      }`}
                    >
                      {formatNumber(market.openInterest)}
                    </div>
                  </div>

                  <div
                    className={`panel transition-all duration-300 ${
                      showComments ? "py-2" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${showComments ? "mb-1" : "mb-2"}`}
                    >
                      <MessageSquare
                        className={`${showComments ? "w-3.5 h-3.5" : "w-4 h-4"} text-muted-foreground`}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        COMMENTS
                      </span>
                    </div>
                    <div
                      className={`font-mono font-bold transition-all duration-300 ${
                        showComments ? "text-lg" : "text-xl"
                      }`}
                    >
                      {market.commentCount}
                    </div>
                  </div>
                </div>

                {/* Description - Collapsible when comments shown */}
                {market.description && (
                  <div
                    className={`panel transition-all duration-300 ${
                      showComments && !collapsedSections.has("description")
                        ? "ring-1 ring-primary/20"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (showComments) {
                          const newSet = new Set(collapsedSections);
                          if (newSet.has("description")) {
                            newSet.delete("description");
                          } else {
                            newSet.add("description");
                          }
                          setCollapsedSections(newSet);
                        }
                      }}
                      className={`w-full text-left flex items-center justify-between ${showComments ? "cursor-pointer hover:text-primary transition-colors group" : "cursor-default"}`}
                    >
                      <h3 className="text-sm font-mono font-bold mb-3 flex items-center gap-2">
                        <TrendingUp
                          className={`w-4 h-4 transition-transform duration-300 ${showComments && !collapsedSections.has("description") ? "text-primary" : ""}`}
                        />
                        MARKET DESCRIPTION
                      </h3>
                      {showComments && (
                        <span
                          className={`text-xs font-mono transition-all duration-300 ${
                            collapsedSections.has("description")
                              ? "text-muted-foreground"
                              : "text-primary"
                          }`}
                        >
                          {collapsedSections.has("description")
                            ? "▼ Show"
                            : "▲ Hide"}
                        </span>
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        collapsedSections.has("description")
                          ? "max-h-0 opacity-0"
                          : "max-h-[500px] opacity-100"
                      }`}
                    >
                      <DialogDescription
                        className={`text-sm font-mono leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                          showComments
                            ? "line-clamp-4 hover:line-clamp-none cursor-pointer"
                            : ""
                        }`}
                      >
                        {market.description}
                      </DialogDescription>
                    </div>
                  </div>
                )}

                {/* Outcomes & Prices - Prefer multi-outcome board when available */}
                {normalizedMarkets.length ? (
                  eventSummary?.isMultiOutcome ? (
                    <div
                      className={`panel space-y-3 transition-all duration-300 ${
                        showComments
                          ? "sticky top-0 z-0 bg-card/95 backdrop-blur-sm shadow-md"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-mono font-bold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          EVENT OUTCOMES
                          {showComments && (
                            <span className="text-xs font-normal text-muted-foreground">
                              (Live)
                            </span>
                          )}
                        </h3>
                        <button
                          onClick={() => setOutcomesModalOpen(true)}
                          className="text-xs font-mono text-primary hover:text-primary/80 transition-colors underline"
                        >
                          View All →
                        </button>
                      </div>
                      <MultiOutcomeBoard
                        summary={eventSummary}
                        markets={normalizedMarkets}
                        onSelectOutcome={(marketId) => {
                          // Update local detail view
                          setLocalSelectedMarketId(marketId);

                          // Set global selected market for data filtering
                          const match = normalizedMarkets.find(
                            (m) => m.id === marketId,
                          );
                          if (match && market) {
                            const selectedState = toSelectedMarketState(
                              match,
                              market,
                            );
                            setGlobalSelectedMarket(selectedState);

                            // Update URL
                            if (match.slug) {
                              const params = new URLSearchParams(
                                searchParams?.toString() ?? "",
                              );
                              params.set("outcome", match.slug);
                              router.replace(`?${params.toString()}`);
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`panel space-y-3 transition-all duration-300 ${
                        showComments
                          ? "sticky top-0 z-10 bg-card/95 backdrop-blur-sm shadow-md"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-mono font-bold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          OUTCOMES & PRICES
                          {showComments && (
                            <span className="text-xs font-normal text-muted-foreground">
                              (Live)
                            </span>
                          )}
                        </h3>
                        {normalizedMarket &&
                          normalizedMarket.type !== "binary" &&
                          normalizedMarket.outcomes.length > 2 && (
                            <button
                              onClick={() => setOutcomesModalOpen(true)}
                              className="text-xs font-mono text-primary hover:text-primary/80 transition-colors underline"
                            >
                              {showComments
                                ? "All →"
                                : `View All ${normalizedMarket.outcomes.length} Outcomes →`}
                            </button>
                          )}
                      </div>
                      <div className="space-y-2">
                        {normalizedMarkets.map((marketOption) => (
                          <button
                            key={marketOption.id}
                            onClick={() => {
                              // Update local detail view
                              setLocalSelectedMarketId(marketOption.id);

                              // Set global selected market for data filtering
                              if (market) {
                                const selectedState = toSelectedMarketState(
                                  marketOption,
                                  market,
                                );
                                setGlobalSelectedMarket(selectedState);
                              }
                            }}
                            className={`text-left w-full transition-transform ${
                              normalizedMarket?.id === marketOption.id
                                ? "ring-1 ring-buy"
                                : "hover:ring-1 hover:ring-border"
                            }`}
                          >
                            {marketOption.primaryOutcome &&
                              (() => {
                                const primaryOutcomeDetails =
                                  marketOption.outcomes.find(
                                    (o) =>
                                      o.name ===
                                      marketOption.primaryOutcome?.name,
                                  );
                                if (!primaryOutcomeDetails) return null;

                                return (
                                  <div className="flex items-center justify-between px-3 py-1 border-b border-border/60 text-[11px] sm:text-xs font-mono bg-background/40">
                                    <span className="text-muted-foreground">
                                      {marketOption.primaryOutcome.name}
                                    </span>
                                    <span className="font-bold text-buy">
                                      {`$${primaryOutcomeDetails.price.toFixed(2)}`}
                                    </span>
                                  </div>
                                );
                              })()}
                            <MarketOutcomes
                              market={marketOption}
                              hidePrimary={true}
                            />
                            <div className="flex justify-between mt-1 text-[10px] font-mono text-muted-foreground">
                              <span>Condition: {marketOption.conditionId}</span>
                              <span>
                                YES: {marketOption.yesTokenId || "N/A"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="panel">
                    <h3 className="text-sm font-mono font-bold mb-3">
                      OUTCOMES & PRICES
                    </h3>
                    <div className="text-xs font-mono text-muted-foreground">
                      Data unavailable
                    </div>
                  </div>
                )}

                {/* Market Details */}
                {mainMarket && (
                  <div className="panel">
                    <h3 className="text-sm font-mono font-bold mb-3">
                      MARKET DETAILS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-neutral mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-muted-foreground">
                            Start Date
                          </div>
                          <div className="font-semibold">
                            {formatDate(market.startDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-sell mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-muted-foreground">End Date</div>
                          <div className="font-semibold">
                            {formatDate(market.endDate)}
                          </div>
                        </div>
                      </div>

                      {mainMarket?.lastTradePrice !== undefined && (
                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-buy mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-muted-foreground">
                              Last Trade Price
                            </div>
                            <div className="font-semibold">
                              {formatPrice(mainMarket.lastTradePrice)}
                            </div>
                          </div>
                        </div>
                      )}

                      {mainMarket?.bestBid !== undefined &&
                        mainMarket?.bestAsk !== undefined && (
                          <div className="flex items-start gap-2">
                            <BarChart3 className="w-4 h-4 text-neutral mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-muted-foreground">
                                Bid / Ask
                              </div>
                              <div className="font-semibold">
                                {formatPrice(mainMarket.bestBid)} /{" "}
                                {formatPrice(mainMarket.bestAsk)}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Tags - Collapsible when comments shown */}
                {market.tags && market.tags.length > 0 && (
                  <div
                    className={`panel transition-all duration-300 ${
                      showComments && collapsedSections.has("tags")
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (showComments) {
                          const newSet = new Set(collapsedSections);
                          if (newSet.has("tags")) {
                            newSet.delete("tags");
                          } else {
                            newSet.add("tags");
                          }
                          setCollapsedSections(newSet);
                        }
                      }}
                      className={`w-full text-left flex items-center justify-between mb-3 ${showComments ? "cursor-pointer hover:text-primary transition-colors group" : "cursor-default"}`}
                    >
                      <h3 className="text-sm font-mono font-bold">TAGS</h3>
                      {showComments && (
                        <span
                          className={`text-xs font-mono transition-colors ${
                            collapsedSections.has("tags")
                              ? "text-muted-foreground"
                              : "text-primary"
                          }`}
                        >
                          {collapsedSections.has("tags") ? "▼ Show" : "▲ Hide"}
                        </span>
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        collapsedSections.has("tags")
                          ? "max-h-0 opacity-0"
                          : "max-h-[300px] opacity-100"
                      }`}
                    >
                      <div className="flex flex-wrap gap-2">
                        {market.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className={`text-xs font-mono bg-card text-foreground border border-border hover:bg-muted transition-all duration-300 ${
                              showComments ? "px-2 py-1" : "px-3 py-1.5"
                            }`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution Source - Collapsible when comments shown */}
                {market.resolutionSource && (
                  <div
                    className={`panel transition-all duration-300 ${
                      showComments && collapsedSections.has("resolution")
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (showComments) {
                          const newSet = new Set(collapsedSections);
                          if (newSet.has("resolution")) {
                            newSet.delete("resolution");
                          } else {
                            newSet.add("resolution");
                          }
                          setCollapsedSections(newSet);
                        }
                      }}
                      className={`w-full text-left flex items-center justify-between mb-3 ${showComments ? "cursor-pointer hover:text-primary transition-colors group" : "cursor-default"}`}
                    >
                      <h3 className="text-sm font-mono font-bold">
                        RESOLUTION SOURCE
                      </h3>
                      {showComments && (
                        <span
                          className={`text-xs font-mono transition-colors ${
                            collapsedSections.has("resolution")
                              ? "text-muted-foreground"
                              : "text-primary"
                          }`}
                        >
                          {collapsedSections.has("resolution")
                            ? "▼ Show"
                            : "▲ Hide"}
                        </span>
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        collapsedSections.has("resolution")
                          ? "max-h-0 opacity-0"
                          : "max-h-[100px] opacity-100"
                      }`}
                    >
                      <a
                        href={market.resolutionSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-neutral hover:text-buy transition-colors flex items-center gap-2 break-all ${
                          showComments ? "text-xs" : "text-sm"
                        }`}
                      >
                        {market.resolutionSource}
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Market IDs - Collapsible when comments shown */}
                <div
                  className={`panel transition-all duration-300 ${
                    showComments && collapsedSections.has("technical")
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      if (showComments) {
                        const newSet = new Set(collapsedSections);
                        if (newSet.has("technical")) {
                          newSet.delete("technical");
                        } else {
                          newSet.add("technical");
                        }
                        setCollapsedSections(newSet);
                      }
                    }}
                    className={`w-full text-left flex items-center justify-between mb-3 ${showComments ? "cursor-pointer hover:text-primary transition-colors group" : "cursor-default"}`}
                  >
                    <h3 className="text-sm font-mono font-bold">
                      TECHNICAL INFO
                    </h3>
                    {showComments && (
                      <span
                        className={`text-xs font-mono transition-colors ${
                          collapsedSections.has("technical")
                            ? "text-muted-foreground"
                            : "text-primary"
                        }`}
                      >
                        {collapsedSections.has("technical")
                          ? "▼ Show"
                          : "▲ Hide"}
                      </span>
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      collapsedSections.has("technical")
                        ? "max-h-0 opacity-0"
                        : "max-h-[300px] opacity-100"
                    }`}
                  >
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[100px]">
                          Event ID:
                        </span>
                        <span className="break-all">{market.id}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-[100px]">
                          Slug:
                        </span>
                        <span className="break-all">{market.slug}</span>
                      </div>
                      {mainMarket && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[100px]">
                              Market ID:
                            </span>
                            <span className="break-all">{mainMarket.id}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[100px]">
                              Condition ID:
                            </span>
                            <span className="break-all">
                              {mainMarket.conditionId}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View on Polymarket */}
                <div className="panel bg-buy/5 border-buy">
                  <a
                    href={`https://polymarket.com/event/${market.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-mono font-bold text-buy mb-1">
                        VIEW ON POLYMARKET
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        Trade this market on Polymarket.com
                      </div>
                    </div>
                    <ExternalLink className="w-6 h-6 text-buy group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </ScrollArea>

            {/* Comments Panel - Scrollable - Expands to Right */}
            {showComments && (
              <div className="flex-1 flex flex-col bg-card border-l border-border">
                <div className="px-4 py-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-mono font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      COMMENTS ({comments.length}
                      {hasMoreComments ? "+" : ""})
                    </h3>
                  </div>

                  {/* Sort Options and Hide Replies Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCommentSortOrder("recent")}
                        className={`text-xs font-mono px-2 py-1 border transition-colors ${
                          commentSortOrder === "recent"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        RECENT
                      </button>
                      <button
                        onClick={() => setCommentSortOrder("oldest")}
                        className={`text-xs font-mono px-2 py-1 border transition-colors ${
                          commentSortOrder === "oldest"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        OLDEST
                      </button>
                      <button
                        onClick={() => setCommentSortOrder("likes")}
                        className={`text-xs font-mono px-2 py-1 border transition-colors ${
                          commentSortOrder === "likes"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        MOST LIKED
                      </button>
                    </div>

                    {/* Hide All Replies Toggle */}
                    <button
                      onClick={() => setHideAllReplies(!hideAllReplies)}
                      className={`text-xs font-mono px-2 py-1 border transition-colors flex items-center gap-1.5 ${
                        hideAllReplies
                          ? "bg-muted border-border text-muted-foreground"
                          : "bg-card border-border hover:bg-muted"
                      }`}
                      title={
                        hideAllReplies ? "Show all replies" : "Hide all replies"
                      }
                    >
                      <MessageSquare className="w-3 h-3" />
                      {hideAllReplies ? "SHOW REPLIES" : "HIDE REPLIES"}
                    </button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="px-4 py-4">
                    {loadingComments && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-neutral" />
                        <span className="ml-2 text-sm font-mono text-muted-foreground">
                          Loading comments...
                        </span>
                      </div>
                    )}

                    {commentsError && (
                      <div className="text-center py-12">
                        <div className="text-sm font-mono text-sell mb-2">
                          {commentsError}
                        </div>
                        <button
                          onClick={() => fetchComments(true)}
                          className="text-xs font-mono text-neutral hover:text-buy transition-colors underline"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {!loadingComments &&
                      !commentsError &&
                      comments.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                          No comments yet
                        </div>
                      )}

                    {!loadingComments &&
                      !commentsError &&
                      comments.length > 0 && (
                        <div className="space-y-4">
                          {organizedComments.topLevel.map((comment) =>
                            renderComment(comment),
                          )}

                          {/* Load More Button */}
                          {!loadingComments &&
                            !commentsError &&
                            comments.length > 0 &&
                            hasMoreComments && (
                              <div className="mt-6 flex justify-center">
                                <button
                                  onClick={loadMoreComments}
                                  disabled={loadingMoreComments}
                                  className="px-4 py-2 bg-card border border-border hover:bg-muted transition-colors font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {loadingMoreComments ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      LOADING...
                                    </>
                                  ) : (
                                    <>LOAD MORE COMMENTS</>
                                  )}
                                </button>
                              </div>
                            )}

                          {/* End of comments indicator */}
                          {!loadingComments &&
                            !commentsError &&
                            comments.length > 0 &&
                            !hasMoreComments && (
                              <div className="mt-6 text-center text-xs font-mono text-muted-foreground">
                                — End of comments —
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Positions Modal - Outside parent dialog */}
      <ProfilePositionsModal
        profile={selectedProfile}
        open={profileModalOpen}
        onOpenChange={(open) => {
          setProfileModalOpen(open);
          if (!open) {
            setSelectedProfile(null);
          }
        }}
        markets={normalizedMarkets}
      />

      {/* Market Outcomes Modal - Outside parent dialog */}
      <MarketOutcomesModal
        market={normalizedMarket}
        markets={normalizedMarkets}
        summary={eventSummary}
        open={outcomesModalOpen}
        onOpenChange={setOutcomesModalOpen}
      />
    </>
  );
}
