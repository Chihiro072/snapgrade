-- Run through Supabase SQL Editor or `supabase db push`.

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  moe_level text not null check (moe_level in ('P1', 'P2', 'P3', 'P4', 'P5', 'P6')),
  week_number smallint check (week_number > 0),
  word_list jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  submitted_at timestamptz not null default now(),
  -- Storage object path (e.g. "<user_id>/<uuid>.jpg") in the private
  -- `worksheets` bucket, NOT a ready-to-use URL. The bucket is private, so
  -- any browser-usable URL has to be a signed link generated on demand
  -- (they expire); storing one permanently here would go stale.
  image_path text not null,
  -- Nullable: a submission starts as "pending" the moment the photo is
  -- uploaded, before grading has produced a score.
  total_score numeric(5,2) check (total_score >= 0 and total_score <= 100),
  status text not null default 'pending' check (status in ('pending', 'graded', 'failed'))
);

-- `create table if not exists` above is a no-op once the table already
-- exists, so these ALTERs are the real (idempotent) source of truth for
-- anyone re-running this file against a database created before `status`
-- existed, or before `image_url` was renamed to `image_path`. Safe to
-- re-run any number of times.
alter table public.submissions alter column total_score drop not null;
alter table public.submissions add column if not exists status text not null default 'pending';
alter table public.submissions drop constraint if exists submissions_status_check;
alter table public.submissions add constraint submissions_status_check check (status in ('pending', 'graded', 'failed'));
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'submissions' and column_name = 'image_url'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'submissions' and column_name = 'image_path'
  ) then
    alter table public.submissions rename column image_url to image_path;
  end if;
end $$;

create table if not exists public.character_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  character_name text not null,
  status text not null check (status in ('correct', 'incorrect')),
  -- Normalized (0-1) position of this character in the worksheet photo, so
  -- the frontend can draw a red-pen correction mark at that spot. Nullable:
  -- the grading model doesn't always return a usable position.
  box_x numeric(4,3) check (box_x >= 0 and box_x <= 1),
  box_y numeric(4,3) check (box_y >= 0 and box_y <= 1),
  created_at timestamptz not null default now()
);

-- Same `create table if not exists` caveat as above: these ALTERs are the
-- real source of truth for a database created before box_x/box_y existed.
alter table public.character_results add column if not exists box_x numeric(4,3);
alter table public.character_results add column if not exists box_y numeric(4,3);
alter table public.character_results drop constraint if exists character_results_box_x_check;
alter table public.character_results add constraint character_results_box_x_check check (box_x is null or (box_x >= 0 and box_x <= 1));
alter table public.character_results drop constraint if exists character_results_box_y_check;
alter table public.character_results add constraint character_results_box_y_check check (box_y is null or (box_y >= 0 and box_y <= 1));

create index if not exists submissions_student_id_submitted_at_idx on public.submissions (student_id, submitted_at desc);
create index if not exists character_results_submission_id_idx on public.character_results (submission_id);

alter table public.lessons enable row level security;
alter table public.submissions enable row level security;
alter table public.character_results enable row level security;

drop policy if exists "Authenticated users can read lessons" on public.lessons;
create policy "Authenticated users can read lessons" on public.lessons for select to authenticated using (true);

drop policy if exists "Students can read own submissions" on public.submissions;
create policy "Students can read own submissions" on public.submissions for select to authenticated using (student_id = auth.uid());

drop policy if exists "Students can create own submissions" on public.submissions;
create policy "Students can create own submissions" on public.submissions for insert to authenticated with check (student_id = auth.uid());

-- Lets the grading step write the score/status back onto a submission it owns.
drop policy if exists "Students can update own submissions" on public.submissions;
create policy "Students can update own submissions" on public.submissions for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "Students can read own character results" on public.character_results;
create policy "Students can read own character results" on public.character_results for select to authenticated using (exists (select 1 from public.submissions s where s.id = submission_id and s.student_id = auth.uid()));

-- Lets the grading step write per-character results for a submission it owns.
drop policy if exists "Students can create own character results" on public.character_results;
create policy "Students can create own character results" on public.character_results for insert to authenticated with check (exists (select 1 from public.submissions s where s.id = submission_id and s.student_id = auth.uid()));

-- Storage bucket for captured worksheet photos, keyed by uploader's user id folder.
insert into storage.buckets (id, name, public)
values ('worksheets', 'worksheets', false)
on conflict (id) do nothing;

drop policy if exists "Students can upload own worksheets" on storage.objects;
create policy "Students can upload own worksheets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'worksheets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Students can read own worksheets" on storage.objects;
create policy "Students can read own worksheets"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'worksheets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
