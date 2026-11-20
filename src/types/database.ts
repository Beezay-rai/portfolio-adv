interface Timestamps {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Experience extends Timestamps {
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  tech: string[];
  logo_url: string | null;
}

export interface Education extends Timestamps {
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  logo_url: string | null;
}

export interface Project extends Timestamps {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  tech: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export interface Post extends Timestamps {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
}

export interface SiteSettings extends Timestamps {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  email: string;
  socials: Array<{ label: string; href: string }>;
  url: string;
}

export type Row = Record<string, unknown> & { id: string };
interface Timestamps {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Experience extends Timestamps {
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  tech: string[];
  logo_url: string | null;
}

export interface Education extends Timestamps {
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  logo_url: string | null;
}

export interface Project extends Timestamps {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  tech: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export interface Post extends Timestamps {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
}


export interface AnimeEntry {
  id: string;
  title: string;
  anilist_id: number | null;
  cover_url: string | null;
  last_episode: number;
  total_episodes: number | null;
  status: "watching" | "completed" | "paused" | "dropped" | "planned";
  last_screenshot_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
