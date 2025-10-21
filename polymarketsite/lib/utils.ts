import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

export function formatLargeNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

export function formatTimestamp(timestamp: number): string {
  // Normalize epoch to milliseconds (supports seconds, ms, and microseconds)
  let ts = Number(timestamp);
  if (!Number.isFinite(ts)) return "-";

  // Heuristics:
  // - < 1e12 => seconds (1970–2001 as ms) so multiply by 1000
  // - > 1e14 => microseconds so divide by 1000
  if (ts > 1e14) {
    ts = Math.floor(ts / 1000);
  } else if (ts < 1e12) {
    ts = ts * 1000;
  }

  const date = new Date(ts);
  const now = Date.now();

  // If somehow in the future, clamp to "now"
  let diff = now - ts;
  if (diff < 0) diff = 0;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  // Older than a week: show compact absolute date-time
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercentage(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";
  const formatted = (num * 100).toFixed(2);
  return `${num >= 0 ? "+" : ""}${formatted}%`;
}

export function truncateAddress(address: string, chars: number = 8): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatVolume(volume: string | number): string {
  return `$${formatLargeNumber(volume)}`;
}
