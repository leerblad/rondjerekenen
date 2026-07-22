-- Add avatar_url to teachers
alter table teachers add column if not exists avatar_url text;
