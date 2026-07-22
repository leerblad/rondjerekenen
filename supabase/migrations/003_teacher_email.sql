alter table teachers add column if not exists email text;
alter table students add column if not exists password_hash text;

create table if not exists admin_messages (
  id uuid primary key default gen_random_uuid(),
  to_teacher_id uuid references teachers(id) on delete cascade,
  subject text not null,
  body text not null,
  read boolean not null default false,
  sent_at timestamptz not null default now()
);
alter table admin_messages enable row level security;
