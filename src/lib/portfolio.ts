import medicalLiteratureScreenshot from "@/assets/project-medical-literature.png";
import munchlyScreenshot from "@/assets/project-munchly.png";
import intelswarmScreenshot from "@/assets/project-intelswarm.png";
import syncScreenshot from "@/assets/project-sync.png";
import realEstateScreenshot from "@/assets/project-real-estate-rag.png";
import clinicalRiskScreenshot from "@/assets/project-clinical-risk.png";
import awsAiPractitionerCert from "@/assets/cert-aws-ai-practitioner.png";
import awsCloudPractitionerCert from "@/assets/cert-aws-cloud-practitioner.png";
import awsMlFundamentalsCert from "@/assets/cert-aws-ml-fundamentals.png";
import aiProgrammingCert from "@/assets/cert-ai-programming-python.png";

export const person = {
  name: "Sanskriti Malakar",
  nowLine: "Research Assistant @ Weill Cornell Medicine",
  tagline:
    "I build AI and software systems that make information easier to understand, act on, and trust.",
  email: "sanskritimalakar@gmail.com",
  linkedin: "https://www.linkedin.com/in/sanskriti-m-937650330",
  github: "https://github.com/sanskritim05",
};

export type CaseStudy = {
  timeline: string;
  tools: string[];
  skills: string[];
  problem: string;
  summary: string;
  process: { label: string; body: string }[];
  outcome: string;
  results: string[];
};

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  blurb: string;
  role: string;
  period: string;
  tags: string[];
  accent: string;
  repo?: string;
  link?: string;
  image?: string;
  caseStudy: CaseStudy;
};

