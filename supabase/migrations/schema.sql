-- Run through Supabase SQL Editor or `supabase db push`.

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  moe_level text not null check (moe_level in ('P1', 'P2', 'P3', 'P4', 'P5', 'P6')),
  week_number smallint check (week_number > 0),
  -- Array of {"word": "...", "pinyin": "..."} objects, in display order.
  word_list jsonb not null default '[]'::jsonb,
  -- Display-only extras for the Syllabus screen. status_label/status_tone
  -- are the assignment's required hardcoded per-lesson status tag (there's
  -- no real mastery-tracking logic driving them) - hardcoded here in the
  -- seed data rather than duplicated again in frontend code.
  pinyin text not null default '',
  status_label text not null default 'Pending Practice',
  status_tone text not null default 'amber' check (status_tone in ('green', 'amber', 'red')),
  created_at timestamptz not null default now()
);

-- `create table if not exists` above is a no-op once the table already
-- exists, so these ALTERs are the real source of truth for a database
-- created before pinyin/status_label/status_tone existed.
alter table public.lessons add column if not exists pinyin text not null default '';
alter table public.lessons add column if not exists status_label text not null default 'Pending Practice';
alter table public.lessons add column if not exists status_tone text not null default 'amber';
alter table public.lessons drop constraint if exists lessons_status_tone_check;
alter table public.lessons add constraint lessons_status_tone_check check (status_tone in ('green', 'amber', 'red'));

