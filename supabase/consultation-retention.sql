-- 운영자 승인: 새 동의문 상담 종료 후 90일 이내 자동 파기. 기존 동의문은 기존 보유기간 준수.
create extension if not exists pg_cron;
select cron.schedule('teamlesson-consultation-retention','0 17 * * *', $job$
 select private.purge_expired_consultations();
$job$);