export const projects: Project[] = [
  {
    slug: "medical-literature-research-agent",
    title: "Medical Literature Research Agent",
    subtitle: "Sourced clinical answers from PubMed and ClinicalTrials.gov",
    blurb:
      "Ask a clinical question and get a sourced answer pulled from PubMed and ClinicalTrials.gov, complete with inline citations, confidence scores, follow-up questions, and a PDF you can export.",
    role: "Solo Developer",
    period: "2026",
    tags: ["Python", "LangGraph", "FastAPI", "Groq", "NLP", "Agentic AI"],
    accent: "oklch(0.82 0.07 235)",
    image: medicalLiteratureScreenshot,
    repo: "https://github.com/sanskritim05/medical-literature-research-agent",
    link: "https://medical-literature-research-agent.vercel.app",
    caseStudy: {
      timeline: "2026",
      tools: ["Python", "LangGraph", "FastAPI", "Groq"],
      skills: ["Agent Orchestration", "Retrieval", "NLP", "API Design"],
      problem:
        "Answering a clinical question well means reading across PubMed and ClinicalTrials.gov, weighing study quality, and keeping track of where every claim came from. A single language model prompt collapses all of that into fluent text with no traceable sources. I wanted a system that searches real literature, cites it inline, and tells the reader how confident it is.",
      summary:
        "A multi-agent research assistant for clinical questions: search, synthesis, and comparison split into separate, inspectable agents.",
      process: [
        {
          label: "Retrieval first",
          body: "Built the PubMed and ClinicalTrials.gov retrieval layer before any generation, so every answer starts from documents that actually exist.",
        },
        {
          label: "Graph of specialists",
          body: "Used LangGraph to split search, synthesis, comparison, and follow-up into separate nodes, which made each step inspectable instead of hidden in one prompt.",
        },
        {
          label: "Confidence and export",
          body: "Added confidence scoring per claim and a PDF export so a session can be reviewed or shared outside the tool.",
        },
      ],
      outcome:
        "The result is a research agent you can question like a colleague: it answers from live literature, cites every claim, scores its own confidence, and lets you export the whole exchange as a PDF.",
      results: [
        "Every claim links back to a retrieved source",
        "Comparisons across studies and trials in one pass",
        "Sessions exportable as a citable PDF",
      ],
    },
  },
  {
    slug: "munchly",
    title: "Munchly",
    subtitle: "Social food photos with live scoring and AI taste picks",
    blurb:
      "Post a plate, swipe Hot or Not, and watch it earn a live 0–10 score. Follow other foodies, climb the weekly Top board, and get AI-picked recommendations based on what you've rated.",
    role: "Solo Developer",
    period: "2026",
    tags: ["Next.js", "TypeScript", "Supabase", "TailwindCSS", "Framer Motion", "Groq"],
    accent: "oklch(0.85 0.06 60)",
    image: munchlyScreenshot,
    link: "https://munchly10.vercel.app",
    caseStudy: {
      timeline: "2026",
      tools: ["Next.js", "TypeScript", "Supabase", "TailwindCSS", "Framer Motion", "Groq"],
      skills: ["Full-Stack Product", "Real-Time UI", "Recommendation Logic", "Auth & Social"],
      problem:
        "Food photos are everywhere, but most apps treat them as content to scroll past. I wanted a product that turns a food photo into a small social game: an instant score, a leaderboard, and recommendations that actually learn from what you like.",
      summary:
        "A social app that turns every food photo into a mini competition: swipe to score, follow to build a feed, climb the weekly board.",
      process: [
        {
          label: "Swipe and score",
          body: "Built a Hot-or-Not swipe flow so users can rate plates quickly, with scores updating in real time as more votes come in.",
        },
        {
          label: "Social graph",
          body: "Added follows, profiles, and a weekly Top board so the app feels like a community, not just a rating tool.",
        },
        {
          label: "Taste recommendations",
          body: "Used Groq to generate personalized dish suggestions from a user's rating history, keeping recommendations fast and cheap.",
        },
      ],
      outcome:
        "The result is a food app people actually open daily: post a plate, get scored in real time, and get taste picks that sharpen the more you rate.",
      results: [
        "Posts get a live 0-10 score from community votes",
        "Weekly Top board updates in real time",
        "AI recommendations based on personal rating history",
      ],
    },
  },
  {
    slug: "intelswarm",
    title: "IntelSwarm",
    subtitle: "Parallel specialist agents for company intelligence",
    blurb:
      "Enter a company name and get a full intelligence report covering product, hiring, funding, news, and culture, built by parallel specialist agents in seconds.",
    role: "Solo Developer",
    period: "2026",
    tags: ["Python", "FastAPI", "Strands Agents", "Ollama", "React", "Multi-agent systems"],
    accent: "oklch(0.84 0.06 320)",
    image: intelswarmScreenshot,
    repo: "https://github.com/sanskritim05/IntelSwarm",
    link: "https://intel-swarm-phi.vercel.app",
    caseStudy: {
      timeline: "2026",
      tools: ["Python", "FastAPI", "Strands Agents", "Ollama", "React"],
      skills: ["Multi-agent Design", "Backend APIs", "Frontend Integration"],
      problem:
        "Researching a company means opening a dozen tabs and stitching together product pages, job posts, funding news, and reviews. The work is repetitive and the output is never in the same shape twice. I wanted one input and one structured report.",
      summary:
        "A multi-agent research tool that turns one company name into a single, consistently structured report.",
      process: [
        {
          label: "One agent per domain",
          body: "Gave product, hiring, funding, news, and culture their own specialist agent so each prompt stays focused and testable.",
        },
        {
          label: "Parallel execution",
          body: "Ran the specialists concurrently behind a FastAPI endpoint, then merged their output into one report schema.",
        },
        {
          label: "Readable frontend",
          body: "Built a React view that renders the report section by section as results arrive.",
        },
      ],
      outcome:
        "The result is company research that used to take an hour, delivered as one structured report in the time it takes the agents to run in parallel.",
      results: [
        "Five consistent sections for any company",
        "Parallel agents instead of serial research",
        "One API contract shared by report and UI",
      ],
    },
  },
  {
    slug: "sync",
    title: "Sync",
    subtitle: "Real-time voting sessions with no account required",
    blurb:
      "Create a voting session, share the link, and watch votes come in live. A 3-2-1 countdown reveals the winner, with a full breakdown and ties settled by a coin flip.",
    role: "Solo Developer",
    period: "2026",
    tags: ["React", "TypeScript", "Vite", "Supabase", "TailwindCSS"],
    accent: "oklch(0.82 0.07 235)",
    image: syncScreenshot,
    link: "https://sync-now.vercel.app",
    repo: "https://github.com/sanskritim05/sync",
    caseStudy: {
      timeline: "2026",
      tools: ["React", "TypeScript", "Vite", "Supabase", "TailwindCSS"],
      skills: ["Real-Time Sync", "Session Design", "No-Auth UX", "State Machines"],
      problem:
        "Most decision-making tools force you to sign up, create a room, and manage permissions before anyone can vote. For quick group decisions, I wanted a link you share, a vote you cast, and a result everyone sees together.",
      summary:
        "A no-account voting tool where a shared link is the entire onboarding flow.",
      process: [
        {
          label: "Instant rooms",
          body: "Built session creation so a host can share a link immediately; voters join without accounts or app installs.",
        },
        {
          label: "Live voting",
          body: "Used Supabase real-time so votes appear on every connected screen as they come in, with a visible countdown to the reveal.",
        },
        {
          label: "Reveal and breakdown",
          body: "Added a 3-2-1 reveal animation, a full vote breakdown, and an automatic coin flip for ties so the moment feels decisive.",
        },
      ],
      outcome:
        "The result is group decisions that take seconds: share a link, watch votes land live, and get a clear, decisive reveal, ties included.",
      results: [
        "No account required for hosts or voters",
        "Votes sync live across all connected screens",
        "3-2-1 countdown reveal with automatic tie breaker",
      ],
    },
  },
  {
    slug: "real-estate-rag-assistant",
    title: "Real Estate RAG Assistant",
    subtitle: "Document-grounded answers with page citations",
    blurb:
      "Upload a lease or property document, ask questions in plain English, and get grounded answers with the exact page cited every time.",
    role: "Solo Developer",
    period: "2025",
    tags: ["Python", "LangChain", "ChromaDB", "FastAPI", "React", "RAG"],
    accent: "oklch(0.86 0.05 150)",
    image: realEstateScreenshot,
    link: "https://real-estate-rag-assistant.vercel.app",
    repo: "https://github.com/sanskritim05/real-estate-rag-assistant",
    caseStudy: {
      timeline: "2025",
      tools: ["Python", "LangChain", "ChromaDB", "FastAPI", "React"],
      skills: ["Retrieval Augmented Generation", "Chunking + Embeddings", "Full Stack"],
      problem:
        "Leases and property reports are long, and the answer to a simple question is usually one clause buried on page forty. An answer without a page reference is not something anyone can act on, so citations had to be part of the retrieval design rather than an afterthought.",
      summary:
        "A document-grounded Q&A tool that answers from your own lease or property file, not general knowledge.",
      process: [
        {
          label: "Chunking for citation",
          body: "Chunked documents with page metadata attached so retrieved passages carry their location through to the answer.",
        },
        {
          label: "Vector retrieval",
          body: "Indexed embeddings in ChromaDB and tuned retrieval depth so answers stay grounded without flooding the context window.",
        },
        {
          label: "Stack around it",
          body: "Wrapped the pipeline in FastAPI and a React upload-and-chat interface that shows citations next to each answer.",
        },
      ],
      outcome:
        "The result is an assistant you can actually trust with a lease: ask in plain English, get an answer, and check the exact page it came from.",
      results: [
        "Answers grounded in the uploaded document",
        "Exact page citation on every response",
        "Upload to answer in a single interface",
      ],
    },
  },
  {
    slug: "clinical-risk-prediction",
    title: "Clinical Risk Prediction",
    subtitle: "Calibrated 30-day readmission risk with SHAP explainability",
    blurb:
      "Enter a patient's admission data and get a calibrated 30-day readmission risk score, with SHAP explanations showing exactly what drove the number.",
    role: "Solo Developer",
    period: "2025",
    tags: ["Python", "Scikit-learn", "FastAPI", "React"],
    accent: "oklch(0.84 0.06 30)",
    image: clinicalRiskScreenshot,
    link: "https://clinical-risk-prediction-calibrated.vercel.app",
    repo: "https://github.com/sanskritim05/clinical-risk-prediction-calibrated",
    caseStudy: {
      timeline: "2025",
      tools: ["Python", "Scikit-learn", "FastAPI", "React"],
      skills: ["Modeling", "Calibration", "Model Explainability"],
      problem:
        "A readmission score is only useful if the number means what it says and the reasoning is visible. An uncalibrated model that ranks well can still report a sixty percent risk for a group that reads at thirty, so calibration and explanation mattered as much as raw accuracy.",
      summary:
        "A calibrated 30-day readmission model that shows its work on every prediction.",
      process: [
        {
          label: "Baseline and features",
          body: "Started from an interpretable baseline and built features from admission history and clinical fields before reaching for anything heavier.",
        },
        {
          label: "Calibration",
          body: "Calibrated predicted probabilities so a reported risk matches observed readmission rates, and checked reliability by decile.",
        },
        {
          label: "Explainability and serving",
          body: "Added SHAP attributions per prediction and served the model through FastAPI with a React view of score plus drivers.",
        },
      ],
      outcome:
        "The result is a risk score a clinician can actually act on: a calibrated probability paired with the exact factors that drove it.",
      results: [
        "Calibrated probabilities rather than raw scores",
        "Per-prediction factor attribution with SHAP",
        "Model served through an API and simple UI",
      ],
    },
  },
];

