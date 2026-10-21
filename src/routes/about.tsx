import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { ScrapbookLayout } from "@/components/ScrapbookLayout";
import {
  experience,
  education,
  publications,
  certificates,
} from "@/lib/portfolio";
import foodThai from "@/assets/food-thai.jpg";
import skyDockside from "@/assets/sky-dockside.png";
import foodPizza from "@/assets/food-pizza.jpg";
import skyCampus from "@/assets/sky-campus.png";
import foodLeonsBagels from "@/assets/food-leons-bagels.jpg";
import skyQueensboro from "@/assets/sky-queensboro.png";
import foodDumplings from "@/assets/food-dumplings.jpg";
import skyRiverSunset from "@/assets/sky-river-sunset.jpg";
import foodLeafDumplings from "@/assets/food-leaf-dumplings.jpg";

const polaroids = [
  { src: foodThai, caption: "thai night" },
  { src: skyDockside, caption: "dockside sunset" },
  { src: foodPizza, caption: "pizza, always" },
  { src: skyCampus, caption: "golden hour on campus" },
  { src: foodLeonsBagels, caption: "leon's bagels, nyc" },
  { src: skyQueensboro, caption: "queensboro at dusk" },
  { src: foodDumplings, caption: "dumplings & noodles" },
  { src: skyRiverSunset, caption: "sunset over the river" },
  { src: foodLeafDumplings, caption: "leaf-pleated dumplings" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Sanskriti Malakar" },
      {
        name: "description",
        content:
          "Sanskriti Malakar | AI/ML & full-stack engineering portfolio. Experience, publications, workshops and certificates.",
      },
      { property: "og:title", content: "About Sanskriti Malakar" },
      {
        property: "og:description",
        content: "Experience, education, publications, workshops and certificates.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function Block({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16"
    >
      <div className="rule-heading">
        {/* Padding keeps script swashes (e.g. the "p" lead-in) inside the box so they aren't clipped while animating */}
        <h2 className="-ml-3 pl-3 font-script text-4xl leading-[1.4] text-[oklch(0.24_0.05_264)]">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-8">{children}</div>
    </motion.section>
  );
}

function ExperienceCard({ e }: { e: (typeof experience)[number] }) {
  const [open, setOpen] = useState(false);
  const expandable = Boolean(e.note);
  return (
    <div
      className="w-[320px] shrink-0 self-start rounded-xl border border-[oklch(0.24_0.05_264/0.2)] px-5 py-4"
      onMouseEnter={() => expandable && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-display text-base font-semibold text-[oklch(0.24_0.05_264)]">
            {e.company}
          </h3>
          <p className="font-body text-sm italic text-[oklch(0.4_0.04_264)]">{e.period}</p>
        </div>
        <p className="mt-1 font-body text-base text-[oklch(0.3_0.045_264)]">{e.role}</p>
      </button>
      {expandable && open && (
        <div className="mt-3">
          <p className="font-body text-sm leading-relaxed text-[oklch(0.32_0.04_264)]">
            {e.note}
            {"link" in e && e.link && (
              <>
                {" "}
                <a
                  href={e.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {e.link.replace("https://", "")}
                </a>
              </>
            )}
          </p>
          {e.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <span key={t} className="pill font-body">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Certificate = (typeof certificates)[number];

function CertificateLightbox({
  cert,
  onClose,
}: {
  cert: Certificate | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!cert) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [cert, onClose]);

  // Portal to <body> so the page's stacking contexts (nav, footer) can't sit above it
  return createPortal(
    <AnimatePresence>
      {cert && (
        <motion.div
          key="cert-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={cert.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-4 bg-[oklch(0.18_0.04_264/0.85)] p-4 backdrop-blur-sm md:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate"
            autoFocus
            className="absolute right-4 top-4 rounded-full bg-[oklch(0.97_0.012_235/0.12)] p-2 text-[oklch(0.97_0.012_235)] transition-colors hover:bg-[oklch(0.97_0.012_235/0.25)] md:right-8 md:top-8"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.img
            layoutId={`cert-${cert.title}`}
            src={cert.image}
            alt={cert.title}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="max-h-[80vh] w-auto max-w-full rounded-xl bg-white object-contain shadow-2xl"
          />
          <p className="text-center font-body text-sm text-[oklch(0.97_0.012_235/0.85)]">
            {cert.title} · {cert.date}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function About() {
  const [openCert, setOpenCert] = useState<Certificate | null>(null);
  const closeCert = useCallback(() => setOpenCert(null), []);

  return (
    <ScrapbookLayout>
      <CertificateLightbox cert={openCert} onClose={closeCert} />
      <div className="pb-4 pl-10 pr-6 pt-10 md:pl-16 md:pr-12">
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-script text-4xl leading-[1.4] text-[oklch(0.24_0.05_264)] md:text-5xl">
              About Me
            </h1>
            <p className="mt-6 font-body text-lg leading-relaxed text-[oklch(0.28_0.045_264)]">
              I’m a graduate student at Cornell Tech pursuing dual master’s degrees in Applied
              Information Science and Information Systems, with a concentration in Health Tech.
              Before Cornell, I studied Computer Science and Cognitive Science at Rutgers
              University, where I graduated magna cum laude.
            </p>
            <p className="mt-6 font-body text-lg leading-relaxed text-[oklch(0.28_0.045_264)]">
              My work sits at the intersection of research and engineering. I’m drawn to
              problems where building an accurate model matters just as much as designing an
              interface that makes its results understandable and useful. Recently, I’ve been
              developing agentic AI pipelines and document-grounded RAG tools. I’ve also worked
              on NLP for consumer insights and backend APIs for live products.
            </p>
            <p className="mt-6 font-body text-lg leading-relaxed text-[oklch(0.28_0.045_264)]">
              Outside of building, I enjoy watching sitcoms and making coffee. I’m also
              always looking for a new restaurant
              to try or a good excuse to stop and photograph the sky.
            </p>

            <Link
              to="/"
              hash="my-work"
              className="mt-7 inline-flex rounded-lg bg-[oklch(0.235_0.048_264)] px-4 py-2 font-body text-sm text-[oklch(0.97_0.012_235)] transition-opacity hover:opacity-90"
            >
              Check out my projects!
            </Link>
          </motion.div>

        <Block title="work experience">
          <div className="flex items-start gap-5 overflow-x-auto pb-3">
            {experience.map((e) => (
              <ExperienceCard key={e.company + e.period} e={e} />
            ))}
          </div>
        </Block>

        <Block title="education">
          <div className="grid gap-6 md:grid-cols-2">
            {education.map((ed) => (
              <article
                key={ed.school}
                className="rounded-2xl bg-[oklch(0.95_0.008_235)] p-5"
              >
                <h3 className="font-display text-base font-semibold text-[oklch(0.24_0.05_264)]">
                  {ed.school}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[oklch(0.3_0.045_264)]">
                  {ed.detail}
                </p>
                <p className="mt-2 font-body text-sm italic text-[oklch(0.4_0.04_264)]">
                  {ed.period}
                </p>
              </article>
            ))}
          </div>
        </Block>

        <Block title="publication and workshops">
          <div className="grid gap-8 md:grid-cols-2">
            {publications.map((pub) => (
              <article key={pub.title} className="rounded-2xl bg-[oklch(0.95_0.008_235)] p-5">
                <h3 className="font-display text-base font-semibold text-[oklch(0.24_0.05_264)]">
                  {pub.title}
                </h3>
                <p className="mt-2 font-body text-sm italic text-[oklch(0.4_0.04_264)]">
                  {pub.date}
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-[oklch(0.3_0.045_264)]">
                  {pub.body}
                </p>
                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-body text-sm text-[oklch(0.26_0.045_264)] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> {pub.linkLabel}
                  </a>
                )}
              </article>
            ))}
          </div>
        </Block>

        <Block title="certificates">
          <div className="flex gap-5 overflow-x-auto pb-3">
            {certificates.map((c) => (
              <article
                key={c.title}
                className="flex h-[360px] w-[260px] shrink-0 flex-col rounded-2xl border border-[oklch(0.24_0.05_264/0.14)] p-4"
              >
                <button
                  type="button"
                  onClick={() => setOpenCert(c)}
                  aria-label={`Enlarge ${c.title} certificate`}
                  className="group/cert h-[180px] w-full shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-[oklch(0.95_0.008_235)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.24_0.05_264)]"
                >
                  <motion.img
                    layoutId={`cert-${c.title}`}
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-contain object-center transition-transform duration-300 group-hover/cert:scale-105"
                  />
                </button>
                <div className="pt-4">
                  <h3 className="font-display text-base font-semibold leading-snug text-[oklch(0.24_0.05_264)]">
                    {c.title}
                  </h3>
                  <p className="mt-1 font-body text-sm italic text-[oklch(0.4_0.04_264)]">
                    {c.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Block>

        <Block title="things I like">
          <p className="mb-6 font-body text-sm italic text-[oklch(0.4_0.04_264)]">
            plates I've loved &amp; skies I've stopped for
          </p>
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2">
            {polaroids.map((photo, i) => (
              <figure
                key={i}
                className="shrink-0 rounded-md bg-white p-3 shadow-[0_6px_20px_rgba(18,29,52,0.18)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="h-52 w-52 overflow-hidden rounded-sm md:h-60 md:w-60">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    loading="lazy"
                    className={`h-full w-full object-cover ${i === 1 ? "object-[center_75%]" : "object-center"}`}
                  />
                </div>
              </figure>
            ))}
          </div>
        </Block>
      </div>
    </ScrapbookLayout>
  );
}
