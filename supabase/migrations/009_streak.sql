alter table students add column if not exists streak int not null default 0;
alter table students add column if not exists streak_updated_date date;
alter table students add column if not exists streak_lost int not null default 0;
