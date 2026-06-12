"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { company } from "@/data/content";
import { buildSummaryText, buildWhatsAppMessage } from "@/lib/strategy";
import type { LeadPayload } from "@/lib/types";
import { useExperience } from "../ExperienceContext";
import { CtaButton, SceneShell, TypeText, VijayBadge } from "../ui/primitives";

type Intent = LeadPayload["intent"];

const INTENTS: { id: Intent; label: string; desc: string }[] = [
  { id: "whatsapp", label: "WhatsApp Vijay", desc: "Continue this conversation directly" },
  { id: "schedule", label: "Schedule Consultation", desc: "Pick a time that suits you" },
  { id: "proposal", label: "Request Proposal", desc: "Receive a written plan & estimate" },
  { id: "meeting", label: "Book Meeting", desc: "In person — Vijayawada, Vizag, Guntur" },
];

/**
 * Scene 10 — Final conversion. Vijay closes the session; the visitor
 * leaves contact details and chooses how to continue. Submission flows
 * into Supabase / n8n / email / Sheets via /api/lead.
 */
export function SceneConversion() {
  const { consultation, updateConsultation, setMode, reducedMotion } = useExperience();
  const [intent, setIntent] = useState<Intent>("whatsapp");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [closingDone, setClosingDone] = useState(false);

  const summary = useMemo(() => buildSummaryText(consultation), [consultation]);
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? company.phoneIntl;
  const schedulerUrl = process.env.NEXT_PUBLIC_SCHEDULER_URL;

  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    buildWhatsAppMessage(consultation, summary),
  )}`;

  const validPhone = /^[+]?[\d\s-]{8,15}$/.test(phone.trim());
  const validEmail = email === "" || /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit = consultation.name.trim() !== "" && validPhone && validEmail && status !== "sending";

  const submit = async () => {
    if (!canSubmit) return;
    setStatus("sending");
    const payload: LeadPayload = {
      ...consultation,
      phone: phone.trim(),
      email: email.trim(),
      preferredChannel: intent === "whatsapp" ? "whatsapp" : intent === "proposal" ? "email" : "call",
      intent,
      summary,
      leadSource: "consultation-experience",
      submittedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Lead API responded ${res.status}`);
      setStatus("done");
      if (intent === "whatsapp") window.open(whatsappUrl, "_blank", "noopener");
      if (intent === "schedule" || intent === "meeting") {
        window.open(schedulerUrl || whatsappUrl, "_blank", "noopener");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <SceneShell id="convert" align="start">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)]">
        {/* Vijay's close — his hologram returns on the left of the canvas */}
        <div>
          <VijayBadge status="Closing the session" />
          <p className="mt-6 min-h-28 font-display text-xl leading-relaxed text-ice/95 sm:text-2xl">
            <TypeText
              text={`Thank you for sharing your vision${consultation.name ? `, ${consultation.name.split(/\s+/)[0]}` : ""}. Our team will review your requirements and connect with you personally.`}
              instant={reducedMotion}
              speed={15}
              onDone={() => setClosingDone(true)}
            />
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: closingDone ? 1 : 0 }}
            className="mt-4 space-y-1.5 text-sm text-mist"
          >
            <p>{company.headquarters}</p>
            <p>
              {company.phoneDisplay} · {company.email}
            </p>
          </motion.div>
        </div>

        {/* lead capture */}
        <AnimatePresence mode="wait">
          {status !== "done" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="glass rounded-3xl p-6 sm:p-8"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-cyan/90">Choose your next step</p>
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {INTENTS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setIntent(o.id)}
                    aria-pressed={intent === o.id}
                    className={clsx(
                      "cursor-pointer rounded-2xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-glow",
                      intent === o.id
                        ? "border-cyan/70 bg-cyan/10 ring-glow"
                        : "border-steel/35 hover:border-cyan/45",
                    )}
                  >
                    <p className="text-sm font-medium text-ice">{o.label}</p>
                    <p className="mt-0.5 text-xs text-mist">{o.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <input
                  value={consultation.name}
                  onChange={(e) => updateConsultation({ name: e.target.value })}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="w-full rounded-full border border-steel/40 bg-midnight/60 px-5 py-3 text-ice placeholder:text-mist/60 focus:border-cyan/60 focus:outline-none focus:ring-glow"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone / WhatsApp number"
                  aria-label="Phone or WhatsApp number"
                  inputMode="tel"
                  className="w-full rounded-full border border-steel/40 bg-midnight/60 px-5 py-3 text-ice placeholder:text-mist/60 focus:border-cyan/60 focus:outline-none focus:ring-glow"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  aria-label="Email address (optional)"
                  inputMode="email"
                  className="w-full rounded-full border border-steel/40 bg-midnight/60 px-5 py-3 text-ice placeholder:text-mist/60 focus:border-cyan/60 focus:outline-none focus:ring-glow"
                />
              </div>

              {status === "error" && (
                <p className="mt-3 text-sm text-red-300">
                  Something interrupted the submission — your details are safe. Try again, or reach
                  Vijay directly on WhatsApp below.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <CtaButton onClick={submit} disabled={!canSubmit}>
                  {status === "sending" ? "Sending…" : INTENTS.find((o) => o.id === intent)?.label}
                </CtaButton>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-mist underline-offset-4 hover:text-cyan hover:underline"
                >
                  Or open WhatsApp directly
                </a>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
                By continuing you agree to be contacted about your enquiry. Your blueprint travels
                with your message — no need to repeat yourself.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-bright flex flex-col items-start justify-center rounded-3xl p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-cyan/60 bg-cyan/10 text-cyan ring-glow">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m5 13 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl text-ice">Your vision is with us.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-silver">
                {company.founder.name.split(" ")[0]}&apos;s team will reach out within one business day.
                Keep the conversation moving any time:
              </p>
              <div className="mt-6 flex flex-wrap gap-3.5">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <CtaButton>WhatsApp Vijay</CtaButton>
                </a>
                <CtaButton variant="ghost" onClick={() => setMode("site")}>
                  Explore the classic site
                </CtaButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
