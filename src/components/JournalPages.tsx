import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Award,
  MapPin,
  X,
  type LucideIcon,
} from "lucide-react";
import paperAirplane from "../assets/paper-airplane.png";

// ---------- DATA ----------
const skills = {
  "Languages I think in": ["Python", "Java", "SQL", "C++", "R", "JavaScript", "TypeScript"],
  "AI / ML I reach for": [
    "PyTorch",
    "TensorFlow",
    "Scikit-learn",
    "Hugging Face",
    "LangChain",
    "LangGraph",
    "ChromaDB",
    "Strands Agents",
  ],
  "Building blocks": ["React", "FastAPI", "NumPy", "Pandas", "REST APIs", "SQL"],
  "Cloud & tooling": ["AWS SageMaker", "AWS Lambda", "AWS EC2", "Docker", "Git", "Postman"],
  "Data & AI methods": [
    "RAG",
    "NLP",
    "Computer Vision",
    "ETL",
    "Feature Engineering",
    "Agentic AI",
  ],
};

const experience = [
  {
    role: "Software Engineering Intern",
    company: "Universal Selfcare",
    year: "Feb 2026 to present",
    note: "Working across the full stack on a live healthcare portal. Built Go services that route patient-reported outcomes into alert systems, stabilized a large React/TypeScript codebase after production-blocking merge failures, and designed subscription-cycle scheduling logic for time-locked patient content.",
    tags: ["React", "TypeScript", "Go", "Google Cloud"],
  },
  {
    role: "Research Assistant, Computer Vision",
    company: "Aresty Center, Rutgers",
    year: "Sept 2025 to present",
    note: "Building a low-cost alternative to lab-grade water testing. The pipeline estimates chlorine concentration from smartphone photos using preprocessing, augmentation, and engineered color features across RGB, HSV, and LAB, with emphasis on generalization across lighting and devices.",
    tags: ["Python", "Computer Vision", "Scikit-learn", "Feature Engineering"],
  },
  {
    role: "Learning Assistant",
    company: "Rutgers University",
    year: "Aug 2025 to present",
    note: "Led weekly recitation sections for Data Structures and Calculus 1, helping students build the reasoning to solve problems themselves. Collaborated with faculty on instructional materials and graded weekly work across both courses.",
  },
  {
    role: "AI/ML Fellow",
    company: "Break Through Tech · Cornell Tech",
    year: "Feb 2025 to present",
    note: "Selected from over 3,000 applicants for a fellowship focused on applied AI and underrepresented voices in tech. Built hands-on ML projects, worked with industry mentors, and completed Cornell-backed machine-learning certification.",
  },
  {
    role: "AI Fellow",
    company: "Nestlé Americas",
    year: "Aug to Dec 2025",
    note: "Worked on a large-scale NLP project using Amazon Grocery reviews to surface emerging flavor trends. Built sentiment baselines with VADER and Logistic Regression, fine-tuned RoBERTa, and designed a trend score combining growth velocity, popularity, and sentiment momentum.",
    tags: ["Python", "RoBERTa", "TF-IDF", "NLP", "Trend Analysis"],
  },
  {
    role: "Extern",
    company: "Rutgers Food Innovation Center",
    year: "Jan to May 2025",
    note: "Rebuilt parts of the application review process with a Python web app for lead scoring, Microsoft Teams and HubSpot API integrations for scheduling and tracking, and a cleaner client-facing intake frontend.",
    tags: ["Python", "REST", "SQL", "HubSpot API", "Microsoft Teams API"],
  },
];

const timelineExperience = [...experience].reverse();

const projects = [
  {
    title: "Patient Intake Summarization Pipeline",
    desc: "Multi-agent system that reads raw patient intakes, flags incomplete submissions before summarization, and produces structured summaries ready for review.",
    tags: ["Python", "Strands Agents", "Ollama", "Multi-agent systems"],
    href: "https://github.com/sanskritim05/patient-intake-summarization",
  },
  {
    title: "Medical Literature Research Agent",
    desc: "Ask a clinical question and get a sourced answer from PubMed and ClinicalTrials.gov, with inline citations, confidence scores, follow-ups, comparisons, and PDF export.",
    tags: ["Python", "LangGraph", "FastAPI", "Groq", "NLP", "Agentic AI"],
    href: "https://github.com/sanskritim05/medical-literature-research-agent",
  },
  {
    title: "Real Estate RAG Assistant",
    desc: "Upload a real estate document, ask questions in plain English, and get grounded answers with exact page citations through a FastAPI, ChromaDB, and React stack.",
    tags: ["Python", "LangChain", "ChromaDB", "FastAPI", "React", "RAG"],
    href: "https://github.com/sanskritim05/real-estate-rag-assistant",
  },
  {
    title: "IntelSwarm",
    desc: "Enter a company name and get a structured intelligence report across product, hiring, funding, news, and culture from parallel specialist agents.",
    tags: ["Python", "FastAPI", "Strands Agents", "Ollama", "React", "Multi-agent systems"],
    href: "https://github.com/sanskritim05/IntelSwarm",
  },
];

