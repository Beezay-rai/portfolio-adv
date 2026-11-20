import Image from "next/image";
import { Markdown } from "@/components/ui/Markdown";
import { Tags } from "@/components/ui/Tags";
import { dateRange } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  start: string | null;
  end: string | null;
  current?: boolean;
  description: string | null;
  tags?: string[];
  logo: string | null;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) return <p className="text-ink-soft text-center py-8">Nothing here yet.</p>;
  return (
    <ol className="space-y-6 relative pl-8">
      {/* Vertical line centered along the dot placement */}
      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-line/80 rounded-full" aria-hidden />

      {items.map((i, index) => (
        <li key={i.id} className="relative animate-slide-up group" style={{ animationDelay: `${index * 75}ms` }}>
          {/* Timeline dot centered directly on the vertical line */}
          <div className="absolute -left-8 top-6 z-10 flex items-center justify-center w-8 h-8">
            <span className="h-4 w-4 rounded-full bg-accent border-[3px] border-paper shadow-sm group-hover:scale-125 transition-transform duration-200" aria-hidden />
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Logo */}
            {i.logo && (
              <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-white border border-line/80 shadow-soft p-2 flex items-center justify-center group-hover:border-accent/40 group-hover:shadow-card transition-all duration-200">
                <Image src={i.logo} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-contain" />
              </div>
            )}

            {/* Content card */}
            <div className="min-w-0 flex-1 w-full rounded-2xl border border-line/60 bg-white/80 backdrop-blur-sm p-5 shadow-soft group-hover:border-line group-hover:shadow-card transition-all duration-300">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors duration-200">{i.title}</h3>
                  <p className="text-ink-soft font-medium text-sm mt-0.5">{i.subtitle}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-paper text-ink-soft border border-line/60 whitespace-nowrap">
                  {dateRange(i.start, i.end, i.current)}
                </span>
              </div>
              {i.description && <Markdown className="mt-3.5 text-sm text-ink-soft leading-relaxed">{i.description}</Markdown>}
              {i.tags && i.tags.length > 0 && <div className="mt-4 pt-3 border-t border-line/40"><Tags items={i.tags} /></div>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
