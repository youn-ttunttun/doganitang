-- 기존 홍보 사이트 프로젝트에만 적용합니다. LMS DB에는 실행하지 않습니다.
begin;
alter table public.applications
  add column if not exists source text default '',
  add column if not exists recent_grade text default '',
  add column if not exists birth_year integer check (birth_year between 1950 and 2026),
  add column if not exists gender text default '' check (gender in ('','여성','남성','공개하지 않음')),
  add column if not exists recent_exam text default '' check (length(recent_exam)<=200),
  add column if not exists tuition_confirmed boolean,
  add column if not exists consent_version text,
  add column if not exists consent_at timestamptz,
  add column if not exists form_version integer default 1,
  add column if not exists closed_at timestamptz;
create schema if not exists private;
create table if not exists private.lms_connection (
  id boolean primary key default true check(id),
  token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$')
);
alter table private.lms_connection enable row level security;
revoke all on private.lms_connection from public, anon, authenticated;
alter table public.applications add column if not exists lms_revision integer not null default 0;

create or replace function private.check_lms_connection(p_token text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_token is null or length(p_token) < 64 or length(p_token) > 256 or not exists (
    select 1 from private.lms_connection where token_hash = encode(sha256(convert_to(p_token,'UTF8')),'hex')
  ) then raise exception '연결 인증 실패' using errcode='28000'; end if;
end $$;
revoke all on function private.check_lms_connection(text) from public, anon, authenticated;

-- 윤님의 기존 관리자 화면에서 수정해도 LMS의 동시 수정 검사가 작동합니다.
create or replace function private.bump_application_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.lms_revision := old.lms_revision + 1;
  if new.status='closed' and old.status<>'closed' then new.closed_at:=now();
  elsif new.status<>'closed' then new.closed_at:=null; end if;
  return new;
end $$;

create or replace trigger bump_lms_revision before update on public.applications for each row execute function private.bump_application_revision();

create or replace function public.lms_list_applications(p_token text, p_page integer default 1, p_status text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb; total integer;
begin
  perform private.check_lms_connection(p_token);
  if p_page < 1 or p_page > 20000 or p_page is null or p_status is null or p_status not in ('','new','contacted','enrolled','closed') then raise exception '잘못된 조회'; end if;
  select count(*) into total from public.applications where hidden = false and (p_status='' or status=p_status);
  select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) into result from (
    select id,created_at,kind,name,contact,guardian_contact,grade,course,level,message,status,admin_memo,lms_revision,birth_year,gender,recent_exam,recent_grade,source,tuition_confirmed,consent_version,consent_at
    from public.applications where hidden = false and (p_status='' or status=p_status)
    order by created_at desc,id desc limit 30 offset (p_page-1)*30
  ) a;
  return jsonb_build_object('items',result,'total',total);
end $$;

create or replace function public.lms_update_application(p_token text,p_id uuid,p_revision integer,p_status text,p_memo text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.check_lms_connection(p_token);
  if p_status is null or p_status not in ('new','contacted','enrolled','closed') or p_memo is null or length(p_memo)>4000 then raise exception '잘못된 입력'; end if;
  update public.applications set status=p_status,admin_memo=p_memo
    where id=p_id and lms_revision=p_revision and hidden=false;
  if not found then raise exception '신청이 변경되거나 숨겨졌습니다. 새로고침하세요.' using errcode='40001'; end if;
end $$;
revoke all on function public.lms_list_applications(text,integer,text) from public;
revoke all on function public.lms_update_application(text,uuid,integer,text,text) from public;
grant execute on function public.lms_list_applications(text,integer,text) to anon,authenticated;
grant execute on function public.lms_update_application(text,uuid,integer,text,text) to anon,authenticated;
commit;

-- 연결키 원문은 여기 넣지 않습니다. 운영 연결 시 운영자가 별도로 만든 32바이트
-- 무작위 키의 SHA-256 해시를 private.lms_connection에 저장하고 원문은 LMS Secret에만 둡니다.
