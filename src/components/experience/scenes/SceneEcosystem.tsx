"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ecosystem, type EcosystemNode } from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell } from "../ui/primitives";

/**
 * Scene 7 — The Via-We ecosystem: a radial business operating system.
 * Eight service constellations orbit the brand core, joined by glowing
 * pathways; behind it the particle field forms matching orbital rings.
 */
export function SceneEcosystem() {
  const { gotoScene, consultation, reducedMotion } = useExperience();
  const [active, setActive] = useState<EcosystemNode | null>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const layout = useMemo(() => {
    const R = 38; // % of container
    return ecosystem.map((node, i) => {
      const angle = (i / ecosystem.length) * Math.PI * 2 - Math.PI / 2;
      return {
        node,
        x: 50 + Math.cos(angle) * R,
        y: 50 + Math.sin(angle) * R * 0.92,
      };
    });
  }, []);

  const recommended = new Set(
    consultation.services.length
      ? ecosystem
          .filter((n) =>
            consultation.services.some((s) => n.id.includes(s.split("-")[0]) || s.includes(n.id)),
          )
          .map((n) => n.id)
      : [],
  );

  return (
    <SceneShell id="ecosystem" align="start">
      <div className="w-full max-w-5xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/90">The Via-We Ecosystem</p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ice sm:text-4xl">
          One operating system for your entire business
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-mist">
          Thirteen services, eight disciplines, one accountable team — every pathway connects
          back to your growth.
        </p>

        {compact ? (
          /* mobile: vertical constellation */
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {ecosystem.map((node) => (
              <button
                key={node.id}
                onClick={() => setActive(node)}
                className={clsx(
                  "glass cursor-pointer rounded-2xl p-4 transition-all focus-visible:outline-none focus-visible:ring-glow",
                  recommended.has(node.id) && "border-cyan/50",
                )}
              >
                <p className="font-medium text-ice">{node.label}</p>
                <p className="mt-1 text-xs text-mist">{node.tagline}</p>
              </button>
            ))}
          </div>
        ) : (
          /* desktop: radial map */
          <div className="relative mx-auto mt-6 aspect-[1.45/1] w-full max-w-3xl">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="path-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ad3f3" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#1b4b77" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {layout.map(({ node, x, y }, i) => (
                <motion.line
                  key={node.id}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="url(#path-grad)"
                  strokeWidth="0.22"
                  strokeDasharray="1.6 1.1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: reducedMotion ? 0 : 0.35 + i * 0.08, duration: reducedMotion ? 0 : 0.9 }}
                />
              ))}
            </svg>

            {/* core */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/2 z-10 flex size-30 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan/45 bg-deep/85 ring-glow backdrop-blur"
            >
              <span className="font-display text-xl font-semibold tracking-wide text-gradient-brand">VIA-WE</span>
              <span className="mt-0.5 text-[9px] uppercase tracking-[0.26em] text-mist">Growth Core</span>
            </motion.div>

            {layout.map(({ node, x, y }, i) => (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.5 + i * 0.08, duration: 0.55 }}
                onClick={() => setActive(node)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={clsx(
                  "group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border px-4 py-2.5 text-sm backdrop-blur transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-glow",
                  recommended.has(node.id)
                    ? "border-cyan/70 bg-cyan/14 text-ice ring-glow"
                    : "border-steel/40 bg-midnight/70 text-silver hover:border-cyan/60 hover:text-ice",
                )}
              >
                {node.label}
                {recommended.has(node.id) && (
                  <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(74,211,243,0.9)]" />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {consultation.services.length > 0 && (
          <p className="mt-3 text-xs text-cyan/80">● Highlighted nodes match your blueprint</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <CtaButton onClick={() => gotoScene("portfolio")}>See the work</CtaButton>
          <CtaButton variant="ghost" onClick={() => gotoScene("convert")}>
            Talk to Vijay
          </CtaButton>
        </div>
      </div>

      {/* service detail sheet */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-end justify-center bg-abyss/70 backdrop-blur-sm sm:items-center"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={active.label}
              className="glass-bright m-4 w-full max-w-md rounded-3xl p-7"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-cyan/90">{active.tagline}</p>
              <h3 className="mt-2 font-display text-2xl text-ice">{active.label}</h3>
              <ul className="mt-5 space-y-2.5">
                {active.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] text-silver">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton onClick={() => gotoScene("convert")}>Discuss this</CtaButton>
                <CtaButton variant="ghost" onClick={() => setActive(null)}>
                  Close
                </CtaButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  );
}
