begin;
alter table public.applications add column if not exists payment_terms_agreed boolean,
add column if not exists payment_terms_version text, add column if not exists payment_terms_at timestamptz;
create or replace function private.validate_payment_terms() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.payment_terms_version is not null then
  if new.payment_terms_version <> '2026-10-25-payment-v1' or new.payment_terms_agreed is distinct from true then
   raise exception '결제·환불 조건에 동의해주세요.' using errcode='23514';
  end if;
  new.payment_terms_at:=now();
 else new.payment_terms_agreed:=null; new.payment_terms_at:=null; end if;
 return new;
end $$;
revoke all on function private.validate_payment_terms() from public,anon,authenticated;
create or replace trigger validate_payment_terms before insert on public.applications
for each row execute function private.validate_payment_terms();
create or replace function public.lms_list_applications(p_token text, p_page integer default 1, p_status text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb; total integer;
begin
  perform private.check_lms_connection(p_token);
  if p_page < 1 or p_page > 20000 or p_page is null or p_status is null or p_status not in ('','new','contacted','enrolled','closed') then raise exception '잘못된 조회'; end if;
  select count(*) into total from public.applications where hidden = false and (p_status='' or status=p_status);
  select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) into result from (
    select id,created_at,kind,name,plan,payment_terms_agreed,payment_terms_version,payment_terms_at,contact,guardian_contact,grade,course,level,message,status,admin_memo,lms_revision,birth_year,gender,recent_exam,recent_grade,source,tuition_confirmed,consent_version,consent_at,marketing_sms,marketing_email,marketing_phone,marketing_email_address,marketing_consent_at,marketing_withdrawn_at
    from public.applications where hidden = false and (p_status='' or status=p_status)
    order by created_at desc,id desc limit 30 offset (p_page-1)*30
  ) a;
  return jsonb_build_object('items',result,'total',total,'completed_total',(select completed_total from private.consultation_totals where id=true));
end $$;




commit;