export const experience = [
  {
    role: "Research Assistant",
    company: "Weill Cornell Medicine",
    period: "Aug 2026 - Present",
    note: "",
    tags: [] as string[],
  },
  {
    role: "Software Engineering Intern",
    company: "Universal Selfcare",
    period: "Feb 2026 - Present",
    note: "Working across the full stack on a live healthcare portal. Built Go services that route patient-reported outcomes into alert systems, stabilized a large React/TypeScript codebase after production-blocking merge failures, and designed subscription-cycle scheduling logic for time-locked patient content.",
    tags: ["React", "TypeScript", "Go", "Google Cloud"],
  },
  {
    role: "Research Assistant, Computer Vision",
    company: "Aresty Center, Rutgers",
    period: "Sept 2025 - June 2026",
    note: "Building a low-cost alternative to lab-grade water testing. The pipeline estimates chlorine concentration from smartphone photos using preprocessing, augmentation, and engineered color features across RGB, HSV, and LAB, with emphasis on generalization across lighting and devices.",
    tags: ["Python", "Computer Vision", "Scikit-learn", "Feature Engineering"],
  },
  {
    role: "Learning Assistant",
    company: "Rutgers University",
    period: "Aug 2025 - May 2026",
    note: "Led weekly recitation sections for Data Structures and Calculus 1, helping students build the reasoning to solve problems themselves. Collaborated with faculty on instructional materials and graded weekly work across both courses.",
    tags: [] as string[],
  },
  {
    role: "AI/ML Fellow",
    company: "Break Through Tech · Cornell Tech",
    period: "Feb 2025 - May 2026",
    note: "Selected from over 3,000 applicants for a fellowship focused on applied AI and underrepresented voices in tech. Built hands-on ML projects, worked with industry mentors, and completed Cornell-backed machine-learning certification.",
    tags: [] as string[],
  },
  {
    role: "AI Fellow",
    company: "Nestlé Americas",
    period: "Aug 2025 - Dec 2025",
    note: "Worked on a large-scale NLP project using Amazon Grocery reviews to surface emerging flavor trends. Built sentiment baselines with VADER and Logistic Regression, fine-tuned RoBERTa, and designed a trend score combining growth velocity, popularity, and sentiment momentum.",
    tags: ["Python", "RoBERTa", "TF-IDF", "NLP", "Trend Analysis"],
  },
  {
    role: "Extern",
    company: "Rutgers Food Innovation Center",
    period: "Jan 2025 - May 2025",
    note: "Rebuilt parts of the application review process with a Python web app for lead scoring, Microsoft Teams and HubSpot API integrations for scheduling and tracking, and a cleaner client-facing intake frontend.",
    tags: ["Python", "REST", "SQL", "HubSpot API", "Microsoft Teams API"],
  },
];

