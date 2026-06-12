"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { buildStrategy } from "@/lib/strategy";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell, VijayBadge } from "../ui/primitives";

/**
 * Scene 6 — The strategic blueprint: the consultation answers,
 * composed into an executive dossier.
 */
export function SceneSummary() {
  const { gotoScene, consultation, reducedMotion } = useExperience();
  const strategy = useMemo(() => buildStrategy(consultation), [consultation]);

  const facts = [
    { label: "Business Type", value: strategy.businessType },
    { label: "Stage", value: strategy.stage },
    { label: "Needs", value: strategy.needs.join(" · ") },
    { label: "Budget", value: strategy.budget },
  ];

  const d = (i: number) => (reducedMotion ? 0 : i);

  return (
    <SceneShell id="summary" align="start">
      <div className="w-full max-w-4xl">
        <VijayBadge status="Strategy drafted" />
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-6 font-display text-3xl font-medium text-ice sm:text-4xl"
        >
          {strategy.headline}
        </motion.h2>

        <div className="mt-9 grid gap-3.5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d(0.12 * i), duration: 0.55 }}
              className="glass rounded-2xl px-5 py-4"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan/80">{f.label}</p>
              <p className="mt-1.5 font-medium text-ice">{f.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 space-y-3.5">
          {strategy.pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: d(0.5 + 0.16 * i), duration: 0.6 }}
              className="glass-bright relative overflow-hidden rounded-2xl p-5 pl-6 sm:p-6 sm:pl-7"
            >
              <span className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-cyan via-azure to-navy" />
              <p className="font-display text-lg text-ice">
                <span className="mr-3 text-sm text-cyan/80">0{i + 1}</span>
                {p.title}
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-silver">{p.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d(1.1) }}
          className="mt-5 text-sm italic text-mist"
        >
          {strategy.closing}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(1.25), duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <CtaButton onClick={() => gotoScene("ecosystem")}>See how we execute this</CtaButton>
          <CtaButton variant="ghost" onClick={() => gotoScene("convert")}>
            Skip ahead — connect with Vijay
          </CtaButton>
        </motion.div>
      </div>
    </SceneShell>
  );
}
