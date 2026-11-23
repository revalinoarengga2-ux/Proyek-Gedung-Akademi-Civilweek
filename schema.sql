-- CIVILWEEK PROJECT MONITORING — Supabase SQL
-- Jalankan seluruh script ini di Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  position text,
  role text not null default 'worker' check (role in ('admin','manager','supervisor','staff','worker')),
  organization_group text,
  created_at timestamptz not null default now()
);

create table if not exists public.work_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  weight_percent numeric(7,3) not null default 0 check(weight_percent >= 0 and weight_percent <= 100),
  planned_percent numeric(7,3) not null default 0 check(planned_percent >= 0 and planned_percent <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  reporter_name text not null,
  reporter_position text,
  report_type text not null,
  work_item_id uuid references public.work_items(id) on delete set null,
  location text not null,
  priority text not null default 'Normal',
  due_date date,
  description text not null,
  action_taken text,
  attachment_path text,
  reported_at timestamptz not null default now(),
  status text not null default 'Baru',
  created_at timestamptz not null default now()
);

create table if not exists public.work_progress (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.work_items(id) on delete cascade,
  period text not null,
  actual_percent numeric(7,3) not null check(actual_percent >= 0 and actual_percent <= 100),
  note text,
  entered_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.s_curve_baseline (
  id uuid primary key default gen_random_uuid(),
  period text not null unique,
  planned_cumulative numeric(7,3) not null check(planned_cumulative >= 0 and planned_cumulative <= 100),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.cctv_events (
  id uuid primary key default gen_random_uuid(),
  camera_name text not null,
  zone text,
  event_type text not null,
  confidence numeric(5,2),
  event_status text not null default 'Perlu verifikasi',
  snapshot_path text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.work_items enable row level security;
alter table public.progress_reports enable row level security;
alter table public.work_progress enable row level security;
alter table public.cctv_events enable row level security;\nalter table public.s_curve_baseline enable row level security;

create or replace function public.current_project_role()
returns text language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;

-- Personel login dapat melihat direktori nama/jabatan untuk dropdown.
create policy "profiles read authenticated" on public.profiles for select to authenticated using (true);
create policy "profile self update" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

create policy "work items read authenticated" on public.work_items for select to authenticated using (true);
create policy "managers manage work items" on public.work_items for all to authenticated
using (public.current_project_role() in ('admin','manager'))
with check (public.current_project_role() in ('admin','manager'));

create policy "reports read authenticated" on public.progress_reports for select to authenticated using (true);
create policy "users submit own reports" on public.progress_reports for insert to authenticated
with check (reporter_id=auth.uid());
create policy "supervisors update reports" on public.progress_reports for update to authenticated
using (public.current_project_role() in ('admin','manager','supervisor'))
with check (public.current_project_role() in ('admin','manager','supervisor'));

create policy "progress read authenticated" on public.work_progress for select to authenticated using (true);
create policy "authorized users add progress" on public.work_progress for insert to authenticated
with check (entered_by=auth.uid() and public.current_project_role() in ('admin','manager','supervisor','staff'));

create policy "baseline read authenticated" on public.s_curve_baseline for select to authenticated using (true);
create policy "managers manage baseline" on public.s_curve_baseline for all to authenticated
using (public.current_project_role() in ('admin','manager'))
with check (public.current_project_role() in ('admin','manager'));

create policy "cctv events read authenticated" on public.cctv_events for select to authenticated using (true);
create policy "authorized event ingestion" on public.cctv_events for insert to authenticated
with check (public.current_project_role() in ('admin','manager','supervisor'));

-- Bucket foto laporan. File privat, akses menggunakan signed URL dari aplikasi admin.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('report-attachments','report-attachments',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "authenticated upload own folder" on storage.objects for insert to authenticated
with check (bucket_id='report-attachments' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "authenticated read report attachments" on storage.objects for select to authenticated
using (bucket_id='report-attachments');

-- Seed daftar pekerjaan contoh berdasarkan gambar Kurva S yang diberikan.
-- planned_percent sengaja 0 karena persentase rencana per periode harus diisi dari baseline resmi.
insert into public.work_items(name,category,weight_percent,planned_percent,sort_order) values
('Pekerjaan Persiapan dan Umum','Pekerjaan Persiapan Umum',1.45,0,1),
('Pekerjaan Penerapan Rencana Kesehatan dan Keselamatan','Pekerjaan Persiapan Umum',0.12,0,2),
('Pekerjaan Pondasi Dalam','Pekerjaan Struktur Bawah',6.92,0,3),
('Pekerjaan Dinding Penahan Tanah','Pekerjaan Struktur Bawah',4.62,0,4),
('Pekerjaan Struktur Bawah Lantai Mesin Lift & GWT','Pekerjaan Struktur Bawah',7.44,0,5),
('Pekerjaan Struktur Bawah Lantai Semi Basement','Pekerjaan Struktur Bawah',4.26,0,6),
('Pekerjaan Lantai Mesin Lift & GWT','Pekerjaan Struktur Atas',2.86,0,7),
('Pekerjaan Lantai Semi Basement','Pekerjaan Struktur Atas',6.12,0,8),
('Pekerjaan Lantai 1','Pekerjaan Struktur Atas',4.69,0,9),
('Pekerjaan Lantai 2','Pekerjaan Struktur Atas',3.83,0,10),
('Pekerjaan Lantai 3','Pekerjaan Struktur Atas',3.80,0,11),
('Pekerjaan Lantai 4','Pekerjaan Struktur Atas',3.71,0,12),
('Pekerjaan Lantai 5','Pekerjaan Struktur Atas',3.62,0,13),
('Pekerjaan Lantai 6','Pekerjaan Struktur Atas',3.78,0,14),
('Pekerjaan Lantai 7','Pekerjaan Struktur Atas',4.30,0,15),
('Pekerjaan Lantai Atap','Pekerjaan Struktur Atas',1.43,0,16),
('Pekerjaan Lantai Top Atap','Pekerjaan Struktur Atas',1.18,0,17),
('Pekerjaan Lantai Semi Basement (Arsitektur)','Pekerjaan Arsitektur',1.65,0,18),
('Pekerjaan Lantai 1 (Arsitektur)','Pekerjaan Arsitektur',5.34,0,19),
('Pekerjaan Lantai 2 (Arsitektur)','Pekerjaan Arsitektur',3.98,0,20),
('Pekerjaan Lantai 3 (Arsitektur)','Pekerjaan Arsitektur',4.22,0,21),
('Pekerjaan Lantai 4 (Arsitektur)','Pekerjaan Arsitektur',4.48,0,22),
('Pekerjaan Lantai 5 (Arsitektur)','Pekerjaan Arsitektur',4.12,0,23),
('Pekerjaan Lantai 6 (Arsitektur)','Pekerjaan Arsitektur',4.05,0,24),
('Pekerjaan Lantai 7 (Arsitektur)','Pekerjaan Arsitektur',4.08,0,25),
('Pekerjaan Lantai Atap dan Ruang Mesin','Pekerjaan Arsitektur',1.87,0,26),
('Pekerjaan Facade','Pekerjaan Arsitektur',0.37,0,27),
('Pekerjaan Jalan Utama','Pekerjaan Infrastruktur',0.30,0,28),
('Pekerjaan Hardstanding','Pekerjaan Infrastruktur',0.19,0,29),
('Pekerjaan Saluran','Pekerjaan Infrastruktur',0.18,0,30),
('Pekerjaan Pagar','Pekerjaan Infrastruktur',0.20,0,31),
('Pekerjaan Sumur Resapan','Pekerjaan Infrastruktur',0.25,0,32),
('Pekerjaan Landscape','Pekerjaan Infrastruktur',0.20,0,33),
('Pekerjaan Gardu PLN','Pekerjaan Infrastruktur',0.42,0,34)
on conflict do nothing;

-- Buat user lewat Authentication > Users, lalu buat profilnya:
-- insert into public.profiles(id,full_name,position,role,organization_group)
-- values ('UUID_DARI_AUTH','Nama Personel','Supervisor','supervisor','Project Construction');
