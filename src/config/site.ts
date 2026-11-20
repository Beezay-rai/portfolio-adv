export const siteConfig = {
  name: "Your Name",
  role: "Full-stack developer",
  tagline: "I build fast, accessible web products.",
  bio: "Write a short intro here. It appears on the home page hero.",
  email: "you@example.com",
  socials: [
    { label: "GitHub", href: "https://github.com/your-handle" },
    { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
