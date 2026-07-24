-- Make student nicknames globally unique (was only unique per class)
alter table students drop constraint if exists students_nickname_class_code_key;
alter table students add constraint students_nickname_key unique (nickname);

-- Make teacher names globally unique
alter table teachers add constraint teachers_name_key unique (name);
