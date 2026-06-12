"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { personas, type Persona } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { SceneShell, VijayBadge } from "../ui/primitives";

/**
 * Scene 3 — Who are you? Selecting a persona triggers a cinematic
 * "tailoring" interstitial, then walks into the boardroom.
 */
export function ScenePersona() {
  const { gotoScene, updateConsultation, reducedMotion } = useExperience();
  const [chosen, setChosen] = useState<Persona | null>(null);

  const choose = (p: Persona) => {
    if (chosen) return;
    setChosen(p);
    updateConsultation({ personaId: p.id, industry: p.industryHint === "Other" ? "" : p.industryHint });
    setTimeout(() => gotoScene("boardroom"), reducedMotion ? 250 : 2600);
  };

  return (
    <SceneShell id="persona" align="start">
      <div className="w-full max-w-5xl">
        <VijayBadge />
        <h2 className="mt-6 font-display text-3xl font-medium text-ice sm:text-4xl">
          First — who am I speaking with?
        </h2>
        <p className="mt-2.5 max-w-xl text-mist">
          Your consultation adapts to your world: the questions, the strategy,
          even the room we meet in.
        </p>

        <div className="mt-9 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-3">
          {personas.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.06 * i, duration: 0.5 }}
              onClick={() => choose(p)}
              disabled={!!chosen}
              className="group glass cursor-pointer rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 focus-visible:outline-none focus-visible:ring-glow disabled:cursor-default sm:p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl border border-steel/40 bg-deep/70 text-cyan transition-colors group-hover:border-cyan/60 group-hover:bg-cyan/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={p.icon} />
                </svg>
              </span>
              <span className="mt-4 block font-medium text-ice">{p.label}</span>
              <span className="mt-1 block text-xs tracking-wide text-mist">{p.attire}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* transformation interstitial */}
      <AnimatePresence>
        {chosen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-abyss/82 backdrop-blur-xl"
          >
            <div className="mx-5 max-w-lg text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-cyan/50 bg-deep/80 text-cyan ring-glow"
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={chosen.icon} />
                </svg>
              </motion.span>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="mt-7 text-xs uppercase tracking-[0.3em] text-cyan/90"
              >
                Tailoring your consultation — {chosen.attire}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-4 font-display text-2xl leading-snug text-ice sm:text-3xl"
              >
                “{chosen.greeting}”
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="mt-5 text-sm text-mist"
              >
                — Vijay
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  );
}
