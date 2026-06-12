"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { emptyConsultation, type Consultation } from "@/lib/types";

export const SCENES = [
  "arrival",
  "meet",
  "persona",
  "boardroom",
  "discovery",
  "summary",
  "ecosystem",
  "portfolio",
  "trust",
  "convert",
] as const;

export type SceneId = (typeof SCENES)[number];

export const SCENE_LABELS: Record<SceneId, string> = {
  arrival: "Arrival",
  meet: "Meet Vijay",
  persona: "You",
  boardroom: "Boardroom",
  discovery: "Discovery",
  summary: "Blueprint",
  ecosystem: "Ecosystem",
  portfolio: "Work",
  trust: "Trust",
  convert: "Connect",
};

export type Mode = "journey" | "site";

type ExperienceState = {
  scene: SceneId;
  visited: Set<SceneId>;
  mode: Mode;
  consultation: Consultation;
  reducedMotion: boolean;
  gotoScene: (s: SceneId) => void;
  setMode: (m: Mode) => void;
  updateConsultation: (patch: Partial<Consultation>) => void;
};

const ExperienceCtx = createContext<ExperienceState | null>(null);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [scene, setScene] = useState<SceneId>("arrival");
  const [mode, setModeState] = useState<Mode>("journey");
  const [consultation, setConsultation] = useState<Consultation>(emptyConsultation);
  const [reducedMotion, setReducedMotion] = useState(false);
  const visitedRef = useRef<Set<SceneId>>(new Set(["arrival"]));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Journey mode owns the viewport: the classic site below stays out of reach
  // until the visitor opts out or completes the consultation.
  useEffect(() => {
    document.body.style.overflow = mode === "journey" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mode]);

  const gotoScene = useCallback((s: SceneId) => {
    visitedRef.current.add(s);
    setScene(s);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    if (m === "site") {
      requestAnimationFrame(() => {
        document.getElementById("classic")?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  const updateConsultation = useCallback((patch: Partial<Consultation>) => {
    setConsultation((c) => ({ ...c, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      scene,
      visited: visitedRef.current,
      mode,
      consultation,
      reducedMotion,
      gotoScene,
      setMode,
      updateConsultation,
    }),
    [scene, mode, consultation, reducedMotion, gotoScene, setMode, updateConsultation],
  );

  return <ExperienceCtx.Provider value={value}>{children}</ExperienceCtx.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceCtx);
  if (!ctx) throw new Error("useExperience must be used within ExperienceProvider");
  return ctx;
}
