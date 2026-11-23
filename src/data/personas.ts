export type Persona = "recruiter" | "engineer" | "curious";

export const PERSONA_ORDER: Persona[] = ["recruiter", "engineer", "curious"];

export interface PersonaCopy {
  label: string;
  blurb: string;
  /** Hero lead. `[[spring:...]]` and `[[rag:...]]` mark spans that light up the 3D clusters. */
  lead: string;
  suggestions: string[];
  showDebug: boolean;
  pom: boolean;
}

const base: PersonaCopy = {
  label: "visitor",
  blurb: "",
  lead: "Software engineer building [[spring:Spring Boot microservices]] and [[rag:AI RAG platforms]], from the API layer down to the retrieval pipeline.",
  suggestions: [
    "What did you build at OCP Solutions?",
    "Tell me about the Spring Boot microservices",
    "How does your hybrid retrieval work?",
    "Are you open to relocation?",
  ],
  showDebug: false,
  pom: true,
};

export const PERSONAS: Record<Persona, PersonaCopy> = {
  recruiter: {
    ...base,
    label: "recruiter",
    blurb: "The essentials, fast.",
    lead: "State Engineer in Computer Science (EMSI, 2026) building [[spring:Spring Boot microservices]] and [[rag:production AI RAG platforms]]. Looking for a full-time role in an English-first team, and open to relocation.",
    suggestions: [
      "Are you open to relocation?",
      "What did you build at OCP Solutions?",
      "What's your Spring Boot experience?",
      "How can I contact you?",
    ],
    pom: false,
  },
  engineer: {
    ...base,
    label: "engineer",
    blurb: "Show me how it works.",
    lead: "[[spring:Spring Boot microservices]] on one side, [[rag:RAG infrastructure]] on the other: hybrid retrieval, Graph RAG and LLM-as-a-Judge evaluation, running in production.",
    suggestions: [
      "How does your hybrid retrieval work?",
      "What is BYOM?",
      "Tell me about the Spring Boot microservices",
      "How does this site search?",
    ],
    showDebug: true,
  },
  curious: {
    ...base,
    label: "curious",
    blurb: "Surprise me.",
    lead: "Welcome to my vector space. Every point is something I've built, learned or shipped, across [[spring:Spring Boot]] and [[rag:AI RAG]]. Ask it anything, or just go exploring.",
    suggestions: ["Who are you?", "What's the flagship project?", "What's next for you?", "What's your favorite pizza?"],
  },
};

export const personaCopy = (persona: Persona | null): PersonaCopy => (persona ? PERSONAS[persona] : base);
