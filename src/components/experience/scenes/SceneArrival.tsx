"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { company } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell } from "../ui/primitives";

/**
 * Scene 1 — Immersive arrival. The logo assembles from particles on
 * the canvas behind; the copy enters in choreographed beats.
 */
export function SceneArrival() {
  const { gotoScene, setMode, reducedMotion } = useExperience();
  const [beat, setBeat] = useState(reducedMotion ? 3 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const timers = [
      setTimeout(() => setBeat(1), 2600),
      setTimeout(() => setBeat(2), 4400),
      setTimeout(() => setBeat(3), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return (
    <SceneShell id="arrival">
      <div className="flex h-full w-full max-w-3xl flex-col items-center justify-end pb-[8vh] text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: beat >= 1 ? 1 : 0 }}
          transition={{ duration: 1.1 }}
          className="rule-aim font-display text-3xl font-medium tracking-wide text-gradient-brand sm:text-5xl"
        >
          {company.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: beat >= 2 ? 1 : 0, y: beat >= 2 ? 0 : 14 }}
          transition={{ duration: 0.9 }}
          className="mt-7 text-base tracking-[0.18em] text-mist uppercase sm:text-lg"
        >
          Welcome to the future of business growth
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: beat >= 3 ? 1 : 0, y: beat >= 3 ? 0 : 18 }}
          transition={{ duration: 0.8 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <CtaButton onClick={() => gotoScene("meet")} disabled={beat < 3}>
            Enter the Experience
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CtaButton>
          <CtaButton variant="subtle" onClick={() => setMode("site")} disabled={beat < 3}>
            Skip — view the classic site
          </CtaButton>
        </motion.div>
      </div>
    </SceneShell>
  );
}
