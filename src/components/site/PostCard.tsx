import Link from "next/link";
import { Cover } from "@/components/ui/Cover";
import { formatDate } from "@/lib/utils";
import { Tags } from "@/components/ui/Tags";
import type { Post } from "@/types/database";

export function PostCard({ post: p }: { post: Post }) {
  return (
    <article className="card group overflow-hidden">
      <Link href={`/blog/${p.slug}`} className="block">
        <Cover src={p.cover_url} alt={p.title} className="aspect-video" />
        <div className="p-6 pt-4">
          <p className="text-sm text-ink-faint mb-2">{formatDate(p.published_at)}</p>
          <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors">{p.title}</h3>
        </div>
      </Link>
      <div className="px-6 pb-4">
        {p.excerpt && <p className="text-ink-soft text-sm line-clamp-2">{p.excerpt}</p>}
        {p.tags && p.tags.length > 0 && <div className="mt-3"><Tags items={p.tags} /></div>}
      </div>
    </article>
  );
}
