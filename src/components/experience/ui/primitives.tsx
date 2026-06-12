"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ── Buttons ────────────────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "subtle";
};

export function CtaButton({ variant = "primary", className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "group relative inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-glow disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-navy via-azure to-steel text-ice shadow-[0_8px_32px_-8px_rgba(74,211,243,0.45)] hover:shadow-[0_10px_44px_-6px_rgba(74,211,243,0.65)] hover:brightness-110 active:scale-[0.98]",
        variant === "ghost" &&
          "border border-steel/40 text-silver hover:border-cyan/60 hover:text-ice hover:bg-cyan/5 active:scale-[0.98]",
        variant === "subtle" && "text-mist hover:text-cyan underline-offset-4 hover:underline px-3 py-2",
        className,
      )}
    >
      {children}
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(110deg,transparent_30%,rgba(234,244,251,0.18)_50%,transparent_70%)]"
        />
      )}
    </button>
  );
}

export function Chip({
  active,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={clsx(
        "cursor-pointer rounded-full border px-4.5 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-glow active:scale-[0.97]",
        active
          ? "border-cyan/70 bg-cyan/12 text-ice ring-glow"
          : "border-steel/35 bg-midnight/40 text-silver hover:border-cyan/50 hover:text-ice hover:bg-cyan/6",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ── Typewriter dialogue (Vijay speaking) ───────────────────────────── */

export function TypeText({
  text,
  speed = 18,
  delay = 0,
  instant = false,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  delay?: number;
  instant?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState(instant ? text.length : 0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    if (instant) {
      setShown(text.length);
      onDone?.();
      return;
    }
    setShown(0);
    let i = 0;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= text.length) {
          clearInterval(timer);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, shown)}</span>
      {shown < text.length && (
        <span aria-hidden className="animate-caret text-cyan">
          ▍
        </span>
      )}
    </span>
  );
}

/* ── Scene wrapper: consistent enter/exit + focus management ────────── */

export function SceneShell({
  id,
  className,
  children,
  align = "center",
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // move focus to the scene for keyboard / screen-reader continuity
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.section
      key={id}
      ref={ref}
      tabIndex={-1}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -22, filter: "blur(6px)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "absolute inset-0 flex flex-col overflow-y-auto px-5 pb-24 pt-20 outline-none sm:px-10 md:pt-24",
        align === "center" ? "items-center justify-center" : "items-center justify-start",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

/* ── Vijay identity chip shown alongside his dialogue ───────────────── */

export function VijayBadge({ status = "Live consultation" }: { status?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-11 items-center justify-center rounded-full border border-cyan/40 bg-deep/80">
        <span className="font-display text-lg font-semibold text-cyan">VB</span>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(74,211,243,0.9)]" />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-ice">Vijay Budati</p>
        <p className="text-xs tracking-wide text-mist">
          Chief Executive Officer · <span className="text-cyan/90">{status}</span>
        </p>
      </div>
    </div>
  );
}
