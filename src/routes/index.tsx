import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ScrapbookLayout } from "@/components/ScrapbookLayout";
import { useHeroSnap } from "@/hooks/useHeroSnap";
import { person, projects } from "@/lib/portfolio";
import heroBg from "@/assets/hero-scrapbook.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sanskriti Malakar" },
      {
        name: "description",
        content:
          "Sanskriti Malakar | AI/ML & full-stack engineering portfolio",
      },
      { property: "og:title", content: "Sanskriti Malakar" },
      {
        property: "og:description",
        content: "Sanskriti Malakar | AI/ML & full-stack engineering portfolio",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function ProjectCard({
  p,
  delay,
}: {
  p: (typeof projects)[number];
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay }}
      className="group"
    >
      <Link
        to="/projects/$slug"
        params={{ slug: p.slug }}
        data-cursor-label="VIEW PROJECT"
        className="lift-card block h-full rounded-[28px] bg-[oklch(0.99_0.004_235)] p-6"
        style={{ boxShadow: "0 30px 60px -35px oklch(0.1 0.04 264 / 0.9)" }}
      >
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
          style={{
            backgroundColor: p.image ? "oklch(1 0 0)" : "oklch(0.92 0.008 264)",
          }}
          aria-hidden
        >
          {p.image ? (
            <img
              src={p.image}
              alt={`${p.title} preview`}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${p.accent} 0%, transparent 62%)`,
              opacity: p.image ? 0.12 : 0.18,
            }}
          />
        </div>
        <h3 className="mt-6 font-display text-xl font-semibold text-[oklch(0.24_0.05_264)]">
          {p.title}
        </h3>
        <p className="mt-2 font-body text-sm italic leading-relaxed text-[oklch(0.32_0.04_264)]">
          {p.blurb}
        </p>
      </Link>
    </motion.article>
  );
}

function Home() {
  useHeroSnap("my-work");
  const odd = projects.length % 2 === 1;
  const grid = odd ? projects.slice(0, -1) : projects;
  const last = odd ? projects[projects.length - 1] : null;

  return (
    <ScrapbookLayout
      tone="navy"
      hideNav
      hero={
        <section className="relative flex h-svh items-center justify-center overflow-hidden">
          <div className="relative mx-auto h-full max-h-full w-auto max-w-full aspect-[2000/1545]">
            <img
              src={heroBg}
              alt=""
              aria-hidden
              width={2000}
              height={1545}
              className="block h-full w-full select-none object-contain object-center"
            />
            {/* Clickable hot spots over the ribbon + doily drawn in the artwork */}
            <Link
              to="/"
              data-scroll-to="my-work"
              aria-label="View my work"
              className="absolute left-[3%] top-0 z-30 h-[34%] w-[14%]"
            />
            <Link
              to="/about"
              aria-label="About me"
              className="absolute left-[14%] top-0 z-30 h-[32%] w-[30%] rounded-full"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[16%] left-[5.5%] z-20 max-w-[48%]"
            >
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-[oklch(0.97_0.012_235)] sm:text-4xl md:text-[3.4rem] md:leading-[1.05]">
                {person.name}
              </h1>
              <p className="mt-2 font-body text-base font-light text-[oklch(0.97_0.012_235)/0.9] sm:text-xl md:text-[1.65rem]">
                {person.nowLine.split("@")[0]}@{" "}
                <span className="font-semibold">
                  {person.nowLine.split("@")[1]?.trim()}
                </span>
              </p>
              <p className="mt-5 max-w-[36ch] font-body text-sm italic font-light leading-relaxed text-[oklch(0.97_0.012_235)/0.8] sm:text-base md:text-[1.15rem]">
                {person.tagline}
              </p>
            </motion.div>
          </div>
        </section>
      }
    >
      <section
        className="px-6 pb-4 pt-10 md:px-12 md:pt-14"
        aria-labelledby="work-heading"
      >
        <h2
          id="my-work"
          className="font-script text-5xl leading-[1.35] text-[oklch(0.97_0.012_235)/0.85] md:text-6xl"
        >
          <span id="work-heading">My Work</span>
        </h2>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {grid.map((p, i) => (
            <ProjectCard key={p.slug} p={p} delay={(i % 2) * 0.08} />
          ))}
        </div>

        {last && (
          <div className="mt-10 flex justify-center">
            <div className="w-full md:w-1/2">
              <ProjectCard p={last} delay={0} />
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <a
            href={person.github}
            target="_blank"
            rel="noreferrer"
            className="lift-stamp inline-flex rounded-lg border border-[oklch(0.97_0.012_235)/0.25] px-5 py-2.5 font-body text-sm text-[oklch(0.97_0.012_235)/0.85]"
          >
            More projects on GitHub
          </a>
        </div>
      </section>
    </ScrapbookLayout>
  );
}
