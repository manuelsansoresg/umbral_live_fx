interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="max-w-3xl" aria-labelledby="page-title">
      <p className="mb-5 text-xs font-medium tracking-[0.2em] text-white/60">UMBRAL LIVE FX</p>
      <h1 id="page-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <div className="my-7 h-0.5 w-10 bg-brand" aria-hidden="true" />
      <p className="max-w-xl text-base leading-8 text-white/70">{description}</p>
      <p className="mt-10 text-sm text-white/55">Sección en preparación.</p>
    </section>
  );
}
