-- ─────────────────────────────────────────────────────────────
-- Teamlesson · 데이터베이스 스키마
--
-- Supabase 대시보드 > SQL Editor 에 이 파일 내용을 통째로 붙여넣고
-- Run 하세요. 여러 번 실행해도 안전합니다.
-- ─────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════
-- 1. 사용자 프로필 (역할 관리)
-- ═════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  name       text not null default '',
  -- student: 수강생 / tutor: 튜터 / admin: 관리자
  role       text not null default 'student'
             check (role in ('student', 'tutor', 'admin'))
);

alter table public.profiles enable row level security;

-- 회원가입하면 프로필이 자동으로 생깁니다 (기본 역할: student).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자인지 확인하는 함수.
-- security definer 라서 RLS를 우회해 profiles를 읽습니다.
-- (정책 안에서 profiles를 직접 읽으면 무한 재귀가 납니다)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "본인 프로필 읽기" on public.profiles;
create policy "본인 프로필 읽기"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "관리자만 프로필 수정" on public.profiles;
create policy "관리자만 프로필 수정"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ═════════════════════════════════════════════════════════════
-- 2. 신청서
-- ═════════════════════════════════════════════════════════════

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- consult: 수업 등록 상담 / diagnostic: 진단 테스트
  kind        text not null check (kind in ('consult', 'diagnostic')),

  name        text not null check (char_length(name) between 1 and 40),
  contact     text not null check (char_length(contact) between 1 and 120),
  grade       text not null check (char_length(grade) <= 40),
  course      text not null check (char_length(course) <= 40),
  level       text default '' check (char_length(level) <= 500),
  message     text default '' check (char_length(message) <= 2000),

  -- 관리자가 처리 상태를 옮겨가며 씁니다
  status      text not null default 'new'
              check (status in ('new', 'contacted', 'enrolled', 'closed')),
  admin_memo  text default ''
);

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

alter table public.applications enable row level security;

-- 누구나 신청서를 넣을 수는 있지만
drop policy if exists "누구나 신청 가능" on public.applications;
create policy "누구나 신청 가능"
  on public.applications for insert
  to anon, authenticated
  with check (true);

-- 읽고 고치는 건 관리자만. 익명 키로는 남의 신청서를 볼 수 없습니다.
drop policy if exists "관리자만 신청서 조회" on public.applications;
create policy "관리자만 신청서 조회"
  on public.applications for select
  to authenticated
  using (public.is_admin());

drop policy if exists "관리자만 신청서 수정" on public.applications;
create policy "관리자만 신청서 수정"
  on public.applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ═════════════════════════════════════════════════════════════
-- 3. 진단 테스트 문항
--
--   정답(answer, accept)은 이 테이블에만 있고 브라우저로 내려가지
--   않습니다. 학생에게는 정답 칸이 빠진 view만 보이고, 채점은
--   아래 grade_diagnostic 함수가 DB 안에서 처리합니다.
-- ═════════════════════════════════════════════════════════════

create table if not exists public.diagnostic_questions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  position    int  not null default 0,      -- 출제 순서
  active      bool not null default true,   -- 끄면 출제되지 않습니다

  type        text not null check (type in ('choice', 'short')),
  concept     text not null default '',     -- 결과 화면의 '개념' 이름
  stage       text not null default 'middle'
              check (stage in ('middle', 'high1', 'high2')),
  prompt      text not null,

  -- 객관식용
  choices     jsonb not null default '[]'::jsonb,
  answer      int,

  -- 단답형용
  placeholder text default '',
  accept      text[] not null default '{}',

  -- 유형에 맞는 값이 채워졌는지 확인합니다
  constraint diagnostic_shape check (
    (type = 'choice' and answer is not null and jsonb_array_length(choices) >= 2)
    or
    (type = 'short' and array_length(accept, 1) >= 1)
  )
);

