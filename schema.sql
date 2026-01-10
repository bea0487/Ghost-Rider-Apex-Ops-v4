-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum for Tiers
do $$ begin
    create type client_tier as enum ('wingman', 'guardian', 'apex_command');
exception
    when duplicate_object then null;
end $$;

-- Create Clients Table (Profiles)
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  client_id text unique, -- Custom ID like DOT Number or internal ID
  company_name text,
  email text,
  tier client_tier default 'wingman',
  created_at timestamptz default now()
);

-- RLS for Clients
alter table public.clients enable row level security;

-- Policy: Users can view their own record
create policy "Users can view their own client record"
  on public.clients for select
  using (auth.uid() = user_id);

-- Policy: Admins can do everything
create policy "Admins can do everything on clients"
  on public.clients for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ELD Reports Table
create table if not exists public.eld_reports (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  week_start date not null,
  violations int default 0,
  corrective_actions text,
  report_notes text,
  created_at timestamptz default now()
);

alter table public.eld_reports enable row level security;

create policy "Clients can view their own reports"
  on public.eld_reports for select
  using (client_id in (select id from public.clients where user_id = auth.uid()));

create policy "Admins can do everything on eld_reports"
  on public.eld_reports for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Driver Files
create table if not exists public.driver_files (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  driver_name text not null,
  license_number text,
  license_expiry date,
  medical_card_expiry date,
  status text,
  created_at timestamptz default now()
);
alter table public.driver_files enable row level security;

create policy "Clients can view their own driver files"
  on public.driver_files for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
    and (
      exists (
        select 1 from public.clients
        where id = driver_files.client_id
        and tier in ('guardian', 'apex_command')
      )
    )
  );

create policy "Admins can do everything on driver_files"
  on public.driver_files for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- IFTA Records
create table if not exists public.ifta_records (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  quarter text not null,
  year int not null,
  total_miles int default 0,
  taxable_gallons int default 0,
  status text default 'Pending',
  created_at timestamptz default now()
);
alter table public.ifta_records enable row level security;

create policy "Clients can view their own IFTA records"
  on public.ifta_records for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
    and (
      exists (
        select 1 from public.clients
        where id = ifta_records.client_id
        and tier in ('guardian', 'apex_command')
      )
    )
  );

create policy "Admins can do everything on ifta_records"
  on public.ifta_records for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- CSA Scores
create table if not exists public.csa_scores (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  score_date date not null,
  unsafe_driving_basic int,
  crash_indicator_basic int,
  hos_compliance_basic int,
  vehicle_maint_basic int,
  created_at timestamptz default now()
);
alter table public.csa_scores enable row level security;

create policy "Clients can view their own CSA scores"
  on public.csa_scores for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
    and (
      exists (
        select 1 from public.clients
        where id = csa_scores.client_id
        and tier = 'apex_command'
      )
    )
  );

create policy "Admins can do everything on csa_scores"
  on public.csa_scores for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- DataQ Disputes
create table if not exists public.dataq_disputes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  report_number text not null,
  violation_code text,
  status text default 'Open',
  details text,
  created_at timestamptz default now()
);
alter table public.dataq_disputes enable row level security;

create policy "Clients can view their own DataQ disputes"
  on public.dataq_disputes for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
    and (
      exists (
        select 1 from public.clients
        where id = dataq_disputes.client_id
        and tier = 'apex_command'
      )
    )
  );

create policy "Admins can do everything on dataq_disputes"
  on public.dataq_disputes for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Support Tickets
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  subject text not null,
  message text,
  status text default 'Open',
  priority text default 'Medium',
  created_at timestamptz default now()
);
alter table public.support_tickets enable row level security;

create policy "Clients can view their own tickets"
  on public.support_tickets for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

create policy "Admins can do everything on support_tickets"
  on public.support_tickets for all
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
