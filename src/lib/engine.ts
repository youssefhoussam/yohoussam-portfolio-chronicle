import { chunks } from "@/data/knowledge";
import { createEngine } from "./retrieval";

/** Singleton retriever over the portfolio knowledge base. */
export const engine = createEngine(chunks);
