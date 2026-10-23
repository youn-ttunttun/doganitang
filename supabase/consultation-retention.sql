-- 승인 후 적용: 새 동의문에 동의한 신청 중 상담 종료 30일이 지난 건만 영구 삭제합니다.
-- 기존 동의문 신청과 수강 등록 신청에는 적용하지 않습니다.
create extension if not exists pg_cron;
select cron.schedule('teamlesson-consultation-retention','0 17 * * *', $job$
  delete from public.applications
  where status='closed' and closed_at <= now()-interval '29 days'
    and consent_version='2026-10-24';
$job$);
