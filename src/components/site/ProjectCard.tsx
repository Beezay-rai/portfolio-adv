import Link from "next/link";
import { Cover } from "@/components/ui/Cover";
import { Tags } from "@/components/ui/Tags";
import type { Project } from "@/types/database";

export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className="card group overflow-hidden">
      <Link href={`/projects/${p.slug}`} className="block">
        <Cover src={p.cover_url} alt={p.title} className="aspect-video" />
        <div className="p-6 pt-4">
          <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors">{p.title}</h3>
          {p.summary && <p className="mt-2 text-ink-soft text-sm line-clamp-2">{p.summary}</p>}
        </div>
      </Link>
      <div className="px-6 pb-4 pt-0 border-t border-line/50">
        <Tags items={p.tech} />
      </div>
    </article>
  );
}
