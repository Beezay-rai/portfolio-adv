import { getSiteSettings } from "@/lib/queries";
import { SOCIAL_PLATFORMS } from "@/config/socials";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer id="contact" className="mt-24 border-t border-line/50 bg-white/50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-ink-soft">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a href={`mailto:${settings.email}`} className="font-medium text-ink hover:text-accent transition-colors">
            {settings.email}
          </a>
          <ul className="flex items-center gap-4">
            {settings.socials.map((s) => {
              const platform = SOCIAL_PLATFORMS.find(
                (p) => p.label.toLowerCase() === s.label.toLowerCase()
              );
              return (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-paper border border-line/60 text-ink-soft hover:text-ink hover:border-ink/40 hover:shadow-sm transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                  >
                    {platform ? (
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d={platform.iconSvg} />
                      </svg>
                    ) : (
                      <span className="text-xs font-semibold">{s.label.slice(0, 2).toUpperCase()}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-ink-faint text-xs">
          &copy; {new Date().getFullYear()} {settings.name}. Built with Next.js & Supabase.
        </p>
      </div>
    </footer>
  );
}
