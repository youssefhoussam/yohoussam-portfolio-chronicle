// Single source of truth for the portfolio content. Edit here to update the site.

export const profile = {
  name: "Youssef Houssam",
  role: "Software Engineer",
  tracks: "Spring Boot × AI RAG",
  degree: "State Engineer in Computer Science",
  school: "EMSI Casablanca",
  graduation: "2026",
  location: "Casablanca, Morocco",
  email: "youssefhoussam88@gmail.com",
  phone: "+212 664 352 796",
  phoneHref: "tel:+212664352796",
  github: "https://github.com/youssefhoussam",
  githubLabel: "github.com/youssefhoussam",
  linkedin: "https://www.linkedin.com/in/youssef-houssam-66b02b357/",
  linkedinLabel: "linkedin.com/in/youssef-houssam-66b02b357",
  sourceRepo: "https://github.com/youssefhoussam/yohoussam-portfolio-chronicle",
};

export interface Experience {
  id: string;
  branch: string;
  title: string;
  note?: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
  technologies: string[];
  color: string;
}

export const experiences: Experience[] = [
  {
    id: "ocp-solutions",
    branch: "feat/rag-platform",
    title: "AI & Backend Engineering Intern",
    note: "Final-year project (PFE)",
    company: "OCP Solutions",
    location: "Casablanca, Morocco",
    period: "Feb 2026 — Jul 2026",
    highlights: [
      "Designed a four-layer modular RAG platform (SDK, Engine, Pipeline, Use Cases) deployed in production.",
      "Built the BYOM abstraction framework with five abstract base classes for full component swappability.",
      "Implemented hybrid retrieval (semantic + BM25, RRF, Small-to-Big) and a Graph RAG extension.",
      "Developed an LLM-as-a-Judge evaluation module with automated PASS/FAIL scoring.",
    ],
    technologies: ["Python", "Docling", "Milvus", "MinIO", "vLLM", "Gradio", "NetworkX"],
    color: "#f5a524",
  },
  {
    id: "ocp-maintenance",
    branch: "feat/stockmaster",
    title: "Full-Stack Engineering Intern",
    company: "OCP Maintenance Solutions",
    location: "Casablanca, Morocco",
    period: "Jul 2025 — Sep 2025",
    highlights: [
      "Built StockMaster, a multi-tenant SaaS inventory platform for 4+ industrial sites.",
      "Implemented 3-level RBAC, real-time alerts, an audit trail, and advanced exports.",
    ],
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Inertia.js", "Tailwind CSS"],
    color: "#f5a524",
  },
  {
    id: "emsi-lab",
    branch: "feat/emsishop",
    title: "Software Development Intern",
    company: "EMSI Research Lab",
    location: "Casablanca, Morocco",
    period: "Jul 2024",
    highlights: ["Built EmsiShop, an e-commerce platform with product management, stock control, and order tracking."],
    technologies: ["Python", "Django", "SQLite", "Bootstrap"],
    color: "#f5a524",
  },
];

export type Track = "spring-boot" | "ai-rag" | "web" | "mobile";

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  technologies: string[];
  tracks: Track[];
  status: string;
  live?: boolean;
  featured?: boolean;
  github?: string;
}

