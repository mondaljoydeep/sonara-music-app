
-- =========== PROFILES ===========
create type public.user_role as enum ('listener','creator');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  bio text,
  avatar_url text,
  role public.user_role not null default 'listener',
  verified boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);

-- =========== CREATOR SONGS ===========
create type public.song_status as enum ('pending','approved','rejected');

create table public.creator_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  genre text,
  mood text,
  vocal_style text,
  lyrics text,
  audio_url text not null,
  artwork_url text,
  duration_sec integer,
  status public.song_status not null default 'pending',
  ai_notes text,
  plays integer not null default 0,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_songs enable row level security;

create policy "Approved songs are public" on public.creator_songs for select
  using (status = 'approved' or auth.uid() = user_id);
create policy "Creators insert own songs" on public.creator_songs for insert with check (auth.uid() = user_id);
create policy "Creators update own songs" on public.creator_songs for update using (auth.uid() = user_id);
create policy "Creators delete own songs" on public.creator_songs for delete using (auth.uid() = user_id);

-- =========== NOTIFICATIONS ===========
create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  type text not null default 'system',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.app_notifications enable row level security;

create policy "Users read own notifications" on public.app_notifications for select using (auth.uid() = user_id);
create policy "Users insert own notifications" on public.app_notifications for insert with check (auth.uid() = user_id);
create policy "Users update own notifications" on public.app_notifications for update using (auth.uid() = user_id);
create policy "Users delete own notifications" on public.app_notifications for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.app_notifications;
alter table public.app_notifications replica identity full;
alter publication supabase_realtime add table public.creator_songs;

-- =========== TIMESTAMP TRIGGER ===========
create or replace function public.update_updated_at_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql set search_path = public;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();
create trigger trg_creator_songs_updated before update on public.creator_songs
  for each row execute function public.update_updated_at_column();

-- =========== AUTO PROFILE ON SIGNUP ===========
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========== STORAGE BUCKETS ===========
insert into storage.buckets (id, name, public) values
  ('creator-audio','creator-audio',true),
  ('creator-artwork','creator-artwork',true),
  ('avatars','avatars',true)
on conflict (id) do nothing;

create policy "Public read creator-audio" on storage.objects for select using (bucket_id = 'creator-audio');
create policy "Owners upload creator-audio" on storage.objects for insert
  with check (bucket_id='creator-audio' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners update creator-audio" on storage.objects for update
  using (bucket_id='creator-audio' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners delete creator-audio" on storage.objects for delete
  using (bucket_id='creator-audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read creator-artwork" on storage.objects for select using (bucket_id = 'creator-artwork');
create policy "Owners upload creator-artwork" on storage.objects for insert
  with check (bucket_id='creator-artwork' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners update creator-artwork" on storage.objects for update
  using (bucket_id='creator-artwork' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners delete creator-artwork" on storage.objects for delete
  using (bucket_id='creator-artwork' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Owners upload avatars" on storage.objects for insert
  with check (bucket_id='avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners update avatars" on storage.objects for update
  using (bucket_id='avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owners delete avatars" on storage.objects for delete
  using (bucket_id='avatars' and auth.uid()::text = (storage.foldername(name))[1]);
