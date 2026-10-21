import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
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
  tilt,
}: {
  p: (typeof projects)[number];
  delay: number;
  tilt: number;
}) {
  const reduceMotion = useReducedMotion();
  // Pointer position over the card, normalised to -0.5..0.5 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), spring);
  const glareX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, oklch(1 0 0 / 0.35) 0%, transparent 55%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, rotate: tilt, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 70, damping: 14, delay }}
      className="group h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        whileHover={reduceMotion ? undefined : { y: -6 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="h-full [transform-style:preserve-3d]"
      >
        <Link
          to="/projects/$slug"
          params={{ slug: p.slug }}
          className="project-card relative block h-full overflow-hidden rounded-[28px] bg-[oklch(0.99_0.004_235)] p-6"
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
                className="project-card__img absolute inset-0 h-full w-full object-contain object-center"
              />
            ) : null}
            <div
              className="project-card__accent absolute inset-0"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${p.accent} 0%, transparent 62%)`,
                opacity: p.image ? 0.12 : 0.18,
              }}
            />
            <span className="project-card__shine" />
          </div>
          <h3 className="mt-6 font-display text-xl font-semibold text-[oklch(0.24_0.05_264)]">
            <span className="project-card__title">{p.title}</span>
          </h3>
          <p className="mt-2 font-body text-sm italic leading-relaxed text-[oklch(0.32_0.04_264)]">
            {p.blurb}
          </p>
          <span className="project-card__cta mt-4 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[oklch(0.42_0.1_250)]">
            View project
            <ArrowRight className="project-card__arrow h-4 w-4" aria-hidden />
          </span>
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: glare }}
            />
          )}
        </Link>
      </motion.div>
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
            <ProjectCard
              key={p.slug}
              p={p}
              delay={(i % 2) * 0.08}
              tilt={i % 2 === 0 ? -2.5 : 2.5}
            />
          ))}
        </div>

        {last && (
          <div className="mt-10 flex justify-center">
            <div className="w-full md:w-1/2">
              <ProjectCard p={last} delay={0} tilt={-1.5} />
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
