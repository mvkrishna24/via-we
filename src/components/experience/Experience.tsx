"use client";

import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { company } from "@/data/content";
import {
  ExperienceProvider,
  SCENE_LABELS,
  SCENES,
  useExperience,
  type SceneId,
} from "./ExperienceContext";
import { SceneArrival } from "./scenes/SceneArrival";
import { SceneBoardroom } from "./scenes/SceneBoardroom";
import { SceneConversion } from "./scenes/SceneConversion";
import { SceneDiscovery } from "./scenes/SceneDiscovery";
import { SceneEcosystem } from "./scenes/SceneEcosystem";
import { SceneMeetVijay } from "./scenes/SceneMeetVijay";
import { ScenePersona } from "./scenes/ScenePersona";
import { ScenePortfolio } from "./scenes/ScenePortfolio";
import { SceneSummary } from "./scenes/SceneSummary";
import { SceneTrust } from "./scenes/SceneTrust";

const ExperienceCanvas = dynamic(
  () => import("./three/ExperienceCanvas").then((m) => m.ExperienceCanvas),
  { ssr: false },
);

const SCENE_COMPONENTS: Record<SceneId, React.ComponentType> = {
  arrival: SceneArrival,
  meet: SceneMeetVijay,
  persona: ScenePersona,
  boardroom: SceneBoardroom,
  discovery: SceneDiscovery,
  summary: SceneSummary,
  ecosystem: SceneEcosystem,
  portfolio: ScenePortfolio,
  trust: SceneTrust,
  convert: SceneConversion,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { scene, visited, mode, gotoScene, setMode } = useExperience();
  const Scene = SCENE_COMPONENTS[scene];
  const lenisRef = useRef<Lenis | null>(null);

  // buttery scrolling for the classic site once the journey releases the page
  useEffect(() => {
    if (mode === "site" && !lenisRef.current) {
      lenisRef.current = new Lenis({ autoRaf: true, lerp: 0.12 });
    }
    return () => {
      if (mode === "journey") {
        lenisRef.current?.destroy();
        lenisRef.current = null;
      }
    };
  }, [mode]);

  const waUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? company.phoneIntl}?text=${encodeURIComponent(
    "Hello Vijay, I'm visiting the Via-We website and would like to talk about my business.",
  )}`;

  return (
    <>
      <div className="relative h-dvh overflow-hidden bg-abyss">
        <ExperienceCanvas />

        {/* brand wordmark */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between px-5 py-5 sm:px-8">
          <button
            onClick={() => gotoScene("arrival")}
            className="pointer-events-auto cursor-pointer text-left focus-visible:outline-none focus-visible:ring-glow rounded-lg"
            aria-label="Via-We — restart experience"
          >
            <span className="font-display text-xl font-semibold tracking-[0.08em] text-ice">
              V<span className="text-cyan">ia</span>-W<span className="text-cyan">e</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.34em] text-mist">
              Your dreams our aim
            </span>
          </button>

          {mode === "journey" && scene !== "arrival" && (
            <button
              onClick={() => setMode("site")}
              className="pointer-events-auto cursor-pointer rounded-full border border-steel/35 bg-midnight/50 px-4 py-2 text-xs tracking-wide text-mist backdrop-blur transition-colors hover:border-cyan/50 hover:text-ice focus-visible:outline-none focus-visible:ring-glow"
            >
              Classic site ↓
            </button>
          )}
        </header>

        {/* scenes */}
        <main className="absolute inset-0 z-10">
          <AnimatePresence mode="wait">
            <Scene key={scene} />
          </AnimatePresence>
        </main>

        {/* chapter rail */}
        {scene !== "arrival" && (
          <nav
            aria-label="Experience chapters"
            className="absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
          >
            {SCENES.filter((s) => s !== "boardroom").map((s) => {
              const isCurrent = s === scene;
              const canGo = visited.has(s) || isCurrent;
              return (
                <button
                  key={s}
                  onClick={() => canGo && gotoScene(s)}
                  disabled={!canGo}
                  aria-current={isCurrent ? "step" : undefined}
                  className={clsx(
                    "group flex cursor-pointer items-center gap-2.5 focus-visible:outline-none disabled:cursor-default",
                  )}
                >
                  <span
                    className={clsx(
                      "text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                      isCurrent
                        ? "text-cyan opacity-100"
                        : "translate-x-1 text-mist opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                    )}
                  >
                    {SCENE_LABELS[s]}
                  </span>
                  <span
                    className={clsx(
                      "block rounded-full transition-all duration-300",
                      isCurrent
                        ? "size-2.5 bg-cyan shadow-[0_0_10px_rgba(74,211,243,0.9)]"
                        : canGo
                          ? "size-2 bg-steel/70 group-hover:bg-cyan/70"
                          : "size-1.5 bg-steel/30",
                    )}
                  />
                </button>
              );
            })}
          </nav>
        )}

        {/* persistent WhatsApp lifeline */}
        {scene !== "arrival" && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Vijay on WhatsApp"
            className="group absolute bottom-5 left-5 z-40 flex size-12 items-center justify-center rounded-full border border-cyan/40 bg-deep/80 text-cyan backdrop-blur transition-all hover:scale-105 hover:ring-glow focus-visible:outline-none focus-visible:ring-glow"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7a11 11 0 0 0 4.3 3.8c.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z" />
            </svg>
          </a>
        )}
      </div>

      {/* the crawlable, conversion-focused classic site */}
      {children}

      {mode === "site" && (
        <button
          onClick={() => setMode("journey")}
          className="fixed bottom-5 right-5 z-50 cursor-pointer rounded-full border border-cyan/45 bg-deep/85 px-5 py-3 text-sm text-ice backdrop-blur transition-all hover:ring-glow focus-visible:outline-none focus-visible:ring-glow"
        >
          ↺ Resume the experience
        </button>
      )}
    </>
  );
}

export function Experience({ children }: { children: React.ReactNode }) {
  return (
    <ExperienceProvider>
      <Shell>{children}</Shell>
    </ExperienceProvider>
  );
}
