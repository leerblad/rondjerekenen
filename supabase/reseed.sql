-- Fix duplicate shop items caused by running the seed more than once.
-- This empties the shop_items table (and dependent rows via cascade), then
-- you can re-run seed.sql to insert a clean set.
truncate shop_items cascade;