export const projects: Project[] = [
  {
    id: "ocps-rag",
    slug: "ocps-rag-playground",
    title: "OCPS RAG Playground",
    subtitle: "AI knowledge management platform",
    description: "Modular RAG platform with hybrid retrieval, Graph RAG, and LLM-as-a-Judge evaluation.",
    details:
      "A four-layer modular RAG platform deployed in production at OCP Solutions, built with BYOM abstractions and a plug-and-play architecture for knowledge workflows.",
    technologies: ["Python", "Docling", "Milvus", "MinIO", "vLLM", "Gradio", "NetworkX"],
    tracks: ["ai-rag"],
    status: "Live in production",
    live: true,
    featured: true,
  },
  {
    id: "incubation",
    slug: "startup-incubation-platform",
    title: "Start-up Incubation Platform with AI",
    subtitle: "Spring Boot microservices + AI matching",
    description: "A four-service platform using AI to generate pitch decks and support investor–start-up matching.",
    details:
      "An AI-assisted start-up incubation platform built on a Spring Boot microservices architecture with intelligent matching workflows.",
    technologies: ["Spring Boot", "Microservices", "PostgreSQL", "Gemini AI"],
    tracks: ["spring-boot", "ai-rag"],
    status: "Microservices architecture",
  },
  {
    id: "stockmaster",
    slug: "stockmaster",
    title: "StockMaster",
    subtitle: "Multi-tenant inventory system",
    description: "SaaS inventory platform for 4+ industrial sites with data isolation, RBAC, alerts, and reporting.",
    details:
      "A multi-tenant inventory management system focused on secure data isolation, role-based access, automated alerts, and operational reporting.",
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Tailwind CSS"],
    tracks: ["web"],
    status: "Industrial SaaS",
    github: "https://github.com/youssefhoussam/Gestion-de-Stock-app",
  },
  {
    id: "presence",
    slug: "emsi-smart-presence",
    title: "EMSI Smart Presence",
    subtitle: "Campus attendance app",
    description: "Mobile application for faculty attendance tracking with real-time sync and campus navigation.",
    details:
      "A practical Android app for attendance management, campus navigation, and document access using real-time Firebase synchronization.",
    technologies: ["Java", "Android Studio", "Firebase", "Google Maps API"],
    tracks: ["mobile"],
    status: "Campus tool",
  },
  {
    id: "emsishop",
    slug: "emsishop",
    title: "EmsiShop",
    subtitle: "E-commerce platform",
    description: "A merchant-focused storefront with stock control, admin management, and order tracking.",
    details:
      "An e-commerce platform for merchants with physical product management, stock handling, and an admin interface for order processing.",
    technologies: ["Python", "Django", "SQLite", "Bootstrap"],
    tracks: ["web"],
    status: "Completed",
    github: "https://github.com/youssefhoussam/projet-python",
  },
];

export type NamespaceId = "backend" | "ai" | "frontend" | "data";

export interface SkillNamespace {
  id: NamespaceId;
  label: string;
  title: string;
  color: string;
  skills: { name: string; note?: string }[];
}

