import {
  Bug,
  CircleDot,
  Crown,
  Gavel,
  Handshake,
  MessageSquareText,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type AchievementId =
  | "handshake"
  | "first-query"
  | "abstained"
  | "stargazer"
  | "outlier"
  | "mesh"
  | "terminal"
  | "sudo"
  | "judge"
  | "konami"
  | "console"
  | "full-trace";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  hint: string;
  icon: LucideIcon;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "handshake", title: "Handshake", description: "Told the gateway who you are.", hint: "Every request starts with an introduction.", icon: Handshake },
  { id: "first-query", title: "First query", description: "Asked the portfolio a question.", hint: "The search bar is not decorative.", icon: MessageSquareText },
  { id: "abstained", title: "No hallucinations", description: "Made the judge refuse to guess.", hint: "Ask something the portfolio can't know.", icon: ShieldCheck },
  { id: "stargazer", title: "Stargazer", description: "Read a chunk straight from the vector space.", hint: "The stars in the background are clickable.", icon: Sparkles },
  { id: "outlier", title: "Outlier", description: "Found the point that doesn't belong.", hint: "Every dataset has one. Look up and to the right.", icon: CircleDot },
  { id: "mesh", title: "Chaos engineer", description: "Dragged a service across the mesh.", hint: "Services can be moved. Gently.", icon: Network },
  { id: "terminal", title: "Shell access", description: "Opened the terminal.", hint: "Try the key above Tab.", icon: Terminal },
  { id: "sudo", title: "Root privileges", description: "Ran the one command every recruiter should know.", hint: "sudo make me a sandwich? Close.", icon: Crown },
  { id: "judge", title: "Certified judge", description: "Scored 5 or more in Spot the Hallucination.", hint: "Chapter 06 needs a judge.", icon: Gavel },
  { id: "konami", title: "Debug mode", description: "Entered a very old code.", hint: "↑ ↑ ↓ ↓ ← → ← → B A", icon: Bug },
  { id: "console", title: "DevTools whisperer", description: "Said hello from the browser console.", hint: "Engineers open DevTools. There's a note waiting.", icon: Wand2 },
  { id: "full-trace", title: "Full trace", description: "Followed the request all the way to 200 OK.", hint: "Scroll to the end of the trace.", icon: Route },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<AchievementId, Achievement>;
