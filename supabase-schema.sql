-- Run this in the Supabase SQL Editor to initialize your database!

-- 1. Create table for links
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  url text not null,
  description text default '',
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS) to enforce uniqueness & privacy
alter table public.links enable row level security;

-- 3. Policy: Users can only view their own saved links
create policy "Users can view own links"
  on public.links for select
  using (auth.uid() = user_id);

-- 4. Policy: Users can only insert links for themselves
create policy "Users can insert own links"
  on public.links for insert
  with check (auth.uid() = user_id);

-- 5. Policy: Users can only update their own links
create policy "Users can update own links"
  on public.links for update
  using (auth.uid() = user_id);

-- 6. Policy: Users can only delete their own links
-- Nobody else can delete your links!
create policy "Users can delete own links"
  on public.links for delete
  using (auth.uid() = user_id);
