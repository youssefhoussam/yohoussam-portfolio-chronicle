export type ChapterId =
  | "gateway"
  | "services"
  | "pipeline"
  | "commits"
  | "deployments"
  | "judge"
  | "dependencies"
  | "releases"
  | "response";

export type ClusterId = "spring" | "rag" | "experience" | "projects" | "education" | "profile";

export interface Chapter {
  id: ChapterId;
  index: string;
  label: string;
  title: string;
  route: string;
}

/** The story is a request travelling through Youssef's system, one span per chapter. */
export const CHAPTERS: Chapter[] = [
  { id: "gateway", index: "01", label: "gateway", title: "Ask anything", route: "GET /" },
  { id: "services", index: "02", label: "services", title: "Profile & stack", route: "GET /services" },
  { id: "pipeline", index: "03", label: "pipeline", title: "Flagship RAG platform", route: "POST /rag/query" },
  { id: "commits", index: "04", label: "commits", title: "Experience", route: "GET /git/log" },
  { id: "deployments", index: "05", label: "deployments", title: "Projects", route: "GET /deployments" },
  { id: "judge", index: "06", label: "judge", title: "Mini-game", route: "POST /judge" },
  { id: "dependencies", index: "07", label: "dependencies", title: "Education", route: "GET /pom.xml" },
  { id: "releases", index: "08", label: "releases", title: "Roadmap", route: "GET /releases" },
  { id: "response", index: "09", label: "response", title: "Contact", route: "HTTP/1.1 200 OK" },
];

export const CHAPTER_MAP = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;

export interface Cluster {
  id: ClusterId;
  label: string;
  color: string;
  position: [number, number, number];
}

/** Regions of the 3D vector space. Each knowledge chunk is a star inside one of them. */
export const CLUSTERS: Cluster[] = [
  { id: "spring", label: "spring boot · backend", color: "#e9e2d4", position: [-5.4, 1.4, -1.2] },
  { id: "rag", label: "ai · rag", color: "#e9e2d4", position: [5.2, 1.7, -0.8] },
  { id: "experience", label: "experience", color: "#e9e2d4", position: [-2.9, -2.7, 1.4] },
  { id: "projects", label: "projects", color: "#e9e2d4", position: [3.0, -2.5, 1.8] },
  { id: "education", label: "education", color: "#e9e2d4", position: [-0.6, 3.9, -3.4] },
  { id: "profile", label: "profile · contact", color: "#e9e2d4", position: [0.5, -0.3, -4.8] },
];

export const clusterIndex = (id: ClusterId) => CLUSTERS.findIndex((c) => c.id === id);
