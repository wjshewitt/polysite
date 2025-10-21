import type { NormalizedMarket } from "@/types/markets";

const formatProbability = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

export const MarketOutcomes = ({
  market,
  hidePrimary = false,
  hideNoBars = false,
}: {
  market: NormalizedMarket;
  hidePrimary?: boolean;
  hideNoBars?: boolean;
}) => {
  if (!market.outcomes.length) {
    return (
      <div className="text-xs font-mono text-muted-foreground">
        Data unavailable
      </div>
    );
  }

  const topOutcome = market.outcomes[0];
  const maxProbability = Math.max(...market.outcomes.map((o) => o.probability));
  const primaryName = market.primaryOutcome?.name?.toLowerCase();
  const primaryYesToken = market.primaryOutcome?.yesTokenId;
  const primaryNoToken = market.primaryOutcome?.noTokenId;

  // Filter out primary outcome if hidePrimary is true
  // Filter out "No" outcomes if hideNoBars is true (for multi-outcome markets)
  const outcomesToShow = market.outcomes.filter((outcome) => {
    const normalizedName = outcome.name.toLowerCase();

    // Filter out the outcome that matches the primary outcome name if hidePrimary is true
    if (hidePrimary && normalizedName === primaryName) {
      return false;
    }

    // Filter out "No" outcomes if hideNoBars is true (for multi-outcome markets)
    if (hideNoBars) {
      const isNoByToken =
        primaryNoToken && outcome.tokenId
          ? outcome.tokenId === primaryNoToken
          : false;
      const isNo = isNoByToken || normalizedName === "no";

      if (isNo) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-1">
      {outcomesToShow.map((outcome, index) => {
        const probability = outcome.probability;
        const isTop = topOutcome?.name === outcome.name;
        const barWidth = maxProbability
          ? (probability / maxProbability) * 100
          : 0;

        // Determine if outcome represents the "Yes" side after normalization
        const normalizedName = outcome.name.toLowerCase();
        const isYesByToken =
          primaryYesToken && outcome.tokenId
            ? outcome.tokenId === primaryYesToken
            : false;
        const isNoByToken =
          primaryNoToken && outcome.tokenId
            ? outcome.tokenId === primaryNoToken
            : false;
        const isYes =
          isYesByToken ||
          normalizedName === "yes" ||
          (primaryName ? normalizedName === primaryName : false);
        const isNo =
          isNoByToken ||
          normalizedName === "no" ||
          (!isYes && !primaryName && normalizedName === "no");

        // Color based on Yes (green) or No (red) - only text and bars
        const textColor = isYes
          ? "text-buy"
          : isNo
            ? "text-sell"
            : "text-foreground";
        const barBgColor = isYes
          ? "bg-buy/20"
          : isNo
            ? "bg-sell/20"
            : "bg-muted";

        return (
          <div
            key={`${market.id}-${outcome.name}-${index}`}
            className="relative overflow-hidden border border-border bg-card px-2 py-1 flex items-center justify-between text-[11px] sm:text-xs"
          >
            <div
              className={`absolute inset-y-0 left-0 transition-all ${barBgColor}`}
              style={{ width: `${barWidth}%` }}
            />
            <span
              className={`relative z-10 font-mono truncate pr-4 ${textColor} font-semibold`}
            >
              {outcome.name}
            </span>
            <span className={`relative z-10 font-mono font-bold ${textColor}`}>
              {formatProbability(probability)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
