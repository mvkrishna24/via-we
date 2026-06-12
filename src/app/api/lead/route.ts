import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { company } from "@/data/content";

export const runtime = "nodejs";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  personaId: z.string().max(40).default(""),
  ownership: z.string().max(40).default(""),
  industry: z.string().max(160).default(""),
  services: z.array(z.string().max(60)).max(20).default([]),
  budget: z.string().max(40).default(""),
  challenge: z.string().max(300).default(""),
  goals: z.string().max(500).default(""),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{8,15}$/, "Invalid phone number"),
  email: z.union([z.literal(""), z.email().max(160)]).default(""),
  preferredChannel: z.enum(["whatsapp", "call", "email"]).default("whatsapp"),
  intent: z.enum(["whatsapp", "schedule", "proposal", "meeting"]).default("whatsapp"),
  summary: z.string().max(2000).default(""),
  leadSource: z.string().max(80).default("consultation-experience"),
  submittedAt: z.iso.datetime().optional(),
});

type Lead = z.infer<typeof leadSchema>;

/**
 * Lead intake — fans the consultation out to every configured channel.
 * Each integration is optional and independent: one failing (or being
 * unconfigured) never blocks the others, and never loses the lead for
 * the visitor, who always gets the WhatsApp handoff client-side.
 */
export async function POST(req: Request) {
  let lead: Lead;
  try {
    lead = leadSchema.parse(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid lead payload" : "Malformed request body";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const record = {
    ...lead,
    submittedAt: lead.submittedAt ?? new Date().toISOString(),
  };

  const results = await Promise.allSettled([
    storeInSupabase(record),
    notifyN8n(record),
    notifyEmail(record),
    appendToSheets(record),
  ]);

  results.forEach((r, i) => {
    const channel = ["supabase", "n8n", "resend", "sheets"][i];
    if (r.status === "rejected") {
      console.error(`[lead] ${channel} integration failed:`, r.reason);
    }
  });

  const delivered = results.some((r) => r.status === "fulfilled" && r.value === true);
  if (!delivered) {
    // No channel configured or all failed — still log so the lead is
    // recoverable from server logs during early setup.
    console.warn("[lead] no delivery channel succeeded; payload:", JSON.stringify(record));
  }

  return NextResponse.json({ ok: true });
}

async function storeInSupabase(lead: Lead): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    persona: lead.personaId,
    ownership: lead.ownership,
    industry: lead.industry,
    services: lead.services,
    budget: lead.budget,
    challenge: lead.challenge,
    goals: lead.goals,
    phone: lead.phone,
    email: lead.email || null,
    preferred_channel: lead.preferredChannel,
    intent: lead.intent,
    summary: lead.summary,
    lead_source: lead.leadSource,
    submitted_at: lead.submittedAt,
  });
  if (error) throw new Error(error.message);
  return true;
}

async function notifyN8n(lead: Lead): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "via-we.lead.created", lead }),
  });
  if (!res.ok) throw new Error(`n8n webhook responded ${res.status}`);
  return true;
}

async function notifyEmail(lead: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const to = process.env.LEAD_NOTIFY_TO ?? company.email;
  const from = process.env.LEAD_NOTIFY_FROM ?? "Via-We Website <onboarding@resend.dev>";
  const lines = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    `Intent: ${lead.intent} (prefers ${lead.preferredChannel})`,
    `Source: ${lead.leadSource}`,
    `Submitted: ${lead.submittedAt}`,
    "",
    lead.summary || "(no summary generated)",
  ].filter((l): l is string => l !== null);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New lead: ${lead.name} — ${lead.industry || "general enquiry"}`,
      text: lines.join("\n"),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  return true;
}

async function appendToSheets(lead: Lead): Promise<boolean> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: lead.submittedAt,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      businessType: lead.personaId,
      industry: lead.industry,
      requirements: lead.services.join(", "),
      budget: lead.budget,
      challenge: lead.challenge,
      goals: lead.goals,
      intent: lead.intent,
      leadSource: lead.leadSource,
      summary: lead.summary,
    }),
  });
  if (!res.ok) throw new Error(`Sheets webhook responded ${res.status}`);
  return true;
}
