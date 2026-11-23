# Youssef Houssam — Portfolio

Personal portfolio of Youssef Houssam, Software Engineer specialized in **Spring Boot microservices** and **AI RAG platforms**.

**Live site:** https://youssefhoussam.github.io/yohoussam-portfolio-chronicle/

The portfolio is itself a small RAG system. Visitors type questions into a real retriever that runs in the browser
(BM25 + TF-IDF character-trigram vectors, fused with Reciprocal Rank Fusion, plus a grounding judge that refuses to
answer without evidence). A 3D vector space of the knowledge base reacts as they type. The page reads as a request
travelling through nine "spans":

| # | Chapter | What it is |
|---|---------|------------|
| 01 | gateway | Hero + "ask anything" search over the knowledge base |
| 02 | services | Profile and skills as a draggable service mesh |
| 03 | pipeline | Scroll-driven walkthrough of the production RAG platform |
| 04 | commits | Experience as a git commit graph |
| 05 | deployments | Projects, filterable by track |
| 06 | judge | "Spot the hallucination" mini-game |
| 07 | dependencies | Education and certifications as a `pom.xml` |
| 08 | releases | Roadmap as release notes |
| 09 | response | Contact, with an HTTP-request message composer |

Extras: a boot sequence that adapts the site to the visitor (recruiter / engineer / curious), a usage guide (press `?`),
a terminal (press `` ` `` or use "Explore by terminal" in the hero), a journey panel that always shows where you are and
what's next, 13 hidden achievements, a Konami-code debug mode, and a note for anyone who opens DevTools.

Design: one accent colour (amber, like classic terminal phosphor) on warm neutrals, with heavy Inter Tight headlines.

## Tech stack

- [Vite](https://vitejs.dev/) + React 18 + TypeScript
- Tailwind CSS (+ shadcn/ui primitives)
- three.js + React Three Fiber v8 (lazy-loaded) for the vector space
- framer-motion for animation, lucide-react for icons

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into docs/
npm run lint     # lint the codebase
npm run preview  # preview the production build
```

## Editing content

- **Everything visible** (profile, experience, projects, skills, education, roadmap): `src/data/portfolio.ts`
- **What the search can answer**: `src/data/knowledge.ts`. Each chunk is a true, first-person statement, and each one
  is also a star in the 3D scene.
- **Mini-game claims**: `src/data/judge.ts`
- **Persona-specific copy** (hero text, suggested questions): `src/data/personas.ts`

## Project structure

```
src/
  data/                 # content, knowledge base, personas, achievements, game claims
  lib/
    retrieval.ts        # BM25 + trigram vectors + RRF + grounding judge
    app.ts              # shared state and actions (persona, queries, achievements…)
  scene/                # WebGL vector space (React Three Fiber, custom shaders)
  components/
    experience/         # boot sequence, HUD, trace navigation, terminal, toasts, scene layer
    chapters/           # the nine chapters + footer
    ui/                 # shadcn/ui primitives
  pages/                # Index (single page) and NotFound
  index.css             # design tokens and global styles
```

The experience respects `prefers-reduced-motion`, falls back gracefully without WebGL, and keeps the 3D bundle out of
the initial load.

## Deployment

The site is served by GitHub Pages from the `docs/` folder on the `main` branch.

1. Run `npm run build`. Vite outputs the site to `docs/` (base path `/yohoussam-portfolio-chronicle/`).
2. Commit the updated `docs/` folder and push to `main`.
