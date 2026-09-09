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
  image_url text not null,
  total_score numeric(5,2) not null check (total_score >= 0 and total_score <= 100)
);

create table if not exists public.character_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  character_name text not null,
  status text not null check (status in ('correct', 'incorrect')),
  created_at timestamptz not null default now()
);

create index if not exists submissions_student_id_submitted_at_idx on public.submissions (student_id, submitted_at desc);
create index if not exists character_results_submission_id_idx on public.character_results (submission_id);

alter table public.lessons enable row level security;
alter table public.submissions enable row level security;
alter table public.character_results enable row level security;

create policy "Authenticated users can read lessons" on public.lessons for select to authenticated using (true);
create policy "Students can read own submissions" on public.submissions for select to authenticated using (student_id = auth.uid());
create policy "Students can create own submissions" on public.submissions for insert to authenticated with check (student_id = auth.uid());
create policy "Students can read own character results" on public.character_results for select to authenticated using (exists (select 1 from public.submissions s where s.id = submission_id and s.student_id = auth.uid()));
