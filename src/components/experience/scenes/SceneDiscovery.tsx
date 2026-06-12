"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  budgetOptions,
  challengeOptions,
  ownershipOptions,
  personas,
  services,
} from "@/data/content";
import { useExperience } from "../ExperienceContext";
import { Chip, CtaButton, SceneShell, TypeText, VijayBadge } from "../ui/primitives";

/**
 * Scene 5 — Business discovery. A conversation at the boardroom table,
 * not a form: Vijay asks, the visitor answers with chips or a line of
 * text, and each answer becomes part of the dialogue.
 */

type StepId = "name" | "ownership" | "industry" | "services" | "budget" | "challenge" | "goals";

const STEPS: StepId[] = ["name", "ownership", "industry", "services", "budget", "challenge", "goals"];

export function SceneDiscovery() {
  const { gotoScene, consultation, updateConsultation, reducedMotion } = useExperience();
  const [step, setStep] = useState(0);
  const [asked, setAsked] = useState(false);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const persona = personas.find((p) => p.id === consultation.personaId);
  const id = STEPS[step];

  const firstName = consultation.name.trim().split(/\s+/)[0] || "";

  const questions: Record<StepId, string> = {
    name: "Before we begin — what should I call you?",
    ownership: `${firstName ? `Good to meet you, ${firstName}. ` : ""}Do you currently own a business?`,
    industry:
      persona && persona.id !== "other"
        ? `You mentioned ${persona.industryHint.toLowerCase()} — shall I note that as your industry, or refine it?`
        : "What industry are you in — or planning to enter?",
    services: "Which services do you feel you need? Choose as many as apply.",
    budget: "What is your approximate budget for this initiative?",
    challenge: "And what is your biggest challenge right now?",
    goals: "Last one — what do you want this business to achieve in the next 12 months?",
  };

  useEffect(() => {
    setAsked(false);
    setDraft(id === "industry" ? consultation.industry : "");
    setPicked(id === "services" ? consultation.services : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [history, asked]);

  const record = (answerLabel: string, patch: Parameters<typeof updateConsultation>[0]) => {
    updateConsultation(patch);
    setHistory((h) => [...h, { q: questions[id], a: answerLabel }]);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setTimeout(() => gotoScene("summary"), reducedMotion ? 200 : 700);
    }
  };

  const back = () => {
    if (step === 0) return;
    setHistory((h) => h.slice(0, -1));
    setStep((s) => s - 1);
  };

  const submitText = () => {
    const v = draft.trim();
    if (!v) return;
    if (id === "name") record(v, { name: v });
    else if (id === "industry") record(v, { industry: v });
    else if (id === "goals") record(v, { goals: v });
  };

  return (
    <SceneShell id="discovery" align="start">
      <div className="flex w-full max-w-3xl flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <VijayBadge status="Listening" />
          <div className="flex items-center gap-1.5" aria-label={`Question ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={clsx(
                  "h-1 rounded-full transition-all duration-500",
                  i < step ? "w-5 bg-cyan/80" : i === step ? "w-8 bg-cyan" : "w-3 bg-steel/30",
                )}
              />
            ))}
          </div>
        </div>

        {/* conversation log */}
        <div
          ref={logRef}
          className="mt-6 flex max-h-[28vh] flex-col gap-3 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,transparent,black_18%)]"
        >
          {history.map((h, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm text-mist">{h.q}</p>
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm border border-cyan/25 bg-cyan/10 px-4 py-2 text-sm text-ice">
                {h.a}
              </p>
            </div>
          ))}
        </div>

        {/* current question */}
        <div className="glass mt-5 rounded-3xl p-6 sm:p-8">
          <p className="min-h-16 font-display text-xl leading-relaxed text-ice sm:text-2xl">
            <TypeText
              key={id}
              text={questions[id]}
              instant={reducedMotion}
              speed={14}
              onDone={() => setAsked(true)}
            />
          </p>

          <AnimatePresence mode="wait">
            {asked && (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="mt-6"
              >
                {(id === "name" || id === "goals" || id === "industry") && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitText();
                    }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={
                        id === "name"
                          ? "Your name"
                          : id === "industry"
                            ? "e.g. Multi-specialty clinic, cloud kitchen…"
                            : "e.g. Open two outlets and build a hiring pipeline"
                      }
                      maxLength={id === "goals" ? 240 : 80}
                      className="flex-1 rounded-full border border-steel/40 bg-midnight/60 px-5 py-3 text-ice placeholder:text-mist/60 focus:border-cyan/60 focus:outline-none focus:ring-glow"
                    />
                    <CtaButton type="submit" disabled={!draft.trim()}>
                      {id === "goals" ? "Finish" : "Continue"}
                    </CtaButton>
                  </form>
                )}

                {id === "ownership" && (
                  <div className="flex flex-wrap gap-2.5">
                    {ownershipOptions.map((o) => (
                      <Chip key={o.id} onClick={() => record(o.label, { ownership: o.id })}>
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                )}

                {id === "budget" && (
                  <div className="flex flex-wrap gap-2.5">
                    {budgetOptions.map((o) => (
                      <Chip key={o.id} onClick={() => record(o.label, { budget: o.id })}>
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                )}

                {id === "challenge" && (
                  <div className="flex flex-wrap gap-2.5">
                    {challengeOptions.map((o) => (
                      <Chip key={o.id} onClick={() => record(o.label, { challenge: o.id })}>
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                )}

                {id === "services" && (
                  <div>
                    <div className="flex flex-wrap gap-2.5">
                      {services.map((s) => (
                        <Chip
                          key={s.id}
                          active={picked.includes(s.id)}
                          onClick={() =>
                            setPicked((cur) =>
                              cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id],
                            )
                          }
                        >
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                    <CtaButton
                      className="mt-5"
                      disabled={picked.length === 0}
                      onClick={() =>
                        record(
                          `${picked.length} service${picked.length > 1 ? "s" : ""} selected`,
                          { services: picked },
                        )
                      }
                    >
                      Confirm selection
                    </CtaButton>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <CtaButton variant="subtle" onClick={back} disabled={step === 0}>
            ← Previous question
          </CtaButton>
          <p className="text-xs text-mist/70">Your answers shape your strategy — nothing is sent yet.</p>
        </div>
      </div>
    </SceneShell>
  );
}
