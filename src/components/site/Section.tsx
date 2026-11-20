export function Section({ id, title, children, subtitle }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-8 px-6 pt-20 animate-fade-in">
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
