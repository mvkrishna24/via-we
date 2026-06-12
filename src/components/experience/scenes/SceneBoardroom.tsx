"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { personas } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { SceneShell } from "../ui/primitives";

/**
 * Scene 4 — Walking into the executive boardroom. A pure cinematic
 * interstitial: the camera dollies through the procedural room on the
 * canvas while captions set the scene, then discovery begins.
 */
export function SceneBoardroom() {
  const { gotoScene, consultation, reducedMotion } = useExperience();
  const persona = personas.find((p) => p.id === consultation.personaId);

  useEffect(() => {
    const t = setTimeout(() => gotoScene("discovery"), reducedMotion ? 400 : 4200);
    return () => clearTimeout(t);
  }, [gotoScene, reducedMotion]);

  return (
    <SceneShell id="boardroom">
      <div className="pointer-events-none flex h-full w-full max-w-3xl flex-col items-center justify-end pb-[10vh] text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.32em" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="text-xs uppercase text-cyan/90 sm:text-sm"
        >
          Entering the executive boardroom
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 1.6, duration: 1 }}
          className="mt-5 font-display text-2xl text-ice/90 sm:text-3xl"
        >
          {persona && persona.id !== "other"
            ? `A private session, prepared for a ${persona.label.toLowerCase()}.`
            : "A private session, prepared for you."}
        </motion.p>
      </div>
    </SceneShell>
  );
}