-- Seed data for the Syllabus screen (app/syllabus/page.tsx), which now
-- fetches these rows directly instead of keeping its own hardcoded copy.
-- Fixed ids so "/camera?lessonId=<id>" and worksheet printing/grading all
-- point at the same real word_list. Upsert so re-running this file keeps
-- the database in sync with any content edits made here.
insert into public.lessons (id, title, moe_level, week_number, pinyin, status_label, status_tone, word_list)
values
  ('b1000000-0000-4000-8000-000000000001', '第一课 - 我的身体', 'P1', 1, 'wǒ de shēn tǐ', 'Completed (90%)', 'green',
    '[{"word":"眼睛","pinyin":"yǎn jing"},{"word":"耳朵","pinyin":"ěr duo"},{"word":"鼻子","pinyin":"bí zi"},{"word":"嘴巴","pinyin":"zuǐ ba"}]'::jsonb),
  ('b1000000-0000-4000-8000-000000000002', '第二课 - 颜色', 'P1', 2, 'yán sè', 'Pending Practice', 'amber',
    '[{"word":"红色","pinyin":"hóng sè"},{"word":"黄色","pinyin":"huáng sè"},{"word":"蓝色","pinyin":"lán sè"}]'::jsonb),
  ('b1000000-0000-4000-8000-000000000003', '第三课 - 动物朋友', 'P1', 3, 'dòng wù péng yǒu', 'Needs Revision', 'red',
    '[{"word":"小狗","pinyin":"xiǎo gǒu"},{"word":"小猫","pinyin":"xiǎo māo"},{"word":"小鸟","pinyin":"xiǎo niǎo"}]'::jsonb),
  ('b1000000-0000-4000-8000-000000000004', '第四课 - 数字', 'P1', 4, 'shù zì', 'Pending Practice', 'amber',
    '[{"word":"一","pinyin":"yī"},{"word":"二","pinyin":"èr"},{"word":"三","pinyin":"sān"}]'::jsonb),

  ('a0000000-0000-4000-8000-000000000002', '第八课 - 快乐的周末', 'P2', 1, 'kuài lè de zhōu mò', 'Needs Revision', 'red',
    '[{"word":"玩耍","pinyin":"wán shuǎ"},{"word":"公园","pinyin":"gōng yuán"}]'::jsonb),
  ('a0000000-0000-4000-8000-000000000003', '第九课 - 我爱我的家', 'P2', 2, 'wǒ ài wǒ de jiā', 'Completed (80%)', 'green',
    '[{"word":"爸爸","pinyin":"bà ba"},{"word":"妈妈","pinyin":"mā ma"},{"word":"温暖","pinyin":"wēn nuǎn"}]'::jsonb),
  ('a0000000-0000-4000-8000-000000000004', '第十课 - 我们的校园', 'P2', 3, 'wǒ men de xiào yuán', 'Pending Practice', 'amber',
    '[{"word":"校园","pinyin":"xiào yuán"},{"word":"操场","pinyin":"cāo chǎng"},{"word":"老师","pinyin":"lǎo shī"},{"word":"礼堂","pinyin":"lǐ táng"}]'::jsonb),
  ('a0000000-0000-4000-8000-000000000001', '第十一课 - 我的一天', 'P2', 4, 'wǒ de yī tiān', 'Pending Practice', 'amber',
    '[{"word":"早上","pinyin":"zǎo shang"},{"word":"晚上","pinyin":"wǎn shang"},{"word":"时间","pinyin":"shí jiān"}]'::jsonb),

  ('b3000000-0000-4000-8000-000000000001', '第十一课 - 我的学校', 'P3', 1, 'wǒ de xué xiào', 'Completed (85%)', 'green',
    '[{"word":"图书馆","pinyin":"tú shū guǎn"},{"word":"走廊","pinyin":"zǒu láng"},{"word":"食堂","pinyin":"shí táng"}]'::jsonb),
  ('b3000000-0000-4000-8000-000000000002', '第十二课 - 天气变化', 'P3', 2, 'tiān qì biàn huà', 'Pending Practice', 'amber',
    '[{"word":"下雨","pinyin":"xià yǔ"},{"word":"晴天","pinyin":"qíng tiān"},{"word":"刮风","pinyin":"guā fēng"}]'::jsonb),
  ('b3000000-0000-4000-8000-000000000003', '第十三课 - 交通工具', 'P3', 3, 'jiāo tōng gōng jù', 'Needs Revision', 'red',
    '[{"word":"巴士","pinyin":"bā shì"},{"word":"德士","pinyin":"dé shì"},{"word":"地铁","pinyin":"dì tiě"}]'::jsonb),
  ('b3000000-0000-4000-8000-000000000004', '第十四课 - 我的爱好', 'P3', 4, 'wǒ de ài hào', 'Completed (80%)', 'green',
    '[{"word":"画画","pinyin":"huà huà"},{"word":"唱歌","pinyin":"chàng gē"},{"word":"跳舞","pinyin":"tiào wǔ"}]'::jsonb),

  ('b4000000-0000-4000-8000-000000000001', '第十四课 - 环境保护', 'P4', 1, 'huán jìng bǎo hù', 'Pending Practice', 'amber',
    '[{"word":"回收","pinyin":"huí shōu"},{"word":"节约","pinyin":"jié yuē"},{"word":"污染","pinyin":"wū rǎn"}]'::jsonb),
  ('b4000000-0000-4000-8000-000000000002', '第十五课 - 健康生活', 'P4', 2, 'jiàn kāng shēng huó', 'Completed (88%)', 'green',
    '[{"word":"运动","pinyin":"yùn dòng"},{"word":"均衡","pinyin":"jūn héng"},{"word":"休息","pinyin":"xiū xi"}]'::jsonb),
  ('b4000000-0000-4000-8000-000000000003', '第十六课 - 传统节日', 'P4', 3, 'chuán tǒng jié rì', 'Needs Revision', 'red',
    '[{"word":"春节","pinyin":"chūn jié"},{"word":"中秋节","pinyin":"zhōng qiū jié"},{"word":"元宵节","pinyin":"yuán xiāo jié"}]'::jsonb),
  ('b4000000-0000-4000-8000-000000000004', '第十七课 - 安全意识', 'P4', 4, 'ān quán yì shí', 'Pending Practice', 'amber',
    '[{"word":"安全","pinyin":"ān quán"},{"word":"危险","pinyin":"wēi xiǎn"},{"word":"小心","pinyin":"xiǎo xīn"}]'::jsonb),

  ('b5000000-0000-4000-8000-000000000001', '第十七课 - 科技生活', 'P5', 1, 'kē jì shēng huó', 'Completed (76%)', 'green',
    '[{"word":"电脑","pinyin":"diàn nǎo"},{"word":"网络","pinyin":"wǎng luò"},{"word":"手机","pinyin":"shǒu jī"}]'::jsonb),
  ('b5000000-0000-4000-8000-000000000002', '第十八课 - 社会关怀', 'P5', 2, 'shè huì guān huái', 'Pending Practice', 'amber',
    '[{"word":"义工","pinyin":"yì gōng"},{"word":"关怀","pinyin":"guān huái"},{"word":"社区","pinyin":"shè qū"}]'::jsonb),
  ('b5000000-0000-4000-8000-000000000003', '第十九课 - 可持续发展', 'P5', 3, 'kě chí xù fā zhǎn', 'Needs Revision', 'red',
    '[{"word":"资源","pinyin":"zī yuán"},{"word":"循环","pinyin":"xún huán"},{"word":"再造","pinyin":"zài zào"}]'::jsonb),
  ('b5000000-0000-4000-8000-000000000004', '第二十课 - 时事新闻', 'P5', 4, 'shí shì xīn wén', 'Completed (79%)', 'green',
    '[{"word":"新闻","pinyin":"xīn wén"},{"word":"报道","pinyin":"bào dào"},{"word":"事件","pinyin":"shì jiàn"}]'::jsonb),

  ('b6000000-0000-4000-8000-000000000001', '第二十课 - 价值观', 'P6', 1, 'jià zhí guān', 'Needs Revision', 'red',
    '[{"word":"诚实","pinyin":"chéng shí"},{"word":"勇敢","pinyin":"yǒng gǎn"},{"word":"坚持","pinyin":"jiān chí"}]'::jsonb),
  ('b6000000-0000-4000-8000-000000000002', '第二十一课 - 国民教育', 'P6', 2, 'guó mín jiào yù', 'Pending Practice', 'amber',
    '[{"word":"独立","pinyin":"dú lì"},{"word":"团结","pinyin":"tuán jié"},{"word":"种族","pinyin":"zhǒng zú"}]'::jsonb),
  ('b6000000-0000-4000-8000-000000000003', '第二十二课 - 写作技巧', 'P6', 3, 'xiě zuò jì qiǎo', 'Completed (72%)', 'green',
    '[{"word":"观点","pinyin":"guān diǎn"},{"word":"论据","pinyin":"lùn jù"},{"word":"总结","pinyin":"zǒng jié"}]'::jsonb),
  ('b6000000-0000-4000-8000-000000000004', '第二十三课 - 演讲技巧', 'P6', 4, 'yǎn jiǎng jì qiǎo', 'Needs Revision', 'red',
    '[{"word":"演讲","pinyin":"yǎn jiǎng"},{"word":"自信","pinyin":"zì xìn"},{"word":"表达","pinyin":"biǎo dá"}]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  moe_level = excluded.moe_level,
  week_number = excluded.week_number,
  pinyin = excluded.pinyin,
  status_label = excluded.status_label,
  status_tone = excluded.status_tone,
  word_list = excluded.word_list;

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

-- Lesson content isn't sensitive, so anyone can browse the syllabus even
-- before signing in (grading/printing still require a real session).
drop policy if exists "Authenticated users can read lessons" on public.lessons;
drop policy if exists "Anyone can read lessons" on public.lessons;
create policy "Anyone can read lessons" on public.lessons for select using (true);

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
