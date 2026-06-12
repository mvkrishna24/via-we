"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell, TypeText, VijayBadge } from "../ui/primitives";

const INTRO = [
  "Welcome. I am Vijay.",
  "I help businesses launch, scale and transform — from the first signboard to the hundredth hire.",
  "Let's understand your vision.",
];

/**
 * Scene 2 — Meet Vijay. His holographic presence stands to the right
 * on the canvas; his words arrive line by line, like a real greeting.
 */
export function SceneMeetVijay() {
  const { gotoScene, reducedMotion } = useExperience();
  const [line, setLine] = useState(0);
  const ready = line >= INTRO.length;

  return (
    <SceneShell id="meet">
      <div className="grid w-full max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
        <div className="glass rounded-3xl p-7 sm:p-10">
          <VijayBadge />
          <div className="mt-7 min-h-44 space-y-4 font-display text-xl leading-relaxed text-ice/95 sm:text-2xl">
            {INTRO.slice(0, line + 1).map((text, i) => (
              <p key={i}>
                <TypeText
                  text={text}
                  instant={reducedMotion || i < line}
                  speed={16}
                  onDone={() => i === line && setLine((l) => l + 1)}
                />
              </p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <CtaButton onClick={() => gotoScene("persona")} disabled={!ready}>
              Begin Consultation
            </CtaButton>
            <CtaButton variant="ghost" onClick={() => gotoScene("ecosystem")} disabled={!ready}>
              Explore services first
            </CtaButton>
          </motion.div>
        </div>

        {/* the hologram itself lives on the canvas; this column reserves its stage */}
        <div className="hidden h-105 md:block" aria-hidden />
      </div>
    </SceneShell>
  );
}