export const skills: Record<string, string[]> = {
  ai: ["LangGraph", "Strands Agents", "LangChain", "RAG", "NLP"],
  engineering: ["Python", "FastAPI", "Go", "React", "TypeScript", "SQL"],
  ml: ["Scikit-learn", "PyTorch", "Computer Vision", "Model Explainability"],
};

export const education = [
  {
    school: "Cornell University · Cornell Tech",
    detail:
      "M.S. Applied Information Science & M.S. Information Systems, concentration in Health Tech",
    period: "Aug 2026 onwards, New York City",
  },
  {
    school: "Rutgers University, New Brunswick",
    detail: "B.S. Computer Science & Cognitive Science, Dean's List",
    period: "Sept 2023 - May 2026",
  },
];

export const publication = {
  title:
    "From One Big Prompt to a Production Pipeline: Multi-Agent AI with Strands Agents",
  date: "April 2026",
  body: "A technical article on building a multi-agent LLM pipeline with more reliability than a single-prompt system, using specialist agents, structured routing, and production-minded checks.",
  link: "https://medium.com/@sanskritimalakar/from-one-big-prompt-to-a-production-pipeline-multi-agent-ai-with-strands-agents-9bbf7c31b056",
};

export const certificates = [
  {
    title: "AWS Certified AI Practitioner",
    date: "Jan 2025",
    image: awsAiPractitionerCert,
  },
  {
    title: "AWS Certified Cloud Practitioner",
    date: "Sept 2024",
    image: awsCloudPractitionerCert,
  },
  {
    title: "Machine Learning Fundamentals Nanodegree (Udacity x AWS)",
    date: "Apr - Oct 2024",
    image: awsMlFundamentalsCert,
  },
  {
    title: "AI Programming with Python Nanodegree (Udacity x AWS)",
    date: "Oct 2023 - Feb 2024",
    image: aiProgrammingCert,
  },
];
