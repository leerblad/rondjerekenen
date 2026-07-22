-- Add level column to students (global level 1-140)
alter table students add column if not exists level int not null default 1;

-- Add level to sessions so unlock checks stay accurate after advancing
alter table sessions add column if not exists level int not null default 1;