create index if not exists diagnostic_questions_position_idx
  on public.diagnostic_questions (position, created_at);

alter table public.diagnostic_questions enable row level security;

-- 관리자만 문항을 보고 고칠 수 있습니다 (정답이 포함된 원본 테이블)
drop policy if exists "관리자만 문항 관리" on public.diagnostic_questions;
create policy "관리자만 문항 관리"
  on public.diagnostic_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 학생에게 내려가는 view — 정답 칸(answer, accept)이 없습니다.
create or replace view public.diagnostic_public
with (security_invoker = false) as
  select id, position, type, concept, stage, prompt, choices, placeholder
  from public.diagnostic_questions
  where active
  order by position, created_at;

grant select on public.diagnostic_public to anon, authenticated;


-- ── 채점 (DB 안에서 처리) ────────────────────────────────────
-- 단답형은 공백·대소문자·유니코드 기호 차이를 무시하고 비교합니다.

create or replace function public.normalize_answer(value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    translate(lower(trim(value)), '−–—（），', '---(),'),
    '\s', '', 'g'
  );
$$;

-- 입력 형식: [{"id": "문항 uuid", "value": "학생이 낸 답"}, ...]
-- 객관식의 value 는 고른 보기 번호를 문자열로 넣습니다. 예) "2"
create or replace function public.grade_diagnostic(submission jsonb)
returns jsonb
language plpgsql
stable
security definer set search_path = public
as $$
declare
  total   int := 0;
  correct int := 0;
  details jsonb := '[]'::jsonb;
  q       record;
  given   text;
  ok      boolean;
begin
  for q in
    select * from public.diagnostic_questions where active
    order by position, created_at
  loop
    total := total + 1;
    given := null;

    select item->>'value' into given
    from jsonb_array_elements(submission) as item
    where item->>'id' = q.id::text
    limit 1;

    if given is null or normalize_answer(given) = '' then
      ok := null;  -- 미응답
    elsif q.type = 'choice' then
      ok := (given = q.answer::text);
    else
      ok := exists (
        select 1 from unnest(q.accept) as a
        where normalize_answer(a) = normalize_answer(given)
      );
    end if;

    if ok then correct := correct + 1; end if;

    details := details || jsonb_build_object(
      'id', q.id,
      'concept', q.concept,
      'state', case when ok is null then 'skipped'
                    when ok then 'correct'
                    else 'wrong' end
    );
  end loop;

  return jsonb_build_object(
    'total', total,
    'correct', correct,
    'ratio', case when total = 0 then 0 else correct::numeric / total end,
    'details', details
  );
end;
$$;

grant execute on function public.grade_diagnostic(jsonb) to anon, authenticated;


-- ═════════════════════════════════════════════════════════════
-- 4. 접근 권한
--
--   아래는 "테이블에 손을 댈 수 있는가"이고, 실제로 어떤 행을 보고
--   고칠 수 있는지는 위의 RLS 정책이 결정합니다. 둘 다 있어야 합니다.
-- ═════════════════════════════════════════════════════════════

-- 신청서: 누구나 넣을 수 있고, 읽고 고치는 건 로그인한 사람만 (그중 관리자만 통과)
grant insert         on public.applications         to anon, authenticated;
grant select, update on public.applications         to authenticated;

-- 진단 문항 원본: 로그인한 사람만 (그중 관리자만 통과). anon에게는 권한을 주지 않습니다.
grant select, insert, update, delete
                     on public.diagnostic_questions to authenticated;

-- 프로필
grant select, update on public.profiles             to authenticated;


-- ═════════════════════════════════════════════════════════════
-- 5. 첫 관리자 지정
--
--   ① 사이트의 /app/login 에서 회원가입을 먼저 합니다.
--   ② 아래 이메일을 본인 것으로 바꾸고 이 문장만 다시 실행하세요.
-- ═════════════════════════════════════════════════════════════

-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'your@email.com');
