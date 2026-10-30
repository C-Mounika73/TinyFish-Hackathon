-- FoodLoop AI live Supabase schema. Run this in the Supabase SQL editor.
create extension if not exists pgcrypto;

do $$ begin create type user_role as enum ('donor','ngo','volunteer','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type verification_status as enum ('Pending','Verified','Rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type donation_status as enum ('Available','Requested','Accepted','Pickup Assigned','Picked Up','Delivered','Completed','Cancelled','Expired'); exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(), auth_user_id uuid unique not null, full_name text not null, email text unique not null,
  phone text, role user_role not null, location text, address text, latitude numeric(9,6), longitude numeric(9,6),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);
create index if not exists users_role_idx on users(role);
create index if not exists users_auth_user_idx on users(auth_user_id);

create table if not exists donor_profiles (
  user_id uuid primary key references users(id) on delete cascade, organization_name text not null, organization_type text,
  address text, latitude numeric(9,6), longitude numeric(9,6), verified_status verification_status not null default 'Pending',
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);
create table if not exists ngo_profiles (
  user_id uuid primary key references users(id) on delete cascade, organization_name text not null, description text,
  address text, latitude numeric(9,6), longitude numeric(9,6), service_areas text[] default '{}', capacity_meals integer not null default 0,
  availability text not null default 'Available', verified_status verification_status not null default 'Pending',
  check (capacity_meals >= 0), check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);
create table if not exists volunteer_profiles (
  user_id uuid primary key references users(id) on delete cascade, availability text not null default 'Available', vehicle_type text,
  latitude numeric(9,6), longitude numeric(9,6), service_areas text[] default '{}',
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(), donor_id uuid not null references users(id), food_name text not null, description text not null,
  category text not null, dietary text not null check (dietary in ('Vegetarian','Non-vegetarian')), quantity_kg numeric(10,2) not null check (quantity_kg > 0),
  estimated_meals integer not null check (estimated_meals > 0), preparation_at timestamptz not null, safe_until timestamptz not null,
  pickup_until timestamptz not null, storage_conditions text not null, allergens text not null, pickup_address text not null,
  latitude numeric(9,6), longitude numeric(9,6), image_url text, status donation_status not null default 'Available', donor_declared_safe boolean not null default false,
  collection_confirmed_at timestamptz, distribution_confirmed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (safe_until > preparation_at), check (pickup_until > preparation_at), check (pickup_until <= safe_until), check (donor_declared_safe = true),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);
create index if not exists donations_status_deadline_idx on donations(status, pickup_until);
create index if not exists donations_donor_idx on donations(donor_id);

create table if not exists donation_requests (
  id uuid primary key default gen_random_uuid(), donation_id uuid not null references donations(id) on delete cascade, ngo_id uuid not null references users(id),
  status text not null default 'Pending' check (status in ('Pending','Accepted','Rejected','Cancelled')), requested_at timestamptz not null default now(), decided_at timestamptz,
  unique(donation_id, ngo_id)
);
create index if not exists donation_requests_ngo_idx on donation_requests(ngo_id, status);

create table if not exists volunteer_assignments (
  id uuid primary key default gen_random_uuid(), donation_id uuid not null references donations(id), ngo_id uuid not null references users(id), volunteer_id uuid not null references users(id),
  status text not null default 'Assigned' check (status in ('Assigned','Picked Up','Delivered')), proof_url text, assigned_at timestamptz not null default now(), picked_up_at timestamptz, delivered_at timestamptz,
  unique(donation_id)
);
create index if not exists assignments_volunteer_idx on volunteer_assignments(volunteer_id, status);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, donation_id uuid references donations(id) on delete cascade,
  assignment_id uuid references volunteer_assignments(id) on delete cascade, title text not null, body text not null, tone text not null default 'blue', read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_unread_idx on notifications(user_id, read_at, created_at desc);

create table if not exists discovered_organizations (
  id uuid primary key default gen_random_uuid(), name text not null, description text, website text, public_contact text, address text, service_areas text[],
  source_url text not null unique, discovery_query text, discovered_at timestamptz not null default now(), status verification_status not null default 'Pending'
);
create table if not exists ngo_verifications (
  id uuid primary key default gen_random_uuid(), ngo_id uuid not null references users(id), reviewer_id uuid references users(id), status verification_status not null default 'Pending', notes text, reviewed_at timestamptz
);
create table if not exists distribution_records (
  id uuid primary key default gen_random_uuid(), donation_id uuid not null references donations(id), ngo_id uuid not null references users(id), meals_distributed integer not null check (meals_distributed >= 0),
  distribution_notes text, recipient_count integer, distributed_at timestamptz not null default now(), unique(donation_id)
);
create table if not exists impact_statistics (
  id uuid primary key default gen_random_uuid(), metric_key text not null, metric_value numeric not null, period_start date, period_end date, source text not null default 'calculated', created_at timestamptz not null default now()
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid references users(id), donation_id uuid references donations(id), category text not null, details text not null, status text not null default 'Open', created_at timestamptz not null default now()
);

