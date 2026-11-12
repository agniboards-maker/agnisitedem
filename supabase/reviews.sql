-- Agni Boards: customer reviews
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- 1. Reviews table. New reviews start as not approved and stay hidden until you approve them.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nickname text not null default 'Customer' check (char_length(nickname) between 1 and 40),
  stars smallint not null check (stars between 1 and 5),
  body text not null check (char_length(body) between 1 and 600),
  photo_paths text[] not null default '{}' check (coalesce(array_length(photo_paths, 1), 0) <= 3),
  approved boolean not null default false
);

alter table public.reviews enable row level security;

-- Anyone on the site can submit a review, but only as "not approved"
drop policy if exists "submit pending review" on public.reviews;
create policy "submit pending review" on public.reviews
  for insert to anon
  with check (approved = false);

-- Anyone can read approved reviews only
drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews" on public.reviews
  for select to anon
  using (approved = true);

-- 2. Photo storage. Public bucket (photos load by URL), images only, 3 MB max per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Anyone can upload to this bucket. There is deliberately no select policy,
-- so visitors can't list every photo; they can still open the photos whose links are shown on approved reviews.
drop policy if exists "upload review photos" on storage.objects;
create policy "upload review photos" on storage.objects
  for insert to anon
  with check (bucket_id = 'review-photos');

-- To approve a review: Table Editor > reviews > click the row > set approved = true.
