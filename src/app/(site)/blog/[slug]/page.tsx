import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cover } from "@/components/ui/Cover";
import { Markdown } from "@/components/ui/Markdown";
import { Tags } from "@/components/ui/Tags";
import { getPost } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt ?? undefined, openGraph: { images: p.cover_url ? [p.cover_url] : [] } } : {};
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 pt-16 animate-fade-in">
      <header className="mb-10">
        <p className="text-sm text-ink-faint">{formatDate(p.published_at)}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold leading-tight text-ink">{p.title}</h1>
        <div className="mt-6"><Tags items={p.tags} /></div>
      </header>

      {p.cover_url && (
        <div className="mt-10 animate-slide-up"><Cover src={p.cover_url} alt={p.title} priority className="aspect-video" /></div>
      )}

      {p.content && (
        <div className="mt-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Markdown className="prose-lg">{p.content}</Markdown>
        </div>
      )}
    </article>
  );
}
