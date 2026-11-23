import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { Commits } from "@/components/chapters/Commits";
import { Dependencies } from "@/components/chapters/Dependencies";
import { Deployments } from "@/components/chapters/Deployments";
import { Footer } from "@/components/chapters/Footer";
import { Gateway } from "@/components/chapters/Gateway";
import { JudgeGame } from "@/components/chapters/JudgeGame";
import { Pipeline } from "@/components/chapters/Pipeline";
import { Releases } from "@/components/chapters/Releases";
import { Response } from "@/components/chapters/Response";
import { Services } from "@/components/chapters/Services";
import { BootSequence } from "@/components/experience/BootSequence";
import { Hud } from "@/components/experience/Hud";
import { MobileMenu, TraceNav } from "@/components/experience/Navigation";
import { DebugOverlay, Grain, Toasts } from "@/components/experience/Overlays";
import { SceneLayer } from "@/components/experience/SceneLayer";
import { Terminal } from "@/components/experience/Terminal";
import { useChapterTracking, useConsoleGreeting, useScrollLock, useSecrets } from "@/hooks/useExperience";
import { useApp } from "@/lib/app";

const Index = () => {
  const phase = useApp((s) => s.phase);
  const bootCount = useApp((s) => s.bootCount);
  const shellRef = useRef<HTMLDivElement>(null);

  useChapterTracking();
  useSecrets();
  useConsoleGreeting();
  useScrollLock(phase === "boot");

  // Keep keyboard and screen-reader users inside the boot dialog while it is open.
  useEffect(() => {
    shellRef.current?.toggleAttribute("inert", phase === "boot");
  }, [phase]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-paper">
      <button
        onClick={() => document.getElementById("main")?.focus()}
        className="sr-only z-[120] rounded-full bg-spring px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </button>

      <SceneLayer />

      <div ref={shellRef}>
        <Hud />
        <TraceNav />
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          <Gateway />
          <Services />
          <Pipeline />
          <Commits />
          <Deployments />
          <JudgeGame />
          <Dependencies />
          <Releases />
          <Response />
        </main>
        <Footer />
      </div>

      <AnimatePresence>{phase === "boot" && <BootSequence key={`boot-${bootCount}`} />}</AnimatePresence>
      <MobileMenu />
      <Terminal />
      <Toasts />
      <DebugOverlay />
      <Grain />
    </div>
  );
};

export default Index;