const planeLayout = [
  { top: "0px", left: "5%", rotate: -10, flip: false },
  { top: "118px", left: "56%", rotate: 8, flip: true },
  { top: "265px", left: "8%", rotate: 16, flip: false },
  { top: "400px", left: "58%", rotate: -8, flip: false },
];

const planeFlyIn = [
  { x: -180, y: -90 },
  { x: 190, y: -45 },
  { x: -170, y: 105 },
  { x: 180, y: 130 },
];

const certificates = [
  {
    name: "AWS Certified AI Practitioner",
    year: "Jan 2025",
    href: "https://www.credly.com/badges/7f630b2e-72fb-4b77-b0fd-449ef1612560/public_url",
  },
  {
    name: "AWS Certified Cloud Practitioner",
    year: "Sept 2024",
    href: "https://www.credly.com/badges/b8e657e6-59b0-4c05-a198-7500641cac1b/public_url",
  },
  {
    name: "Machine Learning Fundamentals Nanodegree · Udacity x AWS",
    year: "Apr to Oct 2024",
    href: "https://www.udacity.com/certificate/e/c15e7ef0-f6c0-11ee-83ff-972528050e39",
  },
  {
    name: "AI Programming with Python Nanodegree · Udacity x AWS",
    year: "Oct 2023 to Feb 2024",
    href: "https://www.udacity.com/certificate/e/d5f54af6-6c23-11ee-890f-576b25f54451",
  },
];

// ---------- HELPERS ----------
function ChapterHeader({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="font-serif-body uppercase tracking-[0.3em] text-[10px] text-muted-foreground">
        chapter {num}
      </p>
      <h3 className="font-display text-3xl md:text-4xl font-semibold text-foreground mt-1 leading-tight">
        {title}
      </h3>
      <p className="font-script text-xl text-primary mt-0.5">{sub}</p>
      <div className="mt-3 h-px w-12 bg-primary/40" />
    </div>
  );
}

const toc = [
  { label: "About me", spread: 1, page: "03" },
  { label: "The toolkit", spread: 1, page: "04" },
  { label: "Where I have been", spread: 2, page: "05" },
  { label: "Education", spread: 3, page: "07" },
  { label: "Selected works", spread: 3, page: "08" },
  { label: "Publication", spread: 4, page: "09" },
  { label: "Certificates", spread: 4, page: "10" },
  { label: "Say hello", spread: 5, page: "11" },
];

