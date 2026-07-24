-- Background purchased by student
alter table students add column if not exists background text;

-- Mark a session as a bonus (extra) session
alter table sessions add column if not exists bonus boolean not null default false;
