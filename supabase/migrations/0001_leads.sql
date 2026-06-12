-- Via-We consultation leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  name text not null,
  phone text not null,
  email text,
  persona text,
  ownership text,
  industry text,
  services text[] not null default '{}',
  budget text,
  challenge text,
  goals text,
  preferred_channel text,
  intent text,
  summary text,
  lead_source text not null default 'consultation-experience'
);

comment on table public.leads is 'Leads captured by the Via-We digital consultation experience';

-- Lock the table down: only the service role (used by the API route) writes.
alter table public.leads enable row level security;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_intent_idx on public.leads (intent);
