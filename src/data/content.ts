/**
 * Via-We Services Pvt. Ltd. — brand content extracted from the official
 * brand guidelines, business card and marketing materials.
 */

export const company = {
  name: "Via-We Services Pvt. Ltd.",
  shortName: "VIA-WE",
  tagline: "Your Dreams. Our Aim.",
  founder: {
    name: "Vijay Budati",
    role: "Chief Executive Officer",
  },
  phoneDisplay: "+91 63045 79933",
  phoneIntl: "916304579933",
  email: "via.we.org@gmail.com",
  website: "https://www.via-we.com",
  headquarters: "Labbipet, near Vivanta, Vijayawada, Andhra Pradesh",
  branches: ["Vijayawada", "Visakhapatnam", "Guntur", "Mangalagiri"],
} as const;

/* ── Personas (Scene 3) ─────────────────────────────────────────────── */

export type Persona = {
  id: string;
  label: string;
  attire: string;
  greeting: string;
  industryHint: string;
  icon: string; // inline SVG path (24×24 viewBox)
};

export const personas: Persona[] = [
  {
    id: "doctor",
    label: "Doctor",
    attire: "White Coat",
    greeting: "Healthcare deserves a brand patients trust before they even walk in.",
    industryHint: "Healthcare",
    icon: "M12 3a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Zm-6 9h2a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.9V20a2 2 0 1 1-2 0v-2.1A6 6 0 0 1 6 12Z",
  },
  {
    id: "lawyer",
    label: "Lawyer",
    attire: "Formal Black Suit",
    greeting: "Authority is your product. Your presence should argue the case for you.",
    industryHint: "Legal",
    icon: "M12 3l8 4-8 4-8-4 8-4Zm-6 8l6 3 6-3v3.5c0 2-2.7 3.5-6 3.5s-6-1.5-6-3.5V11Z",
  },
  {
    id: "founder",
    label: "Startup Founder",
    attire: "Business Casual",
    greeting: "Speed wins markets. Let's compress your launch into weeks, not quarters.",
    industryHint: "Technology / Startup",
    icon: "M12 2c3.5 2 5 5.5 5 9l3 4-4-.6A9.5 9.5 0 0 1 12 19a9.5 9.5 0 0 1-4-4.6L4 15l3-4c0-3.5 1.5-7 5-9Zm0 6.5A1.5 1.5 0 1 0 12 11a1.5 1.5 0 0 0 0-3Z",
  },
  {
    id: "restaurant",
    label: "Restaurant Owner",
    attire: "Hospitality Style",
    greeting: "From counter setup to POS — we build food brands people queue for.",
    industryHint: "Food & Beverage",
    icon: "M5 3v8a2 2 0 0 0 2 2v8h2v-8a2 2 0 0 0 2-2V3H9v6H8V3H7v6H6V3H5Zm12 0c-1.7 0-3 2-3 5 0 2.2.8 3.7 2 4.5V21h2v-8.5c1.2-.8 2-2.3 2-4.5 0-3-1.3-5-3-5Z",
  },
  {
    id: "retail",
    label: "Retail Business",
    attire: "Storefront Smart",
    greeting: "Footfall follows visibility. Let's make your store impossible to ignore.",
    industryHint: "Retail",
    icon: "M4 4h16l1 5a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-6 0 3 3 0 0 1-3 3 3 3 0 0 1-3-3l1-5Zm1 9.7A5 5 0 0 0 7 14a5 5 0 0 0 5-2.4A5 5 0 0 0 17 14a5 5 0 0 0 2-.3V20H5v-6.3ZM9 16v4h6v-4H9Z",
  },
  {
    id: "student",
    label: "Student Entrepreneur",
    attire: "Campus Sharp",
    greeting: "Big dreams need structure. We turn ambition into a working business.",
    industryHint: "First Venture",
    icon: "M12 3l10 5-10 5L2 8l10-5Zm-6 9.5l6 3 6-3V17c0 2-2.7 4-6 4s-6-2-6-4v-4.5Z",
  },
  {
    id: "manufacturer",
    label: "Manufacturer",
    attire: "Industrial Executive",
    greeting: "You build products. We build the brand, people and reach around them.",
    industryHint: "Manufacturing",
    icon: "M3 21V10l6 3v-3l6 3V7l6-3v17H3Zm4-6h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z",
  },
  {
    id: "realestate",
    label: "Real Estate",
    attire: "Sharp Blazer",
    greeting: "Trust sells property. We position you as the name people recommend.",
    industryHint: "Real Estate",
    icon: "M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8Z",
  },
  {
    id: "other",
    label: "Something Else",
    attire: "Tailored For You",
    greeting: "Every great business starts as an exception. Tell me about yours.",
    industryHint: "Other",
    icon: "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 3a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 12 7Zm-1.3 4.3h2.6V17h-2.6v-5.7Z",
  },
];

