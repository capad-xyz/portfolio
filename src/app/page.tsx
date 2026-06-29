import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* placeholder next section — just enough to feel the scroll + material */}
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          The work, coming together.
        </h2>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Featured projects, the filterable grid, the timeline, and contact — every
          surface in glass, every transition intentional. This is just the hero, to
          lock the feel of the material first.
        </p>
      </section>
    </main>
  );
}
