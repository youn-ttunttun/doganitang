-- 기존 신청은 유지하고 새 양식(form_version=2)만 검증합니다.
create or replace function private.validate_application_v2() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.form_version=2 then
    if new.birth_year is null or new.birth_year not between 1950 and 2026
      or new.grade not in ('고1','고2','고3','N수','중등','자퇴','기타: 직장인, 만학도 등')
      or coalesce(length(trim(new.level)),0)=0 or coalesce(length(trim(new.source)),0)=0
      or (new.grade in ('고1','고2','고3','중등') and coalesce(length(trim(new.guardian_contact)),0)=0)
      or new.tuition_confirmed is distinct from true
      or new.consent_version is distinct from '2026-10-24' or new.consent_at is null
      or new.recent_grade in ('1등급','2등급') then
      raise exception '필수 신청 항목을 확인해주세요.' using errcode='23514';
    end if;
  end if;
  return new;
end $$;
revoke all on function private.validate_application_v2() from public,anon,authenticated;
create or replace trigger validate_application_v2 before insert on public.applications
for each row execute function private.validate_application_v2();