/* ── Services (full 13-service catalogue) ───────────────────────────── */

export type Service = {
  id: string;
  label: string;
  blurb: string;
};

export const services: Service[] = [
  { id: "brand-building", label: "Brand Building", blurb: "Identity, positioning and a story your market remembers." },
  { id: "recruitment", label: "Recruitment", blurb: "The right people, screened and placed for your growth stage." },
  { id: "franchising", label: "Franchising", blurb: "Franchise models, agreements and outlet rollouts done right." },
  { id: "digital-marketing", label: "Digital Marketing", blurb: "Local positioning, lead generation and performance campaigns." },
  { id: "business-setup", label: "Business Setup", blurb: "From registration to ribbon-cutting — launch without friction." },
  { id: "product-services", label: "Product Services", blurb: "Sourcing, supply and product programs that keep shelves moving." },
  { id: "infrastructure", label: "Infrastructure Making", blurb: "Spaces engineered for operations, compliance and customers." },
  { id: "skill-development", label: "Skill Development", blurb: "Training and upskilling that make teams perform from day one." },
  { id: "graphic-design", label: "Graphic Designing", blurb: "Design systems, campaigns and collateral with executive polish." },
  { id: "printing", label: "Printing Services", blurb: "Production-grade print for everything your brand touches." },
  { id: "offline-marketing", label: "Offline Marketing", blurb: "Ground campaigns, signage and activations where buyers live." },
  { id: "location-setup", label: "Location Setup", blurb: "Prime-location scouting, finalization and launch readiness." },
  { id: "interior-finishing", label: "Interior Finishing", blurb: "Interiors that convert footfall into customers." },
];

/* ── Ecosystem map (Scene 7) ────────────────────────────────────────── */

export type EcosystemNode = {
  id: string;
  label: string;
  tagline: string;
  includes: string[];
};

