-- Rondje Rekenen — initial schema + RLS
create extension if not exists "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  class_code char(5) unique not null,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  class_code char(5) not null references teachers(class_code) on delete cascade,
  grade int not null check (grade between 4 and 8),
  coins int not null default 0,
  current_operation text not null default 'plus',
  avatar_outfit jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (nickname, class_code)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null default current_date,
  operation text not null,
  total int not null default 0,
  correct int not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  question text not null,
  correct_answer int not null,
  student_answer int,
  is_correct boolean not null default false,
  response_time_ms int,
  created_at timestamptz not null default now()
);

create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  cost int not null,
  asset_key text not null
);

create table if not exists student_items (
  student_id uuid not null references students(id) on delete cascade,
  item_id uuid not null references shop_items(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  primary key (student_id, item_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_students_class_code on students(class_code);
create index if not exists idx_sessions_student on sessions(student_id);
create index if not exists idx_answers_session on answers(session_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- We use the service_role key on the server, so we allow all operations via
-- the service role and disable access for the anon key.

alter table teachers enable row level security;
alter table students enable row level security;
alter table sessions enable row level security;
alter table answers enable row level security;
alter table shop_items enable row level security;
alter table student_items enable row level security;

-- Service role bypasses RLS by default in Supabase — no extra policy needed.
-- The policies below let the anon key do nothing (safe default).
-- If you ever need anon reads for shop_items, uncomment:
-- create policy "shop_items public read" on shop_items for select using (true);
