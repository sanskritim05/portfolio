import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ScrapbookLayout } from "@/components/ScrapbookLayout";
import { projects, type CaseStudy } from "@/lib/portfolio";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} | Sanskriti Malakar` : "Project | Sanskriti Malakar";
    const description = p?.blurb ?? "A project by Sanskriti Malakar.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProjectPage,
});

function Section({
  title,
  children,
  id,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-14 scroll-mt-10"
    >
      <div className="rule-heading">
        <h2 className="font-display text-xl font-semibold text-[oklch(0.24_0.05_264)]">
          {title}
        </h2>
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function MetaCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-body text-[11px] uppercase tracking-[0.18em] text-[oklch(0.45_0.03_264)]">
        {label}
      </p>
      <div className="mt-2 font-body text-base text-[oklch(0.26_0.045_264)]">{children}</div>
    </div>
  );
}

function ProjectPage() {
  const { project: p } = Route.useLoaderData();
  const cs = p.caseStudy as CaseStudy;

  return (
    <ScrapbookLayout>
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-center font-display text-3xl font-semibold text-[oklch(0.24_0.05_264)] md:text-4xl">
            {p.title}
          </h1>
          <p className="mt-2 text-center font-display text-2xl font-semibold text-[oklch(0.24_0.05_264)] md:text-3xl">
            {p.subtitle}
          </p>
          <p className="mt-8 font-body text-base italic leading-relaxed text-[oklch(0.3_0.045_264)]">
            {p.blurb}
          </p>

          <p className="mt-8 font-body text-[11px] uppercase tracking-[0.18em] text-[oklch(0.45_0.03_264)]">
            short on time?
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="#final"
              className="inline-flex rounded-lg bg-[oklch(0.235_0.048_264)] px-4 py-2 font-body text-sm text-[oklch(0.97_0.012_235)] transition-opacity hover:opacity-90"
            >
              Jump to Final Product
            </a>
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-[oklch(0.24_0.05_264/0.3)] px-4 py-2 font-body text-sm text-[oklch(0.26_0.045_264)] transition-opacity hover:opacity-80"
              >
                View on GitHub
              </a>
            )}
          </div>

          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${p.title} live project`}
            className="relative mt-10 block aspect-[16/9] w-full overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]"
          >
            {p.image ? (
              <img
                src={p.image}
                alt={`${p.title} preview`}
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
            ) : null}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: `radial-gradient(circle at 75% 25%, ${p.accent} 0%, transparent 62%)`,
                opacity: 0.45,
              }}
            />
          </a>

          <div className="mt-10 grid gap-8 border-b border-[oklch(0.24_0.05_264/0.18)] pb-10 sm:grid-cols-2">
            <MetaCol label="tools">{cs.tools.join(", ")}</MetaCol>
            <MetaCol label="skills">
              <ul className="space-y-1">
                {cs.skills.map((s: string) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </MetaCol>
          </div>
        </motion.div>

        <Section title="Problem">
          <p className="font-body text-base leading-relaxed text-[oklch(0.3_0.045_264)]">
            {cs.problem}
          </p>
          <div className="mt-8 rounded-2xl bg-[oklch(0.95_0.008_235)] px-8 py-8 text-center">
            <p className="mt-0 font-display text-xl leading-relaxed text-[oklch(0.24_0.05_264)]">
              {cs.summary}
            </p>
          </div>
        </Section>

        <Section title="Process">
          <ol className="space-y-8">
            {cs.process.map((step: CaseStudy["process"][number], i: number) => (
              <li key={step.label} className="md:flex md:gap-8">
                <p className="font-script text-4xl text-[oklch(0.42_0.06_264)] md:w-16 md:shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[oklch(0.24_0.05_264)]">
                    {step.label}
                  </h3>
                  <p className="mt-2 font-body text-base leading-relaxed text-[oklch(0.3_0.045_264)]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Final Product" id="final">
          <p className="font-body text-base leading-relaxed text-[oklch(0.3_0.045_264)]">
            {cs.outcome}
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {cs.results.map((r: string) => (
              <li
                key={r}
                className="rounded-xl bg-[oklch(0.95_0.008_235)] p-5 font-body text-sm leading-relaxed text-[oklch(0.3_0.045_264)]"
              >
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            {p.tags.map((t: string) => (
              <span key={t} className="pill font-body">
                {t}
              </span>
            ))}
          </div>
        </Section>

        <div className="mt-16 border-t border-[oklch(0.24_0.05_264/0.18)] pt-8">
          <Link
            to="/"
            hash="my-work"
            className="inline-flex items-center gap-2 font-script text-3xl text-[oklch(0.28_0.05_264)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> see the rest of my work
          </Link>
        </div>
      </div>
    </ScrapbookLayout>
  );
}