export const ecosystem: EcosystemNode[] = [
  {
    id: "branding",
    label: "Branding",
    tagline: "Become the name your market remembers.",
    includes: ["Logo & identity systems", "Brand positioning", "LED signboards", "Menu & collateral design"],
  },
  {
    id: "marketing",
    label: "Marketing",
    tagline: "Demand, generated on schedule.",
    includes: ["Digital marketing & lead gen", "Local SEO & social", "Offline campaigns", "Launch activations"],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    tagline: "Teams that perform from week one.",
    includes: ["Role mapping", "Sourcing & screening", "Staff uniforms & onboarding", "Retention playbooks"],
  },
  {
    id: "franchising",
    label: "Franchising",
    tagline: "Multiply outlets, not headaches.",
    includes: ["Franchise agreements", "Legal documentation", "Brand-norm rollouts", "Outlet replication kits"],
  },
  {
    id: "business-setup",
    label: "Business Setup",
    tagline: "From paperwork to grand opening.",
    includes: ["Registration & licensing", "POS billing systems", "CCTV & utilities", "Launch checklists"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    tagline: "Spaces built to sell.",
    includes: ["Prime location finalization", "Counter & kitchen setup", "Interior finishing", "Furniture & equipment"],
  },
  {
    id: "skills",
    label: "Skill Development",
    tagline: "People grow. Business follows.",
    includes: ["Staff training programs", "Founder upskilling", "Service excellence drills", "Hiring-to-floor pipelines"],
  },
  {
    id: "design",
    label: "Design & Print",
    tagline: "Every touchpoint, executive grade.",
    includes: ["Graphic design", "Printing services", "Packaging & menus", "Campaign creatives"],
  },
];

/* ── Case studies (Scene 8) — representative engagements ────────────── */

export type CaseStudy = {
  id: string;
  sector: string;
  title: string;
  client: string;
  challenge: string;
  strategy: string;
  execution: string;
  result: string;
  metrics: { label: string; value: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "fnb-launch",
    sector: "Food & Beverage",
    title: "A food brand built from bare floor to first bill",
    client: "Quick-service restaurant · Vijayawada",
    challenge:
      "A first-time owner had a location lease and a recipe book — and nothing else. No brand, no interiors, no billing, no staff, and a landlord countdown already running.",
    strategy:
      "Run Via-We's full own-outlet playbook as one program: identity first, then space, then systems, then people — so every vendor works to a single launch date.",
    execution:
      "Logo & branding, LED signboard, counter setup, tables, lighting and false ceiling, floor matting, CCTV, POS billing, menu design, kitchen equipment, staff uniforms and water systems — coordinated end-to-end.",
    result:
      "The outlet opened on schedule as a complete brand, not a work-in-progress — serving customers from day one with billing, trained staff and full fit-out in place.",
    metrics: [
      { label: "Scope items delivered", value: "16+" },
      { label: "Coordination owner", value: "1 team" },
      { label: "Launch", value: "On date" },
    ],
  },
  {
    id: "franchise-rollout",
    sector: "Franchising",
    title: "One beverage counter, repeated as a system",
    client: "Beverage franchise · Andhra Pradesh",
    challenge:
      "A growing beverage brand wanted new outlets without reinventing the wheel each time — and franchisees wanted certainty about what their money buys.",
    strategy:
      "Codify the outlet into a replication kit: franchise agreement, legal documentation, location criteria, counter specification and branding norms — then execute it per site.",
    execution:
      "Agreements with franchise owners, registration, prime-location finalization, container/counter setup, furniture, brand-norm signage, menu display, CCTV, POS and staff uniforms — delivered per outlet.",
    result:
      "Each new outlet now opens from a known checklist with predictable cost and consistent branding — turning expansion from a project into a process.",
    metrics: [
      { label: "Outlet playbook", value: "Codified" },
      { label: "Setup variance", value: "Minimal" },
      { label: "Expansion", value: "Repeatable" },
    ],
  },
  {
    id: "clinic-growth",
    sector: "Healthcare",
    title: "A clinic that patients find before they need directions",
    client: "Specialty clinic · Guntur",
    challenge:
      "Excellent doctors, invisible clinic. New patients defaulted to bigger hospital brands, and hiring support staff was slow and ad-hoc.",
    strategy:
      "Local brand positioning plus always-on lead generation, with recruitment running in parallel so new demand lands on a staffed front desk.",
    execution:
      "Refreshed identity and signage, Google-first local presence, targeted digital campaigns for priority treatments, and screened hiring for reception and assistants.",
    result:
      "The clinic became a searchable, recommendable local brand with a steady appointment pipeline and a stable support team.",
    metrics: [
      { label: "Local visibility", value: "Rebuilt" },
      { label: "Appointment flow", value: "Steady" },
      { label: "Support roles", value: "Staffed" },
    ],
  },
  {
    id: "retail-rebrand",
    sector: "Retail",
    title: "A 12-year-old store that started looking like its reputation",
    client: "Family retail store · Vijayawada",
    challenge:
      "Loyal customers, dated face. Newer competitors looked more trustworthy to first-time buyers despite weaker service.",
    strategy:
      "Modernize every visible touchpoint in one coordinated push — exterior, interior and street-level marketing — without closing the store.",
    execution:
      "New identity, LED signboard, interior finishing and lighting, floor and display refresh, printed collateral, and offline marketing across the catchment area.",
    result:
      "The store now wins the first-glance decision as well as the repeat visit — reputation and presentation finally matching.",
    metrics: [
      { label: "Touchpoints renewed", value: "All" },
      { label: "Downtime", value: "Zero days" },
      { label: "First impressions", value: "Won" },
    ],
  },
];

/* ── Trust signals (Scene 9) ────────────────────────────────────────── */

export const stats = [
  { label: "Integrated services", value: 13, suffix: "" },
  { label: "Industries served", value: 9, suffix: "+" },
  { label: "Cities of presence", value: 4, suffix: "" },
  { label: "Partner specialists", value: 25, suffix: "+" },
];

export const industriesServed = [
  "Healthcare",
  "Food & Beverage",
  "Retail",
  "Education",
  "Manufacturing",
  "Real Estate",
  "Legal",
  "Startups",
  "Franchise Brands",
];

export type Testimonial = { quote: string; author: string; role: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "We came with a shop lease and an idea. Via-We handled everything else — by opening day it already felt like an established brand.",
    author: "QSR Founder",
    role: "Food & Beverage · Vijayawada",
  },
  {
    quote:
      "One team for branding, interiors and hiring meant one phone call when anything moved. That coordination is what we were really paying for.",
    author: "Clinic Director",
    role: "Healthcare · Guntur",
  },
  {
    quote:
      "Our second and third outlets opened faster than our first — because this time there was a system behind them.",
    author: "Franchise Owner",
    role: "Beverages · Andhra Pradesh",
  },
];

/* ── Discovery (Scene 5) options ────────────────────────────────────── */

export const budgetOptions = [
  { id: "under-2l", label: "Under ₹2 Lakhs" },
  { id: "2-5l", label: "₹2 – 5 Lakhs" },
  { id: "5-15l", label: "₹5 – 15 Lakhs" },
  { id: "15l-plus", label: "₹15 Lakhs +" },
  { id: "flexible", label: "Flexible / Advise me" },
] as const;

export const challengeOptions = [
  { id: "visibility", label: "Nobody knows us yet" },
  { id: "leads", label: "Not enough leads or footfall" },
  { id: "setup", label: "Setting up from scratch" },
  { id: "hiring", label: "Hiring the right people" },
  { id: "expansion", label: "Expanding to new outlets" },
  { id: "branding", label: "Our brand looks outdated" },
] as const;

export const ownershipOptions = [
  { id: "yes", label: "Yes, running a business" },
  { id: "starting", label: "Launching a new one" },
  { id: "exploring", label: "Exploring / researching" },
] as const;
