import type { Metadata } from "next";
import { PostCard } from "@/components/site/PostCard";
import { Section } from "@/components/site/Section";
import { getPosts } from "@/lib/queries";

export const revalidate = 60;
export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Section title="Blog" subtitle={`${posts.length} articles published`}>
        {posts.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                <PostCard post={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <p className="text-ink-soft text-lg mb-4">No posts published yet.</p>
            <p className="text-ink-faint text-sm">Check back soon for new articles.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
