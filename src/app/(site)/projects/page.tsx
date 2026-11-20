import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Section } from "@/components/site/Section";
import { getProjects } from "@/lib/queries";

export const revalidate = 60;
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Section title="All projects" subtitle={`${projects.length} projects published`}>
        {projects.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {projects.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <p className="text-ink-soft text-lg mb-4">No projects published yet.</p>
            <p className="text-ink-faint text-sm">Check back soon for new work.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