// ---------- PAGE BUILDERS ----------
const buildPages = (
  goTo: (s: number) => void,
  activeExperience: number,
  setActiveExperience: (idx: number) => void,
) => [
  // SPREAD 0
  () => (
    <div className="flex flex-col h-full justify-center">
      <p className="font-script text-3xl text-primary">hello,</p>
      <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-foreground mt-1">
        I'm <span className="italic">Sanskriti</span>
      </h2>
      <p className="font-serif-body italic text-muted-foreground mt-2 text-sm">
        cs &amp; cogsci · ai/ml · full-stack systems
      </p>
      <div className="mt-6 h-px w-full bg-border" />
      <div className="journal-lines mt-6 text-foreground/85">
        <p>
          Welcome to my portfolio. I build AI and software systems that make information easier to
          understand, act on, and trust. Turn the page and we'll begin.
        </p>
      </div>
    </div>
  ),
  () => (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
          Contents
        </h3>
        <p className="font-script text-xl text-primary mt-0.5">what's inside</p>
        <div className="mt-3 h-px w-12 bg-primary/40" />
      </div>
      <ul className="space-y-3 font-serif-body">
        {toc.map((t) => (
          <li key={t.label}>
            <button
              onClick={() => goTo(t.spread)}
              className="group flex w-full items-baseline gap-2 text-left transition-colors"
            >
              <span className="font-display text-lg italic text-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                {t.label}
              </span>
              <span className="flex-1 border-b border-dotted border-border/70 mx-1 group-hover:border-primary/60" />
              <span className="text-xs text-muted-foreground tracking-widest group-hover:text-primary">
                p. {t.page}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="font-script text-lg text-primary mt-8 italic">~ click any line to jump in ~</p>
    </div>
  ),

  // SPREAD 1, About
  () => (
    <div>
      <ChapterHeader num="i" title="About me" sub="a few words" />
      <div className="space-y-3 font-serif-body text-sm leading-relaxed text-foreground/85">
        <p>
          I'm a final-year Computer Science and Cognitive Science student at Rutgers, headed to{" "}
          <em>Cornell Tech</em> for graduate study in Applied Information Science and Information
          Systems.
        </p>
        <p>
          My work lives at the intersection of research and engineering, the kind of problems where
          getting the model right matters, but so does the interface that wraps it.
        </p>
        <p>
          Lately that has meant agentic AI pipelines, document-grounded RAG tools, NLP for consumer
          insight, and backend APIs for live products.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-5">
        <MetricCard value="14M+" label="consumer records analyzed" delay={0} />
        <MetricCard value="~90%" label="CV validation accuracy" delay={120} />
        <MetricCard value="~60%" label="lead review time saved" delay={240} />
        <MetricCard value="25+" label="students mentored" delay={360} />
      </div>
    </div>
  ),

  // SPREAD 2, Skills
  () => (
    <div className="relative">
      <p className="absolute right-0 top-0 font-script text-lg text-primary italic">
        ~ select a drawer for details ~
      </p>
      <ChapterHeader num="ii" title="The toolkit" sub="things I use" />
      <ToolkitDrawers />
    </div>
  ),

  // SPREAD 2, Experience + education
  () => (
    <div>
      <ChapterHeader num="iii" title="Where I've been" sub="a short timeline" />
      <ExperienceTimelinePage
        items={timelineExperience.slice(0, 3)}
        startIndex={0}
        active={activeExperience}
        setActive={setActiveExperience}
        side="left"
        showDetail
      />
    </div>
  ),
  () => (
    <div className="relative">
      <p className="absolute right-0 top-0 font-script text-lg text-primary italic">
        ~ select a pin for details ~
      </p>
      <div className="invisible pointer-events-none select-none" aria-hidden="true">
        <ChapterHeader num="iii" title="Where I've been" sub="a short timeline" />
      </div>
      <ExperienceTimelinePage
        items={timelineExperience.slice(3)}
        startIndex={3}
        active={activeExperience}
        setActive={setActiveExperience}
        side="right"
        showDetail
      />
    </div>
  ),

  // SPREAD 3, Education + projects
  () => (
    <div>
      <ChapterHeader num="iv" title="Education" sub="where I'm learning" />
      <div className="space-y-4">
        <div className="rounded-md border border-border/60 bg-card/50 p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-display text-lg font-semibold text-foreground italic">
                Cornell University · Cornell Tech
              </p>
              <p className="font-serif-body text-sm text-foreground/80">
                M.S. Applied Information Science &amp; M.S. Information Systems
              </p>
              <p className="font-serif-body text-sm text-foreground/80">
                Concentration in Health Tech
              </p>
              <p className="font-serif-body text-xs text-muted-foreground mt-1 tracking-widest">
                Aug 2026 onwards · New York City
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border/60 bg-card/50 p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-display text-lg font-semibold text-foreground italic">
                Rutgers University, New Brunswick
              </p>
              <p className="font-serif-body text-sm text-foreground/80">
                B.S. Computer Science &amp; Cognitive Science
              </p>
              <p className="font-serif-body text-xs text-muted-foreground mt-1 tracking-widest">
                Dean's List · Sept 2023 to May 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  () => (
    <div className="relative">
      <p className="absolute right-0 top-0 font-script text-lg text-primary italic">
        ~ select an airplane for details ~
      </p>
      <ChapterHeader num="v" title="Selected works" sub="things I've built" />
      <ProjectAirplanes />
    </div>
  ),

  // SPREAD 4, Publication + certificates
  () => (
    <div>
      <ChapterHeader num="vi" title="Publication" sub="writing I share" />
      <ScratchPublicationCard />
    </div>
  ),
  () => (
    <div>
      <ChapterHeader num="vii" title="Certificates" sub="& honors" />
      <div className="space-y-2.5">
        {certificates.map((c, index) => (
          <AnimatedCertificateCard
            key={c.name}
            certificate={c}
            delay={certificateTypeDelay(index)}
          />
        ))}
      </div>
      <div className="mt-6">
        <p className="font-serif-body italic text-sm text-primary mb-2">Honors I'm grateful for</p>
        <ul className="space-y-1 font-serif-body text-sm text-foreground/85">
          <li>· AWS AI &amp; ML Scholarship</li>
          <li>· Dean's List at Rutgers</li>
        </ul>
      </div>
    </div>
  ),

  // SPREAD 5, Contact + ending
  () => (
    <div>
      <ChapterHeader num="viii" title="Say hello" sub="let's talk" />
      <div className="journal-lines text-foreground/85">
        <p>
          I'm always open to thoughtful software, AI, data, product, and research collaborations. If
          you'd like to build something together, compare ideas, or just say hi, I'd love to hear
          from you.
        </p>
      </div>
      <div className="mt-5 space-y-2.5">
        <ContactRow
          icon={Mail}
          label="email"
          value="sanskritimalakar@gmail.com"
          href="mailto:sanskritimalakar@gmail.com"
        />
        <ContactRow
          icon={Linkedin}
          label="linkedin"
          value="in/sanskriti-m-937650330"
          href="https://www.linkedin.com/in/sanskriti-m-937650330"
        />
        <ContactRow
          icon={Github}
          label="github"
          value="@sanskritim05"
          href="https://github.com/sanskritim05"
        />
      </div>
    </div>
  ),
  () => (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 14, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-md border border-border/70 bg-card/65 px-8 py-10 shadow-sm"
      >
        <div className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rounded-sm border border-primary/25 bg-primary/10 shadow-sm" />

        <div className="mx-auto h-px w-20 bg-primary/40" />
        <p className="mt-6 max-w-xs font-serif-body text-base italic text-foreground/75">
          Thank you for reading.
          <br />
        </p>
        <p className="mt-8 font-script text-2xl text-primary/80">~ with warmth, Sanskriti</p>
        <div className="mx-auto mt-6 h-px w-20 bg-primary/40" />
      </motion.div>
    </div>
  ),
];

function ToolkitDrawers() {
  const categories = Object.entries(skills);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const activeIndex = categories.findIndex(([category]) => category === activeCategory);
  const activeItems = activeCategory ? skills[activeCategory as keyof typeof skills] : [];

  const handleCategory = (category: string) => {
    setActiveCategory((current) => (current === category ? null : category));
  };

  return (
    <div className="relative mx-auto min-h-[455px] max-w-[560px]">
      <div className="absolute left-1/2 top-5 w-[390px] -translate-x-1/2 rounded-md border-[3px] border-[#7a254b] bg-[#ffd6df] px-5 pb-5 pt-5 shadow-[0_12px_24px_oklch(0.5_0.08_340/0.18)]">
        <div className="absolute -left-2 -right-2 top-0 h-6 -translate-y-1 rounded-t-sm border-[3px] border-[#7a254b] bg-gradient-to-b from-[#e06b9b] to-[#c94f83] shadow-sm" />
        <div className="absolute bottom-[-15px] left-12 h-4 w-10 rounded-b-md border-[3px] border-[#7a254b] bg-[#b94d78]" />
        <div className="absolute bottom-[-15px] right-12 h-4 w-10 rounded-b-md border-[3px] border-[#7a254b] bg-[#b94d78]" />

        <div className="space-y-2 pt-1">
          {categories.map(([category], index) => {
            const isActive = category === activeCategory;

            return (
              <motion.div
                key={category}
                animate={{
                  x: isActive ? 12 : 0,
                  zIndex: isActive ? 20 : 5 - index,
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`relative rounded-[16px] border-[3px] border-[#7a254b] bg-gradient-to-br from-[#ffe4ea] via-[#ffcbd8] to-[#f7a6c2] shadow-sm transition-shadow ${
                  isActive ? "shadow-[0_9px_18px_oklch(0.48_0.12_340/0.2)]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCategory(category)}
                  className="group relative flex min-h-[62px] w-full items-center px-6 py-2.5 text-left"
                  aria-expanded={isActive}
                >
                  <span className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-[3px] rounded-b-full border-x-[3px] border-b-[3px] border-[#7a254b] bg-[#8e2756]" />
                  <span className="block font-display text-lg font-semibold leading-tight text-[#3d1930] transition-colors group-hover:text-primary">
                    {category}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{
              opacity: 0,
              x: -96,
              y: activeIndex * 42,
              rotate: -8,
              scale: 0.82,
            }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 2, scale: 1 }}
            exit={{ opacity: 0, x: -72, y: activeIndex * 26, rotate: -6, scale: 0.86 }}
            transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ top: `${Math.min(48 + activeIndex * 42, 250)}px` }}
            className="absolute right-0 z-30 w-[255px] origin-left rounded-md border border-[#7a254b]/35 bg-[oklch(0.98_0.015_82)] p-4 shadow-[0_16px_32px_oklch(0.45_0.11_340/0.22)]"
          >
            <div className="absolute -left-3 top-7 h-7 w-7 rotate-45 border-b border-l border-[#7a254b]/35 bg-[oklch(0.98_0.015_82)]" />
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-display text-base font-semibold leading-tight text-[#3d1930]">
                {activeCategory}
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="rounded-full border border-[#7a254b]/25 px-2 font-serif-body text-[9px] uppercase tracking-widest text-[#8e2756] transition-colors hover:bg-white"
              >
                close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {activeItems.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-[#7a254b]/20 bg-white/80 px-2 py-1.5 font-serif-body text-[12px] leading-tight text-foreground/90 shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExperienceTimelinePage({
  items,
  startIndex,
  active,
  setActive,
  side,
  showDetail = false,
}: {
  items: typeof experience;
  startIndex: number;
  active: number;
  setActive: (idx: number) => void;
  side: "left" | "right";
  showDetail?: boolean;
}) {
  const selected = timelineExperience[active];
  const hasActiveDetail = active >= startIndex && active < startIndex + items.length;

  return (
    <div>
      <div className="relative min-h-[148px]">
        <div
          className={`absolute top-[31px] h-[3px] rounded-full bg-primary/30 ${
            side === "left" ? "left-0 right-[-48px]" : "left-[-48px] right-0"
          }`}
        />
        <div className="grid grid-cols-3 gap-4">
          {items.map((e, localIdx) => {
            const idx = startIndex + localIdx;
            const isActive = idx === active;

            return (
              <button
                key={`${e.role}-${e.company}`}
                type="button"
                onClick={() => setActive(idx)}
                className="group relative flex min-w-0 flex-col items-center pt-1 text-center"
                aria-pressed={isActive}
              >
                <MapPin
                  className={`relative z-10 mb-3 h-7 w-7 transition-all ${
                    isActive
                      ? "fill-primary text-primary drop-shadow-sm"
                      : "fill-card text-primary/65 group-hover:fill-primary/15 group-hover:text-primary"
                  }`}
                />
                <span
                  className={`font-serif-body text-[9px] uppercase tracking-[0.18em] leading-snug transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  }`}
                >
                  {e.year}
                </span>
                <span className="mt-1 font-display text-[15px] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {e.role}
                </span>
                <span className="mt-1 font-script text-[17px] leading-tight text-primary/80">
                  {e.company}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showDetail && hasActiveDetail ? (
        <AnimatePresence mode="wait">
          <motion.article
            key={`${selected.role}-${selected.company}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-4 rounded-md border border-border/60 bg-card/55 px-5 py-4"
          >
            <p className="font-serif-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {selected.year}
            </p>
            <h4 className="font-display text-[22px] font-semibold text-foreground mt-1 leading-tight">
              {selected.role}
            </h4>
            <p className="font-script text-xl text-primary">{selected.company}</p>
            <p className="font-serif-body text-sm text-foreground/80 leading-snug mt-2 italic">
              {selected.note}
            </p>
            {"tags" in selected && selected.tags && (
              <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-2">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-widest text-muted-foreground font-serif-body"
                  >
                    · {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      ) : null}
    </div>
  );
}

function ProjectAirplanes() {
  const [active, setActive] = useState<number | null>(null);
  const activeProject = active === null ? null : projects[active];

  return (
    <div className="relative h-[540px]">
      <div className="absolute inset-0">
        {projects.map((p, idx) => (
          <ProjectPlane
            key={p.title}
            p={p}
            idx={idx}
            isHidden={active === idx}
            onOpen={() => setActive(idx)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <ProjectOverlay
            key={activeProject.title}
            p={activeProject}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectPlane({
  p,
  idx,
  isHidden,
  onOpen,
}: {
  p: (typeof projects)[number];
  idx: number;
  isHidden: boolean;
  onOpen: () => void;
}) {
  const layout = planeLayout[idx];
  const flyIn = planeFlyIn[idx];

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -5, rotate: layout.rotate * 0.65 }}
      whileTap={{ scale: 0.97 }}
      className="group absolute flex w-[185px] flex-col items-center text-center"
      style={{
        top: layout.top,
        left: layout.left,
        rotate: `${layout.rotate}deg`,
      }}
      initial={{ opacity: 0, x: flyIn.x, y: flyIn.y, scale: 0.82 }}
      animate={{ opacity: isHidden ? 0 : 1, x: 0, y: 0, scale: isHidden ? 0.86 : 1 }}
      transition={{
        duration: isHidden ? 0.18 : 0.68,
        delay: isHidden ? 0 : idx * 0.13,
        ease: [0.22, 1, 0.36, 1],
      }}
      disabled={isHidden}
    >
      <img
        src={paperAirplane}
        alt=""
        aria-hidden="true"
        className="h-28 w-36 object-contain drop-shadow-sm transition-transform group-hover:scale-110"
        style={{ transform: layout.flip ? "scaleX(-1)" : undefined }}
      />
      <h4 className="mt-1 font-display text-[16px] font-semibold leading-tight text-foreground italic group-hover:text-primary transition-colors">
        {p.title}
      </h4>
    </motion.button>
  );
}

function ProjectOverlay({ p, onClose }: { p: (typeof projects)[number]; onClose: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18, rotateX: -35, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, rotateX: -20, scale: 0.96 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="absolute left-1/2 top-20 z-30 min-h-[244px] w-[92%] -translate-x-1/2 overflow-hidden rounded-md border border-border/60 bg-white/90 px-8 py-6 text-left shadow-[0_18px_40px_oklch(0.38_0.08_245/0.22)] backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={`Refold ${p.title}`}
        className="absolute right-3 top-3 z-20 rounded-full border border-border/60 bg-card/80 p-1 text-muted-foreground transition-colors hover:text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="relative z-10 flex min-h-[196px] flex-col justify-between pr-8">
        <div>
          <div className="flex items-start gap-2.5">
            <h4 className="font-display text-2xl font-semibold leading-tight text-foreground italic">
              {p.title}
            </h4>
          </div>
          <p className="mt-3 font-serif-body text-[16px] leading-relaxed text-foreground/80">
            {p.desc}
          </p>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {p.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] uppercase tracking-widest text-muted-foreground font-serif-body"
              >
                · {t}
              </span>
            ))}
          </div>
          {"href" in p && p.href && (
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-serif-body text-sm uppercase tracking-widest text-primary hover:text-primary/75"
            >
              open project <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ScratchPublicationCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isScratching = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const articleUrl =
    "https://medium.com/@sanskritimalakar/from-one-big-prompt-to-a-production-pipeline-multi-agent-ai-with-strands-agents-9bbf7c31b056";

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const drawFoil = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "oklch(0.86 0.13 83)");
      gradient.addColorStop(0.28, "oklch(0.93 0.08 92)");
      gradient.addColorStop(0.55, "oklch(0.78 0.14 76)");
      gradient.addColorStop(0.78, "oklch(0.96 0.04 95)");
      gradient.addColorStop(1, "oklch(0.82 0.12 80)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 160; i += 1) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        ctx.fillStyle = i % 2 ? "white" : "oklch(0.6 0.1 70)";
        ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
      }
      ctx.globalAlpha = 1;
    };

    drawFoil();
    window.addEventListener("resize", drawFoil);
    return () => window.removeEventListener("resize", drawFoil);
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const measureReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || isRevealed) return;

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    let total = 0;
    const stride = 24;

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        total += 1;
        if (data[(y * width + x) * 4 + 3] < 40) transparent += 1;
      }
    }

    if (transparent / total >= 0.8) setIsRevealed(true);
  };

  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const startScratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isScratching.current = true;
    setHasStarted(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    scratch(event);
    measureReveal();
  };

  const moveScratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching.current) return;
    scratch(event);
    measureReveal();
  };

  const stopScratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isScratching.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    measureReveal();
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-[500px] overflow-hidden rounded-md border border-border/60 bg-card/60 p-4 shadow-sm"
    >
      <div className="min-h-[220px]">
        <p className="font-serif-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          April 2026
        </p>
        <h4 className="font-display text-xl font-semibold text-foreground leading-tight italic mt-1.5">
          From One Big Prompt to a Production Pipeline: Multi-Agent AI with Strands Agents
        </h4>
        <p className="font-serif-body text-sm text-foreground/80 leading-relaxed mt-2.5">
          A technical article on building a multi-agent LLM pipeline with more reliability than a
          single-prompt system, using specialist agents, structured routing, and production-minded
          checks.
        </p>
        <motion.a
          href={articleUrl}
          target="_blank"
          rel="noreferrer"
          initial={false}
          animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 6 }}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-md border border-foreground/35 px-3 py-2 font-serif-body text-xs uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary ${
            isRevealed ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          read article <ExternalLink className="h-3.5 w-3.5" />
        </motion.a>
      </div>

      <motion.canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 h-full w-full touch-none ${
          hasStarted ? "" : "scratch-foil-shimmer"
        } ${isRevealed ? "pointer-events-none" : ""}`}
        onPointerDown={startScratch}
        onPointerMove={moveScratch}
        onPointerUp={stopScratch}
        onPointerCancel={stopScratch}
        animate={{ opacity: isRevealed ? 0.14 : 1 }}
        transition={{ duration: 0.45 }}
      />

      <AnimatePresence>
        {!hasStarted && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center font-script text-2xl italic text-foreground/70"
          >
            scratch to reveal
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function certificateTypeDelay(index: number) {
  return certificates
    .slice(0, index)
    .reduce((delay, certificate) => delay + certificate.name.length * 22 + 420, 250);
}

function AnimatedCertificateCard({
  certificate,
  delay,
}: {
  certificate: (typeof certificates)[number];
  delay: number;
}) {
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      let position = 0;
      interval = window.setInterval(() => {
        position += 1;
        setTypedName(certificate.name.slice(0, position));

        if (position >= certificate.name.length) {
          if (interval) window.clearInterval(interval);
        }
      }, 22);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [certificate.name, delay]);

  const isTyping = typedName.length > 0 && typedName.length < certificate.name.length;

  return (
    <a
      href={certificate.href}
      target="_blank"
      rel="noreferrer"
      className="group relative flex min-h-[74px] items-start gap-3 rounded-md border border-border/60 bg-card/50 p-3 transition-all hover:border-primary/40 hover:bg-card/70"
    >
      <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1 pr-10">
        <p className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {typedName}
          {isTyping && <span className="text-primary">|</span>}
          {!typedName && <span className="text-muted-foreground/50">certifying...</span>}
        </p>
        <p className="font-serif-body text-xs text-muted-foreground tracking-widest mt-1">
          {certificate.year}
        </p>
      </div>
      <ExternalLink className="absolute right-3 top-4 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

function parseMetric(value: string) {
  const match = value.match(/^([^0-9]*)(\d+)(.*)$/);
  return {
    prefix: match?.[1] ?? "",
    target: Number(match?.[2] ?? 0),
    suffix: match?.[3] ?? "",
  };
}

function MetricCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const { prefix, target, suffix } = parseMetric(value);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame: number | undefined;
    const duration = 1250;

    const timeout = window.setTimeout(() => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(target * eased));

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        }
      };

      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [delay, target]);

  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-4">
      <p className="font-display text-2xl font-semibold text-primary italic [font-variant-numeric:tabular-nums]">
        {prefix}
        {current}
        {suffix}
      </p>
      <p className="font-serif-body text-xs uppercase tracking-[0.22em] text-muted-foreground mt-2 leading-relaxed">
        {label}
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border border-border/60 bg-card/60 p-3 hover:border-primary/40 hover:bg-card transition-all group"
    >
      <Icon className="h-4 w-4 text-primary" />
      <div className="min-w-0">
        <p className="font-serif-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-base text-foreground italic group-hover:text-primary transition-colors truncate">
          {value}
        </p>
      </div>
    </a>
  );
}

// ---------- MAIN ----------
export function JournalPages() {
  const [spread, setSpread] = useState(0);
  const [dir, setDir] = useState(1);
  const [activeExperience, setActiveExperience] = useState(0);

  function goTo(s: number) {
    if (s < -1 || s > totalSpreads || s === spread) return;
    setDir(s > spread ? 1 : -1);
    setSpread(s);
  }

  const pages = buildPages(goTo, activeExperience, setActiveExperience);
  const totalSpreads = Math.ceil(pages.length / 2);
  const isClosedCover = spread === -1 || spread === totalSpreads;

  const next = () => {
    if (spread === totalSpreads) {
      setDir(1);
      setSpread(0);
      return;
    }

    goTo(spread + 1);
  };
  const prev = () => goTo(spread - 1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setDir(1);
        setSpread((current) =>
          current === totalSpreads ? 0 : Math.min(current + 1, totalSpreads),
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSpread((current) => {
          if (current === -1 || current === totalSpreads) return current;
          setDir(-1);
          return Math.max(current - 1, -1);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSpreads]);

  const leftIdx = spread * 2;
  const rightIdx = leftIdx + 1;
  const LeftPage = pages[leftIdx];
  const RightPage = pages[rightIdx];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen w-full items-center justify-center px-4 py-6 md:py-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center gap-3"></div>

        <div className="relative mx-auto" style={{ perspective: 2200 }}>
          <AnimatePresence mode="wait" custom={dir}>
            {isClosedCover ? (
              <motion.div
                key={`cover-${spread}`}
                custom={dir}
                initial={{ opacity: 0, x: dir > 0 ? 24 : -24, rotateY: dir > 0 ? -8 : 8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: dir > 0 ? -24 : 24, rotateY: dir > 0 ? 8 : -8 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="flex w-full justify-center"
              >
                <ClosedPortfolioCover />
              </motion.div>
            ) : (
              <motion.div
                key={`spread-${spread}`}
                custom={dir}
                initial={{ opacity: 0, x: dir > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir > 0 ? -20 : 20 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="relative grid grid-cols-1 overflow-hidden rounded-lg shadow-[var(--shadow-book)] md:grid-cols-2"
                style={{ background: "var(--paper)" }}
              >
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[oklch(0.6_0.08_240/0.4)] to-transparent z-10" />
                <div
                  className="hidden md:block absolute left-1/2 top-4 bottom-4 w-8 -translate-x-1/2 pointer-events-none z-10"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, oklch(0.5 0.07 245 / 0.18), transparent 70%)",
                  }}
                />

                <div className="paper-texture book-page p-8 md:p-12 relative">
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={`L-${spread}`}
                      custom={dir}
                      initial={{ opacity: 0, x: dir > 0 ? 18 : -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: dir > 0 ? -18 : 18 }}
                      transition={{ duration: 0.26, ease: "easeOut" }}
                      className="h-full overflow-hidden"
                    >
                      {LeftPage && <LeftPage />}
                    </motion.div>
                  </AnimatePresence>
                  <PageNumber n={leftIdx + 1} side="left" />
                </div>

                <div className="paper-texture book-page p-8 md:p-12 relative border-t md:border-t-0 md:border-l border-border/50">
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={`R-${spread}`}
                      custom={dir}
                      initial={{ opacity: 0, x: dir > 0 ? 18 : -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: dir > 0 ? -18 : 18 }}
                      transition={{ duration: 0.26, ease: "easeOut" }}
                      className="h-full overflow-hidden"
                    >
                      {RightPage && <RightPage />}
                    </motion.div>
                  </AnimatePresence>
                  <PageNumber n={rightIdx + 1} side="right" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={prev}
            disabled={isClosedCover}
            aria-label={spread === 0 ? "Close book" : "Previous page"}
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full border border-border bg-card/90 backdrop-blur p-3 shadow-md transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            disabled={false}
            aria-label={isClosedCover ? "Open book" : "Next page"}
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 rounded-full border border-border bg-card/90 backdrop-blur p-3 shadow-md transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ClosedPortfolioCover() {
  return (
    <div className="book-intro-stage relative rounded-r-md rounded-l-sm shadow-[var(--shadow-book)]">
      <div
        className="absolute inset-0 rounded-r-md rounded-l-sm"
        style={{
          background: "linear-gradient(135deg, var(--book-cover) 0%, var(--book-cover-dark) 100%)",
          boxShadow:
            "0 10px 40px oklch(0.4 0.1 245 / 0.4), inset 0 0 30px oklch(0.4 0.1 245 / 0.2)",
        }}
      >
        <div className="absolute inset-4 rounded-sm border border-[oklch(0.85_0.09_90/0.4)]" />
        <div className="absolute inset-6 rounded-sm border border-[oklch(0.85_0.09_90/0.25)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-3 h-px w-20 bg-[oklch(0.85_0.09_90/0.6)]" />
          <p className="font-script text-3xl text-[oklch(0.95_0.04_90)]">my</p>
          <h1 className="font-display text-5xl font-semibold tracking-wide text-[oklch(0.97_0.02_235)]">
            Portfolio
          </h1>
          <div className="mt-3 h-px w-20 bg-[oklch(0.85_0.09_90/0.6)]" />
          <p className="mt-6 font-serif-body text-xs uppercase tracking-[0.3em] text-[oklch(0.9_0.04_235)]">
            A collection of works
          </p>
        </div>
        <div className="absolute left-0 top-0 h-full w-2 rounded-l-sm bg-gradient-to-r from-black/20 to-transparent" />
        <div
          className="absolute -top-1 right-[12%] w-3"
          style={{ background: "var(--gold)", height: 150 }}
        >
          <div className="absolute bottom-0 left-0 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[var(--gold)]" />
        </div>
      </div>
    </div>
  );
}

function PageNumber({ n, side }: { n: number; side: "left" | "right" }) {
  return (
    <span
      className={`absolute bottom-4 ${side === "left" ? "left-8" : "right-8"} font-serif-body text-xs italic text-muted-foreground`}
    >
      ~ {n} ~
    </span>
  );
}
