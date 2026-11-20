import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cover } from "@/components/ui/Cover";
import { Markdown } from "@/components/ui/Markdown";
import { Tags } from "@/components/ui/Tags";
import { getProject } from "@/lib/queries";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title, description: p.summary ?? undefined, openGraph: { images: p.cover_url ? [p.cover_url] : [] } } : {};
}

export default async function ProjectPage({ params }: Props) {
  const p = await getProject((await params).slug);
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 pt-16 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-ink">{p.title}</h1>
        {p.summary && <p className="mt-4 text-xl text-ink-soft">{p.summary}</p>}
        <div className="mt-6"><Tags items={p.tech} /></div>
        <div className="mt-8 flex flex-wrap gap-3">
          {p.live_url && <a href={p.live_url} className="btn" target="_blank" rel="noopener noreferrer">Visit site</a>}
          {p.repo_url && <a href={p.repo_url} className="btn-ghost" target="_blank" rel="noopener noreferrer">View code</a>}
        </div>
      </header>

      <div className="mt-12 animate-slide-up"><Cover src={p.cover_url} alt={p.title} priority className="aspect-video" /></div>

      {p.description && (
        <div className="mt-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Markdown>{p.description}</Markdown>
        </div>
      )}
    </article>
  );
}
