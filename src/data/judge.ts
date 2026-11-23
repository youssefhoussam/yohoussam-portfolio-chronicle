import type { ChapterId } from "./chapters";

/** Claims for "Spot the Hallucination". Grounded claims are true; the others are deliberately wrong. */
export interface Claim {
  id: string;
  claim: string;
  grounded: boolean;
  truth: string;
  chapter: ChapterId;
}

export const CLAIMS: Claim[] = [
  {
    id: "stockmaster-stack",
    claim: "Youssef built StockMaster, a multi-tenant SaaS inventory platform for 4+ industrial sites, with Laravel 12 and Vue.js 3.",
    grounded: true,
    truth: "Grounded. StockMaster runs on Laravel 12, Vue.js 3, Inertia.js and MySQL, with 3-level RBAC and real-time alerts.",
    chapter: "deployments",
  },
  {
    id: "vector-only",
    claim: "The RAG platform at OCP Solutions retrieves documents with vector search alone.",
    grounded: false,
    truth: "Hallucination. Retrieval is hybrid: semantic search plus BM25, fused with Reciprocal Rank Fusion, plus Small-to-Big.",
    chapter: "pipeline",
  },
  {
    id: "incubation",
    claim: "The Start-up Incubation Platform is built as Spring Boot microservices and uses Gemini AI.",
    grounded: true,
    truth: "Grounded. Four Spring Boot services on PostgreSQL, with Gemini AI generating pitch decks and matching start-ups with investors.",
    chapter: "deployments",
  },
  {
    id: "graduation",
    claim: "Youssef finished his engineering degree at EMSI back in 2019.",
    grounded: false,
    truth: "Hallucination. He studied at EMSI Casablanca from 2021 to 2026.",
    chapter: "dependencies",
  },
  {
    id: "presence-ios",
    claim: "EMSI Smart Presence is an iOS app written in Swift.",
    grounded: false,
    truth: "Hallucination. It is an Android app built with Java, Firebase and the Google Maps API.",
    chapter: "deployments",
  },
  {
    id: "judge-module",
    claim: "Answers from the OCP RAG platform are scored automatically by an LLM-as-a-Judge module.",
    grounded: true,
    truth: "Grounded. The evaluation module gives each answer an automated PASS/FAIL verdict.",
    chapter: "pipeline",
  },
  {
    id: "casablanca-only",
    claim: "Youssef is only considering roles in Casablanca.",
    grounded: false,
    truth: "Hallucination. He is open to relocation and to remote-friendly, English-first teams.",
    chapter: "response",
  },
  {
    id: "layers",
    claim: "The OCP platform has four layers: SDK, Engine, Pipeline and Use Cases.",
    grounded: true,
    truth: "Grounded. Four modular layers, plus a BYOM framework of five abstract base classes for swappable components.",
    chapter: "pipeline",
  },
  {
    id: "stockmaster-lab",
    claim: "StockMaster was built during the internship at the EMSI Research Lab.",
    grounded: false,
    truth: "Hallucination. StockMaster was built at OCP Maintenance Solutions (Jul–Sep 2025). The EMSI Research Lab internship produced EmsiShop.",
    chapter: "commits",
  },
];

export const ROUNDS = 6;

/** Six random claims with at least two of each kind. */
export function dealClaims(): Claim[] {
  for (;;) {
    const deck = [...CLAIMS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    const grounded = deck.filter((c) => c.grounded).length;
    if (grounded >= 2 && grounded <= ROUNDS - 2) return deck;
  }
}

export function rankFor(score: number) {
  if (score === ROUNDS) return { title: "Senior Judge", note: "Zero hallucinations slipped through. You'd fit right into an eval pipeline." };
  if (score >= 5) return { title: "Certified Judge", note: "Sharp eye. One more round and you'd be in production." };
  if (score >= 3) return { title: "Junior Judge", note: "Decent precision. The chapters above hold every answer." };
  return { title: "Needs more evals", note: "The model fooled you this time. Scroll up, read the sources, try again." };
}
