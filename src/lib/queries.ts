import { createClient } from "./supabase/server";
import type { Education, Experience, Post, Project, SiteSettings } from "@/types/database";

export async function getExperiences() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*")
    .order("start_date", { ascending: false });
  return (data ?? []) as Experience[];
}

export async function getEducation() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("education")
    .select("*")
    .order("start_date", { ascending: false });
  return (data ?? []) as Education[];
}

export async function getProjects({ featuredOnly = false } = {}) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").eq("published", true);
  if (featuredOnly) query = query.eq("featured", true);
  const { data } = await query.order("sort_order", { ascending: true });
  return (data ?? []) as Project[];
}

export async function getPosts(limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data ?? []) as Post[];
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data as Project | null;
}

export const getProject = getProjectBySlug;

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data as Post | null;
}

export const getPost = getPostBySlug;

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").single();

  if (!data) {
    // Return defaults if no settings exist yet
    return {
      name: "Your Name",
      role: "Full-stack developer",
      tagline: "I build fast, accessible web products.",
      bio: "Write a short intro here. It appears on the home page hero.",
      email: "you@example.com",
      socials: [
        { label: "GitHub", href: "https://github.com/your-handle" },
        { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
      ],
    } as SiteSettings;
  }

  return {
    ...data,
    socials: data.socials || []
  } as SiteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("site_settings").select("*").single();

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({
        ...settings,
        socials: settings.socials || existing.socials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("site_settings").insert({
      ...settings,
      socials: settings.socials || [],
    });

    if (error) throw error;
  }
}