import {
  caseStudies,
  company,
  ecosystem,
  industriesServed,
  services,
} from "@/data/content";

/**
 * The classic, fully crawlable view of Via-We — server-rendered beneath
 * the experience. Search engines and skip-preferring visitors get every
 * fact without touching WebGL.
 */
export function ClassicSite() {
  const waUrl = `https://wa.me/${company.phoneIntl}?text=${encodeURIComponent(
    "Hello Vijay, I'd like to discuss my business with Via-We.",
  )}`;

  return (
    <div id="classic" className="relative border-t border-steel/20 bg-abyss">
      {/* About */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="about-h">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/90">{company.name}</p>
        <h2 id="about-h" className="mt-3 max-w-3xl font-display text-3xl font-medium leading-tight text-ice sm:text-5xl">
          Every service a growing business needs.
          <span className="text-gradient-brand"> One accountable team.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-silver">
          Led by {company.founder.name}, Via-We plans, builds and grows businesses across Andhra
          Pradesh — from brand identity and prime-location setup to recruitment, marketing and
          franchising. Your dreams, our aim.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5" aria-label="Cities">
          {company.branches.map((city) => (
            <span key={city} className="rounded-full border border-steel/30 bg-midnight/50 px-4 py-1.5 text-sm text-silver">
              {city}
            </span>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-steel/15 bg-midnight/30" aria-labelledby="services-h">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 id="services-h" className="font-display text-3xl font-medium text-ice sm:text-4xl">
            Services
          </h2>
          <p className="mt-3 max-w-xl text-mist">
            Thirteen integrated services across eight disciplines — engage one, or let us run the
            whole launch.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article key={s.id} className="glass rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="font-medium text-ice">{s.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{s.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines + industries */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="disciplines-h">
        <h2 id="disciplines-h" className="font-display text-3xl font-medium text-ice sm:text-4xl">
          How engagements are organised
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ecosystem.map((node) => (
            <article key={node.id} className="rounded-2xl border border-steel/25 bg-midnight/40 p-5">
              <h3 className="font-medium text-ice">{node.label}</h3>
              <p className="mt-1 text-xs text-cyan/80">{node.tagline}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-mist">
                {node.includes.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm text-mist">
          <span className="text-silver">Industries served: </span>
          {industriesServed.join(" · ")}
        </p>
      </section>

      {/* Case studies */}
      <section className="border-t border-steel/15 bg-midnight/30" aria-labelledby="work-h">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 id="work-h" className="font-display text-3xl font-medium text-ice sm:text-4xl">
            Representative work
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {caseStudies.map((c) => (
              <article key={c.id} className="glass flex flex-col rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan/80">{c.sector}</p>
                <h3 className="mt-2 font-display text-xl leading-snug text-ice">{c.title}</h3>
                <p className="mt-1 text-xs text-mist">{c.client}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-silver">{c.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / footer */}
      <footer className="border-t border-steel/15" aria-labelledby="contact-h">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 id="contact-h" className="font-display text-3xl font-medium text-ice sm:text-4xl">
            Start the conversation
          </h2>
          <p className="mt-3 max-w-xl text-mist">
            Tell {company.founder.name.split(" ")[0]} what you&apos;re building — get a clear,
            personal answer about how Via-We can help.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-navy via-azure to-steel px-7 py-3.5 text-[15px] font-medium text-ice shadow-[0_8px_32px_-8px_rgba(74,211,243,0.45)] transition-all hover:brightness-110"
            >
              WhatsApp {company.phoneDisplay}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="rounded-full border border-steel/40 px-7 py-3.5 text-[15px] text-silver transition-colors hover:border-cyan/60 hover:text-ice"
            >
              {company.email}
            </a>
          </div>

          <div className="mt-14 flex flex-col justify-between gap-6 border-t border-steel/15 pt-8 text-sm text-mist sm:flex-row">
            <div>
              <p className="font-display text-lg tracking-wide text-ice">
                V<span className="text-cyan">ia</span>-W<span className="text-cyan">e</span>{" "}
                <span className="text-xs text-mist">Services Pvt. Ltd.</span>
              </p>
              <p className="mt-2 max-w-xs">{company.headquarters}</p>
              <p className="mt-1">Branches: {company.branches.slice(1).join(" · ")}</p>
            </div>
            <div className="sm:text-right">
              <p>
                {company.founder.name} — {company.founder.role}
              </p>
              <p className="mt-1">{company.phoneDisplay}</p>
              <p className="mt-6 text-xs text-mist/60">
                © {new Date().getFullYear()} {company.name} · Your Dreams. Our Aim.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
