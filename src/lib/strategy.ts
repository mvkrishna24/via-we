import {
  budgetOptions,
  challengeOptions,
  ownershipOptions,
  personas,
  services,
} from "@/data/content";
import type { Consultation } from "@/lib/types";

export type Strategy = {
  businessType: string;
  stage: string;
  needs: string[];
  budget: string;
  pillars: { title: string; detail: string }[];
  headline: string;
  closing: string;
};

const label = (
  options: readonly { id: string; label: string }[],
  id: string,
  fallback = "—",
) => options.find((o) => o.id === id)?.label ?? fallback;

/**
 * Deterministic strategy composer. Maps the consultation answers onto
 * Via-We's service playbooks. Intentionally rule-based: instant, free,
 * private — and easily swapped for an LLM endpoint later.
 */
export function buildStrategy(c: Consultation): Strategy {
  const persona = personas.find((p) => p.id === c.personaId);
  const picked = services.filter((s) => c.services.includes(s.id));
  const needs = picked.map((s) => s.label);

  const stage =
    c.ownership === "yes"
      ? "Scaling an operating business"
      : c.ownership === "starting"
        ? "Launching a new venture"
        : "Evaluating the opportunity";

  const pillars: { title: string; detail: string }[] = [];

  // Pillar 1 — positioning, driven by the stated challenge
  switch (c.challenge) {
    case "visibility":
    case "branding":
      pillars.push({
        title: "Local Brand Positioning",
        detail: `Rebuild how ${c.industry || "your market"} sees you — identity, signage and a story that makes the first impression do the selling.`,
      });
      break;
    case "leads":
      pillars.push({
        title: "Demand Engine",
        detail: "Digital + offline campaigns tuned to your catchment area, so enquiries arrive on a schedule — not by accident.",
      });
      break;
    case "setup":
      pillars.push({
        title: "Turnkey Launch Program",
        detail: "One coordinated plan from location and interiors to POS and staffing — a single launch date everyone works to.",
      });
      break;
    case "hiring":
      pillars.push({
        title: "Team Building Sprint",
        detail: "Role mapping, screened recruitment and onboarding so growth lands on a team that's ready for it.",
      });
      break;
    case "expansion":
      pillars.push({
        title: "Expansion Playbook",
        detail: "Codify your outlet into a repeatable kit — agreements, location criteria, branding norms — then roll it out.",
      });
      break;
    default:
      pillars.push({
        title: "Foundation Audit",
        detail: "A structured review of brand, demand and operations to find the highest-leverage first move.",
      });
  }

  // Pillar 2 — the service stack they asked for
  if (needs.length > 0) {
    pillars.push({
      title: "Integrated Delivery",
      detail: `${needs.slice(0, 3).join(", ")}${needs.length > 3 ? ` and ${needs.length - 3} more` : ""} — delivered by one accountable team, not five disconnected vendors.`,
    });
  } else {
    pillars.push({
      title: "Service Stack Design",
      detail: "We'll shortlist the exact Via-We services your goal needs — nothing bundled that doesn't move the number.",
    });
  }

  // Pillar 3 — forward motion, persona aware
  pillars.push({
    title: "12-Month Growth Path",
    detail: c.goals
      ? `Milestones reverse-engineered from your goal: "${truncate(c.goals, 90)}" — reviewed with you at every stage.`
      : `A staged roadmap for ${persona?.industryHint.toLowerCase() ?? "your business"} with clear checkpoints, owners and budgets.`,
  });

  const budget = label(budgetOptions, c.budget, "To be advised");

  return {
    businessType: c.industry || persona?.industryHint || "Business",
    stage,
    needs: needs.length ? needs : ["Strategic consultation"],
    budget,
    pillars,
    headline: c.name
      ? `${firstName(c.name)}, here is your growth blueprint.`
      : "Here is your growth blueprint.",
    closing:
      "This is a starting hypothesis — in a working session we pressure-test it against your numbers and timeline.",
  };
}

export function buildSummaryText(c: Consultation): string {
  const s = buildStrategy(c);
  return [
    `Business: ${s.businessType}`,
    `Stage: ${s.stage}`,
    `Needs: ${s.needs.join(", ")}`,
    `Budget: ${s.budget}`,
    `Challenge: ${label(challengeOptions, c.challenge, c.challenge || "—")}`,
    `Ownership: ${label(ownershipOptions, c.ownership, c.ownership || "—")}`,
    c.goals ? `12-month goal: ${c.goals}` : null,
    `Strategy: ${s.pillars.map((p) => p.title).join(" + ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWhatsAppMessage(c: Consultation, summary?: string): string {
  const intro = c.name
    ? `Hello Vijay, I'm ${c.name}. I just completed the Via-We consultation experience.`
    : "Hello Vijay, I just completed the Via-We consultation experience.";
  return `${intro}\n\n${summary ?? buildSummaryText(c)}\n\nI'd like to discuss the next step.`;
}

const firstName = (full: string) => full.trim().split(/\s+/)[0];

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;
