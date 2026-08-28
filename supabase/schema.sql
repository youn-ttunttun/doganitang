-- ─────────────────────────────────────────────────────────────
-- Teamlesson · 1단계 스키마 (신청서 접수)
--
-- Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 Run 하세요.
-- ─────────────────────────────────────────────────────────────

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

  -- 관리자가 처리 상태를 옮겨가며 씁니다: 접수 → 연락 완료 → 등록 완료 / 보류
  status      text not null default 'new'
              check (status in ('new', 'contacted', 'enrolled', 'closed')),
  admin_memo  text default ''
);

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

-- ── 권한 ──────────────────────────────────────────────────────
-- RLS를 켜면 정책으로 허용한 동작만 가능해집니다.
alter table public.applications enable row level security;

-- 누구나 신청서를 "넣을" 수는 있지만
drop policy if exists "anyone can submit an application" on public.applications;
create policy "anyone can submit an application"
  on public.applications for insert
  to anon, authenticated
  with check (true);

-- 읽기·수정·삭제 정책은 만들지 않습니다.
-- → 브라우저에 노출되는 anon key로는 다른 사람의 신청서를 절대 조회할 수 없습니다.
--   관리자 조회는 2단계에서 로그인 + 역할(admin) 기반 정책으로 추가합니다.