-- Atomic request/accept/assignment operations. The server calls these through the service-role client after JWT role checks.
create or replace function request_donation(p_donation_id uuid, p_ngo_id uuid) returns donations language plpgsql security definer set search_path = public as $$
declare d donations; ngo_ok boolean;
begin
  select exists(select 1 from ngo_profiles where user_id = p_ngo_id and verified_status = 'Verified' and availability <> 'Unavailable') into ngo_ok;
  if not ngo_ok then raise exception 'Only verified, available NGOs can request donations.'; end if;
  select * into d from donations where id = p_donation_id for update;
  if d.id is null then raise exception 'Donation not found.'; end if;
  if d.status <> 'Available' then raise exception 'This donation is no longer available.'; end if;
  if d.safe_until <= now() or d.pickup_until <= now() then update donations set status = 'Expired', updated_at = now() where id = d.id; raise exception 'This donation has expired.'; end if;
  insert into donation_requests(donation_id, ngo_id) values (p_donation_id, p_ngo_id) on conflict (donation_id, ngo_id) do nothing;
  update donations set status = 'Requested', updated_at = now() where id = d.id returning * into d;
  insert into notifications(user_id, donation_id, title, body, tone) values (d.donor_id, d.id, 'New NGO request', 'A verified NGO requested your food donation.', 'blue');
  return d;
end; $$;

create or replace function accept_donation_request(p_donation_id uuid, p_actor_id uuid) returns donations language plpgsql security definer set search_path = public as $$
declare d donations; request_ngo uuid;
begin
  select * into d from donations where id = p_donation_id for update;
  if d.id is null then raise exception 'Donation not found.'; end if;
  if d.donor_id <> p_actor_id then raise exception 'Only the donor can accept a request.'; end if;
  select ngo_id into request_ngo from donation_requests where donation_id = d.id and status = 'Pending' order by requested_at asc limit 1 for update;
  if request_ngo is null then raise exception 'No pending NGO request exists.'; end if;
  update donation_requests set status = 'Accepted', decided_at = now() where donation_id = d.id and ngo_id = request_ngo;
  update donations set status = 'Accepted', updated_at = now() where id = d.id returning * into d;
  insert into notifications(user_id, donation_id, title, body, tone) values (request_ngo, d.id, 'Donation accepted', 'The donor accepted your request. Plan the collection handoff.', 'green');
  return d;
end; $$;

create or replace function assign_volunteer(p_donation_id uuid, p_ngo_id uuid, p_volunteer_id uuid) returns volunteer_assignments language plpgsql security definer set search_path = public as $$
declare d donations; a volunteer_assignments;
begin
  select * into d from donations where id = p_donation_id for update;
  if d.id is null then raise exception 'Donation not found.'; end if;
  if d.status not in ('Accepted','Requested') then raise exception 'Donation is not ready for volunteer assignment.'; end if;
  if not exists(select 1 from volunteer_profiles where user_id = p_volunteer_id and availability <> 'Unavailable') then raise exception 'Volunteer is not available.'; end if;
  insert into volunteer_assignments(donation_id, ngo_id, volunteer_id) values (p_donation_id, p_ngo_id, p_volunteer_id) returning * into a;
  update donations set status = 'Pickup Assigned', updated_at = now() where id = d.id;
  insert into notifications(user_id, donation_id, assignment_id, title, body, tone) values (p_volunteer_id, d.id, a.id, 'New pickup assignment', 'You have been assigned a safe food pickup route.', 'orange');
  return a;
end; $$;

alter table users enable row level security; alter table donor_profiles enable row level security; alter table ngo_profiles enable row level security; alter table volunteer_profiles enable row level security; alter table donations enable row level security; alter table donation_requests enable row level security; alter table volunteer_assignments enable row level security; alter table notifications enable row level security; alter table discovered_organizations enable row level security; alter table ngo_verifications enable row level security; alter table distribution_records enable row level security; alter table impact_statistics enable row level security; alter table reports enable row level security;

do $$ begin
  create policy users_self_select on users for select using (auth_user_id = auth.uid());
  create policy users_self_update on users for update using (auth_user_id = auth.uid());
  create policy donations_donor_manage on donations for all using (donor_id in (select id from users where auth_user_id = auth.uid())) with check (donor_id in (select id from users where auth_user_id = auth.uid()));
  create policy donations_public_available on donations for select using (status in ('Available','Requested','Accepted','Pickup Assigned','Picked Up','Delivered','Completed'));
  create policy notifications_self on notifications for all using (user_id in (select id from users where auth_user_id = auth.uid())) with check (user_id in (select id from users where auth_user_id = auth.uid()));
  create policy discovered_public_select on discovered_organizations for select using (true);
exception when duplicate_object then null; end $$;