export const skillNamespaces: SkillNamespace[] = [
  {
    id: "backend",
    label: "backend",
    title: "Backend & frameworks",
    color: "#e9e2d4",
    skills: [
      { name: "Spring Boot", note: "4-service incubation platform" },
      { name: "Microservices", note: "Service-oriented architecture" },
      { name: "Java" },
      { name: "Python", note: "RAG platform at OCP Solutions" },
      { name: "FastAPI" },
      { name: "Django", note: "EmsiShop" },
      { name: "Laravel", note: "StockMaster" },
      { name: "C#" },
      { name: "ASP.NET Core" },
    ],
  },
  {
    id: "ai",
    label: "ai-rag",
    title: "AI & retrieval",
    color: "#e9e2d4",
    skills: [
      { name: "RAG pipelines", note: "In production at OCP Solutions" },
      { name: "LLM integration", note: "vLLM · Gemini AI" },
      { name: "Vector search", note: "Milvus" },
      { name: "BM25", note: "Hybrid retrieval with RRF" },
      { name: "Graph RAG", note: "NetworkX" },
      { name: "LLM-as-a-Judge", note: "Automated PASS/FAIL" },
      { name: "Docling", note: "Document parsing" },
      { name: "vLLM", note: "Model serving" },
      { name: "Milvus", note: "Vector database" },
    ],
  },
  {
    id: "frontend",
    label: "frontend",
    title: "Frontend",
    color: "#e9e2d4",
    skills: [
      { name: "React", note: "This site" },
      { name: "Vue.js", note: "StockMaster" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    id: "data",
    label: "data-infra",
    title: "Data & infrastructure",
    color: "#e9e2d4",
    skills: [
      { name: "PostgreSQL", note: "Incubation platform" },
      { name: "MySQL", note: "StockMaster" },
      { name: "MongoDB" },
      { name: "Firebase", note: "EMSI Smart Presence" },
      { name: "Oracle PL/SQL" },
      { name: "Docker" },
      { name: "Git" },
      { name: "GitHub" },
      { name: "Azure" },
      { name: "CI/CD" },
    ],
  },
];

/** Extra edges in the service mesh between skills that are used together. */
export const crossLinks: [string, string][] = [
  ["Spring Boot", "Microservices"],
  ["Spring Boot", "Java"],
  ["Spring Boot", "PostgreSQL"],
  ["Python", "FastAPI"],
  ["Python", "Django"],
  ["Python", "RAG pipelines"],
  ["RAG pipelines", "Vector search"],
  ["RAG pipelines", "BM25"],
  ["RAG pipelines", "Graph RAG"],
  ["RAG pipelines", "Docling"],
  ["Vector search", "Milvus"],
  ["LLM integration", "vLLM"],
  ["Laravel", "MySQL"],
  ["Laravel", "Vue.js"],
  ["React", "Next.js"],
  ["React", "TypeScript"],
  ["TypeScript", "JavaScript"],
  ["C#", "ASP.NET Core"],
  ["Docker", "CI/CD"],
  ["Microservices", "Docker"],
  ["Git", "GitHub"],
];

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  description: string;
  groupId: string;
  artifactId: string;
  version: string;
}

export const education: EducationItem[] = [
  {
    degree: "State Engineering Degree — Computer Science",
    school: "EMSI Casablanca",
    period: "2021 — 2026",
    description:
      "Specialization in Software Engineering and Networks, with a strong focus on system architecture and applied software development.",
    groupId: "ma.emsi",
    artifactId: "state-engineer-computer-science",
    version: "2026",
  },
  {
    degree: "Baccalaureate — Physical Sciences",
    school: "Lycée Taha Hussein, Casablanca",
    period: "2021",
    description: "Completed in Casablanca with a strong scientific foundation.",
    groupId: "ma.lycee-taha-hussein",
    artifactId: "baccalaureate-physical-sciences",
    version: "2021",
  },
];

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  groupId: string;
  artifactId: string;
}

export const certifications: Certification[] = [
  {
    name: "Software Design & Project Management",
    issuer: "Coursera",
    year: "2024",
    groupId: "org.coursera",
    artifactId: "software-design-project-management",
  },
  { name: "Design Patterns", issuer: "Coursera", year: "2024", groupId: "org.coursera", artifactId: "design-patterns" },
  { name: "React Basics", issuer: "Meta", year: "2024", groupId: "com.meta", artifactId: "react-basics" },
  {
    name: "Python Programming",
    issuer: "University of Michigan",
    year: "2023",
    groupId: "edu.umich",
    artifactId: "python-programming",
  },
];

export interface Release {
  version: string;
  status: "shipped" | "in progress" | "next";
  title: string;
  description: string;
  items: string[];
}

export const releases: Release[] = [
  {
    version: "v2026.0",
    status: "shipped",
    title: "Graduation build",
    description: "State Engineer in Computer Science from EMSI Casablanca, with a production RAG platform shipped at OCP Solutions.",
    items: ["State Engineering Degree — EMSI 2026", "Production RAG platform at OCP Solutions"],
  },
  {
    version: "v2026.1",
    status: "in progress",
    title: "Build systems that ship",
    description: "From backend services to AI-powered platforms, I focus on reliable architecture and production-ready delivery.",
    items: ["Spring Boot microservices", "RAG infrastructure", "Production deployment"],
  },
  {
    version: "v2026.2",
    status: "in progress",
    title: "Create intelligent products",
    description: "Pairing software engineering with modern AI workflows to build tools that feel useful and measurable.",
    items: ["Hybrid retrieval", "Graph RAG", "LLM evaluation"],
  },
  {
    version: "next",
    status: "next",
    title: "Grow in global teams",
    description: "My next step is contributing in English-first environments where strong engineering and clear communication matter.",
    items: ["English-first collaboration", "Remote-friendly teams", "Open to relocation", "Full-time opportunities"],
  },
];

export const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
