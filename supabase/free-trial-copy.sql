-- 관리자 화면에 저장된 문구 중 시범 수업 가격만 무료로 변경합니다.
begin;
update public.site_content set data=jsonb_set(data,'{apply,sub}',to_jsonb(replace(replace(data#>>'{apply,sub}','10,000원','무료'),'1만원','무료'))),updated_at=now()
where id='main' and data#>>'{apply,sub}' is not null;
update public.site_content set data=jsonb_set(data,'{pricing,notes}',(
 select jsonb_agg(case when value like '%시범%' then replace(replace(value,'10,000원','무료'),'1만원','무료') else value end order by ord)
 from jsonb_array_elements_text(data#>'{pricing,notes}') with ordinality as n(value,ord)
)),updated_at=now()
where id='main' and jsonb_typeof(data#>'{pricing,notes}')='array' and jsonb_array_length(data#>'{pricing,notes}')>0;
update public.site_content set data=jsonb_set(data,'{process,steps}',(
 select jsonb_agg(case when value->>'title' like '%시범%' and value->>'desc' is not null
 then jsonb_set(value,'{desc}',to_jsonb(replace(replace(value->>'desc','10,000원','무료'),'1만원','무료'))) else value end order by ord)
 from jsonb_array_elements(data#>'{process,steps}') with ordinality as n(value,ord)
)),updated_at=now()
where id='main' and jsonb_typeof(data#>'{process,steps}')='array' and jsonb_array_length(data#>'{process,steps}')>0;
commit;
