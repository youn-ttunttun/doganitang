begin;
alter table public.applications
 add column if not exists marketing_sms boolean not null default false,
 add column if not exists marketing_email boolean not null default false,
 add column if not exists marketing_phone text,
 add column if not exists marketing_email_address text,
 add column if not exists marketing_consent_version text,
 add column if not exists marketing_consent_at timestamptz,
 add column if not exists marketing_withdrawn_at timestamptz,
 add column if not exists completion_counted boolean not null default false;

-- 개인을 식별하는 키 없이 누적 총계만 보관합니다.
create table if not exists private.consultation_totals (
 id boolean primary key default true check(id), completed_total bigint not null default 0
);
alter table private.consultation_totals enable row level security;
revoke all on private.consultation_totals from public,anon,authenticated;
insert into private.consultation_totals(id) values(true) on conflict do nothing;
with counted as (
 update public.applications set completion_counted=true
 where not completion_counted and not hidden and status in ('enrolled','closed') returning 1
) update private.consultation_totals set completed_total=completed_total+(select count(*) from counted) where id=true;

create or replace function private.track_consultation_completion() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then new.completion_counted:=false; return new; end if;
 new.completion_counted:=old.completion_counted;
 if not old.completion_counted and not new.hidden and new.status in ('enrolled','closed') then
  update private.consultation_totals set completed_total=completed_total+1 where id=true;
  new.completion_counted:=true;
 end if;
 return new;
end $$;
revoke all on function private.track_consultation_completion() from public,anon,authenticated;
create or replace trigger track_consultation_completion before insert or update on public.applications
for each row execute function private.track_consultation_completion();

create or replace function private.validate_application_v3() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.form_version=3 then
  if new.birth_year is null or new.birth_year not between 1950 and 2012
    or new.grade not in ('고1','고2','고3','N수','중등','자퇴','기타: 직장인, 만학도 등')
    or coalesce(length(trim(new.level)),0)=0 or coalesce(length(trim(new.source)),0)=0
    or (new.grade in ('고1','고2','고3','중등') and coalesce(length(trim(new.guardian_contact)),0)=0)
    or new.tuition_confirmed is distinct from true
    or new.consent_version is distinct from '2026-10-24-v3' or new.consent_at is null
    or new.recent_grade in ('1등급','2등급') then
   raise exception '필수 신청 항목을 확인해주세요.' using errcode='23514';
  end if;
  new.consent_at:=now();
 end if;
 if new.marketing_sms or new.marketing_email then
  if new.form_version<>3 or new.marketing_consent_version is distinct from '2026-10-24-v3'
   or (new.marketing_sms and (new.marketing_phone is null or new.marketing_phone !~ '^01[016789][0-9]{7,8}$'))
   or (new.marketing_email and (new.marketing_email_address is null or length(new.marketing_email_address)>254 or new.marketing_email_address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) then
   raise exception '광고 수신 연락처와 동의를 확인해주세요.' using errcode='23514';
  end if;
  new.marketing_consent_at:=now();
 else
  new.marketing_consent_at:=null; new.marketing_consent_version:=null;
 end if;
 if not new.marketing_sms then new.marketing_phone:=null; end if;
 if not new.marketing_email then new.marketing_email_address:=null; end if;
 return new;
end $$;
revoke all on function private.validate_application_v3() from public,anon,authenticated;
create or replace trigger validate_application_v3 before insert on public.applications
for each row execute function private.validate_application_v3();

create or replace function public.lms_withdraw_marketing(p_token text,p_id uuid,p_revision integer) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform private.check_lms_connection(p_token);
 update public.applications set marketing_sms=false,marketing_email=false,marketing_phone=null,
  marketing_email_address=null,marketing_withdrawn_at=now()
 where id=p_id and lms_revision=p_revision and not hidden;
 if not found then raise exception '신청이 변경되었습니다.' using errcode='40001'; end if;
end $$;
revoke all on function public.lms_withdraw_marketing(text,uuid,integer) from public;
grant execute on function public.lms_withdraw_marketing(text,uuid,integer) to anon,authenticated;

-- 기존 30일 동의문에는 30일, 새 90일 동의문에는 90일을 적용합니다.
create or replace function private.purge_expired_consultations() returns bigint
language plpgsql security definer set search_path='' as $$
declare removed bigint;
begin
 delete from public.applications where status='closed' and (
  (consent_version='2026-10-24-v3' and closed_at <= now()-interval '89 days') or
  (consent_version='2026-10-24' and closed_at <= now()-interval '29 days')
 );
 get diagnostics removed=row_count;
 return removed;
end $$;
revoke all on function private.purge_expired_consultations() from public,anon,authenticated;
create or replace function public.lms_list_applications(p_token text, p_page integer default 1, p_status text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb; total integer;
begin
  perform private.check_lms_connection(p_token);
  if p_page < 1 or p_page > 20000 or p_page is null or p_status is null or p_status not in ('','new','contacted','enrolled','closed') then raise exception '잘못된 조회'; end if;
  select count(*) into total from public.applications where hidden = false and (p_status='' or status=p_status);
  select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) into result from (
    select id,created_at,kind,name,contact,guardian_contact,grade,course,level,message,status,admin_memo,lms_revision,birth_year,gender,recent_exam,recent_grade,source,tuition_confirmed,consent_version,consent_at,marketing_sms,marketing_email,marketing_phone,marketing_email_address,marketing_consent_at,marketing_withdrawn_at
    from public.applications where hidden = false and (p_status='' or status=p_status)
    order by created_at desc,id desc limit 30 offset (p_page-1)*30
  ) a;
  return jsonb_build_object('items',result,'total',total,'completed_total',(select completed_total from private.consultation_totals where id=true));
end $$;


commit;
