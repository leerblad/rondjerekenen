alter table students add column if not exists owned_backgrounds text[] not null default '{}';
