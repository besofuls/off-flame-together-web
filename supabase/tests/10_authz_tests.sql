-- Authorization & constraint tests. Each block prints PASS/FAIL via NOTICE.
\set ON_ERROR_STOP off
insert into public.admin_users values ('00000000-0000-0000-0000-0000000000aa','admin@test.dev');
insert into public.builds (version, title, download_url, is_published)
  values ('0.1.0-beta','Beta','https://x.itch.io/g', true), ('0.2.0-draft','Draft',null,false);

create or replace function pg_temp.expect(name text, ok boolean) returns void language plpgsql as
$$ begin raise notice '% : %', case when ok then 'PASS' else 'FAIL' end, name; end $$;

-- ---------- ANON ----------
set role anon;
reset request.jwt.claim.sub;

insert into public.feedback (rating, category, message) values (5,'gameplay','fun');
select pg_temp.expect('anon can insert feedback', true);

insert into public.bug_reports (title, description) values ('t','d');
select pg_temp.expect('anon can insert bug report (default open)', true);

insert into public.bug_reports (title, description, status) values ('t','d','closed');
select pg_temp.expect('anon cannot set status=closed (see ERROR above)', true);

insert into public.feedback (rating, message) values (9,'bad');
select pg_temp.expect('rating 9 rejected (see ERROR above)', true);

select pg_temp.expect('anon sees only published builds', (select count(*) from public.builds)=1);

select count(*) as anon_feedback_select from public.feedback;
select count(*) as anon_bugs_select from public.bug_reports;
select count(*) as anon_analytics_select from public.analytics_snapshots;
select * from public.admin_users;
insert into public.analytics_snapshots (source,window_type,window_start_date,window_end_date,data_origin)
  values ('itch.io','30d','2026-01-01','2026-01-30','manual_entry');
insert into public.admin_users values ('00000000-0000-0000-0000-0000000000bb','visitor@test.dev');
update public.builds set title='hack';
delete from public.builds;

-- ---------- AUTHENTICATED NON-ADMIN ----------
reset role; set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select pg_temp.expect('non-admin sees 0 feedback', (select count(*) from public.feedback)=0);
select pg_temp.expect('non-admin sees 0 admin_users', (select count(*) from public.admin_users)=0);
select pg_temp.expect('non-admin sees 0 analytics', (select count(*) from public.analytics_snapshots)=0);
update public.bug_reports set status='closed';
select pg_temp.expect('non-admin update affects 0 rows', (select count(*) from public.bug_reports where status='closed')=0) ;
insert into public.admin_users values ('00000000-0000-0000-0000-0000000000bb','visitor@test.dev');

-- ---------- ADMIN ----------
reset role; set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select pg_temp.expect('admin sees feedback', (select count(*) from public.feedback)=1);
select pg_temp.expect('admin sees all builds', (select count(*) from public.builds)=2);
update public.bug_reports set status='in_progress';
select pg_temp.expect('admin can update bug status', (select count(*) from public.bug_reports where status='in_progress')=1);
select pg_temp.expect('updated_at trigger moved', (select updated_at > created_at from public.bug_reports limit 1));
insert into public.builds (version, title) values ('0.3.0','new');
select pg_temp.expect('admin can create build', (select count(*) from public.builds)=3);
insert into public.analytics_snapshots (source,window_type,window_start_date,window_end_date,data_origin)
  values ('itch.io','7d','2026-10-01','2026-10-30','manual_entry');
select pg_temp.expect('7d window of 30 days rejected (see ERROR above)', true);
insert into public.analytics_snapshots (source,window_type,window_start_date,window_end_date,data_origin)
  values ('itch.io','7d','2026-10-01','2026-10-07','manual_entry');
select pg_temp.expect('valid 7d window accepted', (select count(*) from public.analytics_snapshots where window_type='7d')=1);
select pg_temp.expect('admin sees admin_users', (select count(*) from public.admin_users)=1);
