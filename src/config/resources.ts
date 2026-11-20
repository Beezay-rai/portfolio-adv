/**
 * Single source of truth for the CMS. Add a field here and the admin form,
 * list view and save action pick it up automatically (after adding the column in SQL).
 */
export type FieldType =
  | "text" | "textarea" | "markdown" | "date" | "checkbox"
  | "image" | "tags" | "number" | "url";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
}

export interface Resource {
  key: string;
  table: string;
  label: string;
  singular: string;
  fields: Field[];
  columns: string[];
  orderBy: string;
  ascending?: boolean;
  slugFrom?: string;
}

export const resources: Resource[] = [
  {
    key: "experience",
    table: "experiences",
    label: "Work experience",
    singular: "experience",
    orderBy: "start_date",
    columns: ["role", "company", "start_date", "is_current"],
    fields: [
      { name: "role", label: "Role", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", help: "Leave empty if current." },
      { name: "is_current", label: "I work here now", type: "checkbox" },
      { name: "description", label: "What you did", type: "markdown" },
      { name: "tech", label: "Tech used", type: "tags", help: "Comma separated." },
      { name: "logo_url", label: "Company logo", type: "image" },
    ],
  },
  {
    key: "education",
    table: "education",
    label: "Education",
    singular: "education entry",
    orderBy: "start_date",
    columns: ["degree", "institution", "start_date", "end_date"],
    fields: [
      { name: "degree", label: "Degree", type: "text", required: true },
      { name: "field", label: "Field of study", type: "text" },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "description", label: "Notes", type: "markdown" },
      { name: "logo_url", label: "Logo", type: "image" },
    ],
  },
  {
    key: "projects",
    table: "projects",
    label: "Projects",
    singular: "project",
    orderBy: "sort_order",
    ascending: true,
    slugFrom: "title",
    columns: ["title", "featured", "published", "sort_order"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Auto-generated from the title if empty." },
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "description", label: "Case study", type: "markdown" },
      { name: "cover_url", label: "Cover image", type: "image" },
      { name: "tech", label: "Tech stack", type: "tags", help: "Comma separated." },
      { name: "live_url", label: "Live URL", type: "url" },
      { name: "repo_url", label: "Repository URL", type: "url" },
      { name: "featured", label: "Show on home page", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "sort_order", label: "Sort order", type: "number", help: "Lower numbers come first." },
    ],
  },
  {
    key: "posts",
    table: "posts",
    label: "Blog posts",
    singular: "post",
    orderBy: "created_at",
    slugFrom: "title",
    columns: ["title", "published", "published_at"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Auto-generated from the title if empty." },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "cover_url", label: "Cover image", type: "image" },
      { name: "content", label: "Content", type: "markdown" },
      { name: "tags", label: "Tags", type: "tags", help: "Comma separated." },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
];

export const getResource = (key: string) => resources.find((r) => r.key === key);
