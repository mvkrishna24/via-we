"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { company, industriesServed, stats, testimonials } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell } from "../ui/primitives";

function Counter({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.6, delay, ease: "easeOut" });
    return controls.stop;
  }, [mv, value, delay]);
  return <motion.span>{rounded}</motion.span>;
}

/**
 * Scene 9 — Trust & authority: numbers, industries and client voices.
 */
export function SceneTrust() {
  const { gotoScene, reducedMotion } = useExperience();

  return (
    <SceneShell id="trust" align="start">
      <div className="w-full max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/90">Trust &amp; authority</p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ice sm:text-4xl">
          Built in {company.branches[0]}. Trusted across Andhra&nbsp;Pradesh.
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : i * 0.12, duration: 0.6 }}
              className="glass rounded-2xl px-4 py-6"
            >
              <p className="font-display text-4xl text-gradient-brand">
                {reducedMotion ? `${s.value}${s.suffix}` : <Counter value={s.value} suffix={s.suffix} delay={0.3 + i * 0.12} />}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-mist">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* industries marquee */}
        <div
          className="mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          aria-label={`Industries served: ${industriesServed.join(", ")}`}
        >
          <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none" aria-hidden>
            {[...industriesServed, ...industriesServed].map((ind, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full border border-steel/30 bg-midnight/50 px-5 py-2 text-sm text-silver"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-9 grid gap-3.5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.35 + i * 0.15, duration: 0.6 }}
              className="glass flex flex-col rounded-2xl p-5 text-left"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" className="text-cyan/70" fill="currentColor" aria-hidden>
                <path d="M10 7v5a5 5 0 0 1-5 5v-2.5A2.5 2.5 0 0 0 7.5 12H5V7h5Zm9 0v5a5 5 0 0 1-5 5v-2.5a2.5 2.5 0 0 0 2.5-2.5H14V7h5Z" />
              </svg>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ice/90">{t.quote}</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-medium text-silver">{t.author}</span>
                <span className="block text-xs text-mist">{t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-mist/60">
          Client voices shown as representative summaries of delivered engagement types.
        </p>

        <div className="mt-8">
          <CtaButton onClick={() => gotoScene("convert")}>Complete your consultation</CtaButton>
        </div>
      </div>
    </SceneShell>
  );
}
