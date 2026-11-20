export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const formatMonth = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

export const dateRange = (start?: string | null, end?: string | null, current = false) =>
  [formatMonth(start), current ? "Present" : formatMonth(end)].filter(Boolean).join(" – ");

export const BUCKET = "portfolio";
