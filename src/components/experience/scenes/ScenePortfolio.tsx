"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { caseStudies } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell } from "../ui/primitives";

/**
 * Scene 8 — Portfolio storytelling. Each engagement plays as a
 * four-act film: Challenge → Strategy → Execution → Result.
 */

const ACTS = ["Challenge", "Strategy", "Execution", "Result"] as const;

export function ScenePortfolio() {
  const { gotoScene } = useExperience();
  const [caseIdx, setCaseIdx] = useState(0);
  const [act, setAct] = useState(0);

  const cs = caseStudies[caseIdx];
  const actText = [cs.challenge, cs.strategy, cs.execution, cs.result][act];
  const lastAct = act === ACTS.length - 1;

  const nextAct = () => {
    if (!lastAct) {
      setAct((a) => a + 1);
    } else if (caseIdx < caseStudies.length - 1) {
      setCaseIdx((c) => c + 1);
      setAct(0);
    } else {
      gotoScene("trust");
    }
  };

  return (
    <SceneShell id="portfolio" align="start">
      <div className="w-full max-w-4xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/90">
          The work · representative engagements
        </p>

        {/* case selector */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {caseStudies.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setCaseIdx(i);
                setAct(0);
              }}
              className={clsx(
                "cursor-pointer rounded-full border px-4 py-2 text-xs tracking-wide transition-all focus-visible:outline-none focus-visible:ring-glow",
                i === caseIdx
                  ? "border-cyan/70 bg-cyan/12 text-ice"
                  : "border-steel/35 text-mist hover:border-cyan/50 hover:text-ice",
              )}
            >
              {c.sector}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={cs.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <h2 className="max-w-2xl font-display text-2xl font-medium leading-snug text-ice sm:text-4xl">
              {cs.title}
            </h2>
            <p className="mt-2 text-sm text-mist">{cs.client}</p>

            {/* act timeline */}
            <div className="mt-8 flex items-center gap-0" role="tablist" aria-label="Engagement phases">
              {ACTS.map((a, i) => (
                <div key={a} className="flex flex-1 items-center last:flex-none">
                  <button
                    role="tab"
                    aria-selected={i === act}
                    onClick={() => setAct(i)}
                    className={clsx(
                      "cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-glow",
                      i === act
                        ? "border-cyan/70 bg-cyan/12 text-cyan"
                        : i < act
                          ? "border-steel/50 text-silver"
                          : "border-steel/25 text-mist/60 hover:text-silver",
                    )}
                  >
                    {a}
                  </button>
                  {i < ACTS.length - 1 && (
                    <span
                      className={clsx(
                        "mx-1.5 h-px flex-1 transition-colors duration-500",
                        i < act ? "bg-cyan/60" : "bg-steel/25",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={act}
                initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
                className="glass mt-5 min-h-36 rounded-3xl p-6 sm:p-8"
              >
                <p className="text-lg leading-relaxed text-ice/95">{actText}</p>
                {lastAct && (
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {cs.metrics.map((m) => (
                      <div key={m.label} className="rounded-2xl border border-cyan/25 bg-cyan/6 px-3 py-3 text-center">
                        <p className="font-display text-lg text-cyan">{m.value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-mist">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <CtaButton onClick={nextAct}>
            {!lastAct
              ? `Next: ${ACTS[act + 1]}`
              : caseIdx < caseStudies.length - 1
                ? "Next engagement"
                : "Why businesses trust us"}
          </CtaButton>
          <CtaButton variant="subtle" onClick={() => gotoScene("trust")}>
            Skip the case studies
          </CtaButton>
        </div>
      </div>
    </SceneShell>
  );
}
