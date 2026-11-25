import Link from "next/link";
import { Section } from "@/components/site/Section";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Timeline } from "@/components/site/Timeline";
import { getSiteSettings } from "@/lib/queries";
import { getEducation, getExperiences, getPosts, getProjects } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [projects, experiences, education, posts, settings] = await Promise.all([
    getProjects({ featuredOnly: true }),
    getExperiences(),
    getEducation(),
    getPosts(3),
    getSiteSettings(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 animate-fade-in">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 animate-slide-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
            </span>
            {settings.role}
          </div>
          <h1 className="mt-2 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-ink animate-slide-up" style={{ animationDelay: '100ms' }}>
            {settings.name}
          </h1>
          <p className="mt-6 max-w-xl text-xl text-ink-soft animate-slide-up" style={{ animationDelay: '200ms' }}>{settings.tagline}</p>
          <p className="mt-4 max-w-xl text-ink-soft animate-slide-up" style={{ animationDelay: '300ms' }}>{settings.bio}</p>
          <div className="mt-10 flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Link href="/projects" className="btn">See my projects</Link>
            <a href={`mailto:${settings.email}`} className="btn-ghost">Email me</a>
            <Link href="/admin/login" className="btn-ghost">Login</Link>
          </div>
        </div>
      </section>

      {/* Selected Projects */}
      <Section
        title="Selected projects"
        subtitle="A few highlights from my recent work"
      >
        {projects.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {projects.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-ink-soft">No featured projects yet.</p>
            <Link href="/projects" className="mt-4 inline-block text-accent hover:underline">Browse all projects</Link>
          </div>
        )}
      </Section>

      {/* Work Experience */}
      <Section
        id="experience"
        title="Work experience"
        subtitle="My professional journey"
      >
        <Timeline items={experiences.map((e) => ({
          id: e.id,
          title: e.role,
          subtitle: [e.company, e.location].filter(Boolean).join(", "),
          start: e.start_date,
          end: e.end_date,
          current: e.is_current,
          description: e.description,
          tags: e.tech,
          logo: e.logo_url,
        }))} />
      </Section>

      {/* Education */}
      <Section
        id="education"
        title="Education"
        subtitle="Academic background"
      >
        <Timeline items={education.map((e) => ({
          id: e.id,
          title: [e.degree, e.field].filter(Boolean).join(", "),
          subtitle: e.institution,
          start: e.start_date,
          end: e.end_date,
          description: e.description,
          logo: e.logo_url,
        }))} />
      </Section>

      {/* Latest Writing */}
      {posts.length > 0 && (
        <Section
          title="Latest writing"
          subtitle="Thoughts, tutorials, and insights"
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                <PostCard post={p} />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link href="/blog" className="btn-secondary">Read all posts</Link>
          </div>
        </Section>
      )}
    </>
  );
}
