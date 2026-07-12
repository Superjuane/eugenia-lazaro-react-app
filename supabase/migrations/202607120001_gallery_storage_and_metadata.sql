create table if not exists public.gallery_groups (
  id text primary key,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id text primary key,
  title text not null,
  group_id text not null references public.gallery_groups(id) on update cascade on delete restrict,
  image_path text not null unique,
  alt text,
  etiquetas text[] not null default '{}',
  colors text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  work_date date not null default current_date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_group_id_idx on public.gallery_items(group_id);
create index if not exists gallery_items_published_idx on public.gallery_items(published);
create index if not exists gallery_items_featured_idx on public.gallery_items(featured);
create index if not exists gallery_items_work_date_idx on public.gallery_items(work_date desc);
create index if not exists gallery_items_etiquetas_idx on public.gallery_items using gin(etiquetas);
create index if not exists gallery_items_colors_idx on public.gallery_items using gin(colors);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gallery_groups_set_updated_at on public.gallery_groups;
create trigger gallery_groups_set_updated_at
before update on public.gallery_groups
for each row
execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row
execute function public.set_updated_at();

alter table public.gallery_groups enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists "Gallery groups are readable" on public.gallery_groups;
create policy "Gallery groups are readable"
on public.gallery_groups
for select
using (true);

drop policy if exists "Published gallery items are readable" on public.gallery_items;
create policy "Published gallery items are readable"
on public.gallery_items
for select
using (published = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'Eugenia Lazaro Pintura - imagenes publicas',
  'Eugenia Lazaro Pintura - imagenes publicas',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gallery images are publicly readable" on storage.objects;
create policy "Gallery images are publicly readable"
on storage.objects
for select
using (bucket_id = 'Eugenia Lazaro Pintura - imagenes publicas');
