-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum for Tiers
create type client_tier as enum ('wingman', 'guardian', 'apex_command');

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

-- Admins can view all clients (assuming admins have a specific role or check)
-- For simplicity, we might allow service role or specific admin emails.
-- Here we assume a function `is_admin()` exists or we check metadata.
-- For now, let's allow users to view their OWN client record.
create policy "Users can view their own client record"
  on public.clients for select
  using (auth.uid() = user_id);

-- ELD Reports Table
create table if not exists public.eld_reports (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  week_start date not null,
  violations int default 0,
  corrective_actions text, -- Nullable as requested (required if violations > 0 via app logic)
  report_notes text,
  created_at timestamptz default now()
);

-- RLS for ELD Reports
alter table public.eld_reports enable row level security;

-- Policy: Clients can view their own reports
create policy "Clients can view their own reports"
  on public.eld_reports for select
  using (
    client_id in (
      select id from public.clients where user_id = auth.uid()
    )
  );

-- Other Tables (inferred from codebase)
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
      -- Tier check: Guardian and Apex only
      exists (
        select 1 from public.clients
        where id = driver_files.client_id
        and tier in ('guardian', 'apex_command')
      )
    )
  );

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
      -- Tier check: Guardian and Apex only
      exists (
        select 1 from public.clients
        where id = ifta_records.client_id
        and tier in ('guardian', 'apex_command')
      )
    )
  );

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
      -- Tier check: Apex only
      exists (
        select 1 from public.clients
        where id = csa_scores.client_id
        and tier = 'apex_command'
      )
    )
  );

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
      -- Tier check: Apex only
      exists (
        select 1 from public.clients
        where id = dataq_disputes.client_id
        and tier = 'apex_command'
      )
    )
  );

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

-- Function to trigger webhook on new ELD report
create or replace function public.trigger_eld_notification()
returns trigger as $$
begin
  -- In a real Supabase setup, you'd use pg_net or a database webhook in the UI.
  -- Since we cannot configure UI webhooks via SQL easily without extensions,
  -- we will assume the 'notify-new-eld-report' Edge Function is called by the client
  -- OR set up a postgres trigger that calls an edge function (requires pg_net).
  -- For this schema, we'll just log it or rely on the UI/Edge Function flow.
  return new;
end;
$$ language plpgsql;

-- Notification Trigger (Placeholder for Webhook Setup)
-- create trigger on_new_eld_report
-- after insert on public.eld_reports
-- for each row execute procedure public.trigger_eld_notification();
