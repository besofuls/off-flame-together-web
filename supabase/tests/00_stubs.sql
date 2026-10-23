-- Test harness: stubs Supabase pieces, then runs migration, seed and authz checks.
-- (Not part of the deliverable schema.)
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public, auth to anon, authenticated;
-- Supabase default privileges (grants then get revoked by migration)
alter default privileges in schema public grant all on tables to anon, authenticated;

insert into auth.users values
 ('00000000-0000-0000-0000-0000000000aa','admin@test.dev'),
 ('00000000-0000-0000-0000-0000000000bb','visitor@test.dev');
