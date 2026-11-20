export function Tags({ items, variant = "default" }: { items: string[]; variant?: "default" | "outline" }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li
          key={t}
          className={
            variant === "outline"
              ? "rounded border border-line px-2 py-0.5 text-xs text-ink-soft hover:border-ink transition-colors"
              : "rounded bg-ink/5 px-2 py-0.5 text-xs text-ink-soft"
          }
        >
          {t}
        </li>
      ))}
    </ul>
  );
}
