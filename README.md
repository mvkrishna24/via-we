# Via-We — The Digital Consultation Experience

> **Your Dreams. Our Aim.**

Not a website — a guided, cinematic consultation inside Vijay's virtual office.
Visitors are greeted by the Via-We logo assembling from 9,000 particles, meet a
holographic executive presence inspired by founder **Vijay Budati**, walk into a
procedural 3D boardroom, answer a conversational discovery, receive a tailored
growth blueprint, explore the Via-We service ecosystem, and convert through
WhatsApp / scheduling / proposal — with every lead fanned out to Supabase, n8n,
email and Google Sheets.

A fully crawlable **classic site** lives beneath the experience for SEO,
accessibility and visitors in a hurry.

---

## The journey (10 scenes)

| # | Scene | What happens |
|---|-------|--------------|
| 1 | **Arrival** | Dark space, ambient particles; the real logo (pixel-sampled from brand assets) assembles from thousands of particles; tagline beats in. |
| 2 | **Meet Vijay** | Vijay's holographic digital twin appears — wireframe executive bust in the brand's triangulated-mesh language, with breathing, scan-beam and cursor-tracking eye contact. He greets the visitor line by line. |
| 3 | **Who are you?** | 9 personas (Doctor, Lawyer, Founder, Restaurant Owner…). Selection triggers a cinematic "tailoring" interstitial. |
| 4 | **Boardroom** | A true camera dolly through a procedural executive boardroom — glass table, light columns, floor grid, city bokeh. |
| 5 | **Discovery** | A conversation, not a form: ownership → industry → services → budget → challenge → 12-month goals, answered with chips and single lines. |
| 6 | **Blueprint** | A deterministic strategy engine composes an executive dossier: business type, stage, needs, budget and three strategy pillars. |
| 7 | **Ecosystem** | The particle field forms three orbital rings behind a radial map of 8 disciplines around the VIA-WE core; nodes matching the visitor's blueprint glow. |
| 8 | **Portfolio** | Case studies played as four-act films: Challenge → Strategy → Execution → Result. |
| 9 | **Trust** | Animated counters, industries marquee, client voices. |
| 10 | **Convert** | Vijay closes the session. Lead capture with four intents: WhatsApp Vijay, Schedule Consultation, Request Proposal, Book Meeting. |

A chapter rail (right edge) lets visitors revisit scenes; a persistent WhatsApp
lifeline floats bottom-left; "Classic site ↓" is always one click away.

## Design language

Everything derives from the official brand guidelines:

- **Palette** — upper curve `#1b4b77` / `#3582ad`, lower curve `#3b8ec0` /
  `#4ad3f3`, deep-midnight surfaces from the guideline cover. Defined as
  Tailwind v4 `@theme` tokens (`abyss`, `midnight`, `navy`, `steel`, `azure`,
  `cyan`, `ice`, `silver`, `mist`).
- **Typography** — brand spec is Deadhead Bold + Roboto Medium. Deadhead is a
  commercial font, so the build ships **Fraunces** (a sharp-serif stand-in with
  the same executive presence) + **Roboto variable**, self-hosted as latin-subset
  woff2 (~105 KB total, zero layout shift). Drop licensed Deadhead files into
  `src/fonts` and swap one line in `src/app/layout.tsx` when available.
- **The mesh motif** — the triangulated pattern inside the logo's lower curve
  (which the guidelines say represents the client–company connection) becomes
  the 3D language: the particle field, the avatar's wireframe shell, the
  boardroom grid.

### Why a holographic avatar (a deliberate choice)

The brief asks for a premium stylized representation of Vijay — explicitly not
a cartoon. Photoreal 3D humans read as uncanny at web budgets; cartoon avatars
read as childish. The executive **hologram** — a suit-silhouette digital twin in
brand wireframe, with composed idle motion and eye contact — delivers presence,
trust and the Iron-Man/Jarvis feel while staying premium at 60 fps on ordinary
hardware. His photo-real identity appears where photos belong: the ID-card
brand asset, WhatsApp, and real consultations.

## Stack

- **Next.js 15** (App Router) · **TypeScript** (strict) · **Tailwind CSS v4**
- **Three.js + React Three Fiber** — one persistent canvas: morphing particle
  system (custom GLSL, GPU-sized soft sprites, cursor repulsion), holographic
  avatar, procedural boardroom, GSAP-driven camera rig
- **GSAP** (scene choreography, camera, particle morphs) · **Framer Motion**
  (scene/UI transitions) · **Lenis** (classic-site smooth scroll)
- **Zod**-validated lead API · **Supabase** storage · **n8n / Resend / Sheets**
  fan-out · deploys anywhere Next runs (**Vercel** recommended)

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm typecheck
```

Works with zero configuration — every integration degrades gracefully
(WhatsApp deep-linking always works). Copy `.env.example` to `.env.local` to
enable the automation channels.

## Lead automation

`POST /api/lead` validates the consultation payload and fans it out in
parallel; one failing channel never blocks another:

| Channel | Env vars | Notes |
|---------|----------|-------|
| **Supabase** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Run `supabase/migrations/0001_leads.sql` first (RLS enabled; only the service role writes). |
| **n8n** | `N8N_WEBHOOK_URL` | Receives `{ event: "via-we.lead.created", lead }` — fan out to CRM, Google Sheets, WhatsApp Business API from one workflow. |
| **Email** | `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `LEAD_NOTIFY_FROM` | Plain-text notification per lead via Resend. |
| **Google Sheets** | `SHEETS_WEBHOOK_URL` | Optional direct Apps-Script web-app append (n8n already covers Sheets). |

Captured per lead: name, business type (persona), industry, requirements,
budget, challenge, goals, contact, preferred channel, intent, generated
summary, lead source, timestamp.

**Suggested n8n recipe:** Webhook → Google Sheets *(append row)* →
WhatsApp Business Cloud *(notify Vijay)* → CRM node → IF intent = "proposal" →
Gmail draft.

## Performance & accessibility

- Three.js loads **outside** the critical path (`next/dynamic`, ssr:false);
  first-load JS for the page is ~173 KB.
- Particle count halves on small screens / low-memory devices; DPR capped at 1.75.
- `prefers-reduced-motion` collapses every animation to instant states.
- Focus management per scene, keyboard-reachable journey, `aria-live`-safe
  typewriter, semantic classic site server-rendered for crawlers.
- SEO: metadata + OpenGraph, JSON-LD `ProfessionalService`, sitemap, robots,
  manifest.

## Content honesty

Case studies and client voices are **representative engagements** modelled on
Via-We's real service playbooks (the F&B own-outlet and franchise scopes come
from actual company posters) and are labelled as such in the UI. Replace with
client-approved stories in `src/data/content.ts` as they're collected — all
copy lives in that one file.

---

© Via-We Services Pvt. Ltd. · Labbipet, Vijayawada · Visakhapatnam · Guntur · Mangalagiri
