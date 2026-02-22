import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function generateRoomId(userId1, userId2, projectId) {
  const sorted = [userId1, userId2].sort().join("_");
  return `${sorted}_${projectId}`;
}

// returns a human-readable relative time string (e.g. "5 minutes ago", "just now")
export function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  // fallback to formatted date for older messages
  return then.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// explicitly re-export in case the bundler cache missed inline export
export { timeAgo };

// default export with all utilities for convenience
const utils = {
  cn,
  formatCurrency,
  formatDate,
  generateRoomId,
  timeAgo,
};

export default utils;
