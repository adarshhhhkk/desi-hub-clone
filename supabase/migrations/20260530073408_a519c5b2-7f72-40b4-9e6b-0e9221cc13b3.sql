
-- 1. Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Profiles readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Admin check helper (security definer to avoid recursion)
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = _user_id and is_admin = true)
$$;

-- 3. Trigger: create profile on signup, make first user the admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select not exists(select 1 from public.profiles where is_admin = true) into is_first;
  insert into public.profiles (id, email, is_admin)
  values (new.id, new.email, is_first);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

alter table public.categories enable row level security;

create policy "Categories readable by everyone"
  on public.categories for select using (true);
create policy "Admin can insert categories"
  on public.categories for insert to authenticated
  with check (public.is_admin(auth.uid()));
create policy "Admin can update categories"
  on public.categories for update to authenticated
  using (public.is_admin(auth.uid()));
create policy "Admin can delete categories"
  on public.categories for delete to authenticated
  using (public.is_admin(auth.uid()));

insert into public.categories (name) values
  ('Trending'),('Travel'),('Food'),('Nature'),
  ('Music'),('Sports'),('Comedy'),('Dance');

-- 5. Videos
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  thumbnail_url text,
  source_kind text not null check (source_kind in ('link','file')),
  source_url text,        -- external URL for kind='link', or public storage URL for kind='file'
  storage_path text,      -- bucket path for kind='file' (so admin can delete/download)
  mime_type text,
  hue int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index videos_created_at_idx on public.videos (created_at desc);
create index videos_category_idx on public.videos (category);

grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;
grant all on public.videos to service_role;

alter table public.videos enable row level security;

create policy "Videos readable by everyone"
  on public.videos for select using (true);
create policy "Admin can insert videos"
  on public.videos for insert to authenticated
  with check (public.is_admin(auth.uid()));
create policy "Admin can update videos"
  on public.videos for update to authenticated
  using (public.is_admin(auth.uid()));
create policy "Admin can delete videos"
  on public.videos for delete to authenticated
  using (public.is_admin(auth.uid()));

-- 6. Storage buckets (public read, admin-only write)
insert into storage.buckets (id, name, public) values
  ('videos','videos',true),
  ('thumbnails','thumbnails',true)
on conflict (id) do nothing;

create policy "Public can read videos bucket"
  on storage.objects for select
  using (bucket_id = 'videos');
create policy "Admin can upload to videos bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.is_admin(auth.uid()));
create policy "Admin can update videos bucket"
  on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.is_admin(auth.uid()));
create policy "Admin can delete videos bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.is_admin(auth.uid()));

create policy "Public can read thumbnails bucket"
  on storage.objects for select
  using (bucket_id = 'thumbnails');
create policy "Admin can upload to thumbnails bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'thumbnails' and public.is_admin(auth.uid()));
create policy "Admin can update thumbnails bucket"
  on storage.objects for update to authenticated
  using (bucket_id = 'thumbnails' and public.is_admin(auth.uid()));
create policy "Admin can delete thumbnails bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'thumbnails' and public.is_admin(auth.uid()));
