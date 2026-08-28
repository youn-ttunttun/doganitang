# Teamlesson

노베이스를 위한 수능수학 — Teamlesson 공식 웹사이트.

React + TypeScript + Vite로 만든 정적 사이트이며, 신청서 접수는 Supabase를 사용합니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 에 배포용 파일 생성
npm run typecheck  # 타입 검사만
```

## 문구 수정하기

사이트에 보이는 **모든 텍스트는 `src/content.ts` 한 파일**에 모여 있습니다.
선생님이 추가되거나 커리큘럼·지표가 바뀌면 이 파일만 고치면 됩니다.

| 고치고 싶은 것 | `src/content.ts` 안에서 찾을 이름 |
| --- | --- |
| 사이트 이름·인스타·이메일 | `site` |
| 첫 화면 문구 | `hero` |
| 지표 (누적 학생 수 등) | `stats` |
| 브랜드 스토리 | `story` |
| 수업 철학 3가지 | `principles` |
| 커리큘럼 (Pre·대수·미적분1) | `curriculum` |
| 대표 선생님 | `leads` |
| 튜터 명단 | `tutors` |
| 자주 묻는 질문 | `faqs` |
| 성적 변화 배지 (첫 화면 띠) | `scoreBadges` |
| 성적 변화 사례 | `resultCases` |
| 수강생 후기 | `reviews` |
| 경쟁사 비교표 | `positioning` |
| 교재 소개·사진 | `material` |

> `scoreBadges` · `resultCases` · `reviews` 는 **비어 있으면 해당 섹션이 화면에서 사라집니다.**
> 자료가 준비되는 대로 채우면 그때 켜집니다. 확인되지 않은 수치는 넣지 마세요.

## 진단 테스트 문항 수정하기

**Supabase를 연결하면 코드를 건드릴 필요가 없습니다.** 로그인 후
`/app/questions` 에서 문항을 추가·수정·삭제·정렬할 수 있습니다.

- 객관식과 단답형을 섞어 쓸 수 있습니다
- 단답형은 공백·대소문자를 무시하고 채점합니다 (`5 / 6` = `5/6`)
- 표기가 갈릴 수 있는 답은 정답 칸에 쉼표로 여러 개 적어두세요
- 문항을 끄면(출제 안 함) 지우지 않고도 출제에서 빠집니다
- 처음 들어가면 «기본 문항 12개 가져오기» 버튼으로 시작할 수 있습니다

> **정답은 브라우저로 내려가지 않습니다.** 학생 화면에는 정답 칸을 뺀
> 목록만 내려가고, 채점은 DB 안에서 이뤄집니다. F12를 열어도 정답을
> 볼 수 없습니다.

Supabase를 아직 연결하지 않았다면 `src/diagnostic.ts` 의 기본 문항으로
동작합니다. (이때는 브라우저에서 채점하므로 정답이 노출됩니다)

결과 구간(Pre부터 / 대수부터 / 바로 시작)은 `src/diagnostic.ts` 의
`VERDICTS` 에서 조정합니다.

## 관리자 계정 만들기

1. 사이트에서 `/app/login` 으로 들어가 **가입하기**로 계정을 만듭니다
2. 메일로 온 인증 링크를 누릅니다
3. Supabase SQL Editor에서 아래를 실행합니다 (이메일은 본인 것으로)

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

4. 다시 로그인하면 «진단 문항»과 «신청서» 메뉴가 보입니다

가입한 사람은 기본적으로 `student` 역할이라 관리자 화면이 보이지 않습니다.

## 신청서 접수 (Supabase 연결)

연결 전에도 사이트는 정상 동작합니다. 이때 신청 폼은 작성 내용을 정리해
**인스타그램 DM으로 보내는 방식**으로 자동 전환됩니다.

연결하려면:

1. [supabase.com](https://supabase.com)에서 프로젝트를 만듭니다. (무료)
2. **SQL Editor**에 `supabase/schema.sql` 내용을 붙여넣고 실행합니다.
3. **Project Settings → API**에서 URL과 anon key를 복사합니다.
4. `.env.example`을 `.env.local`로 복사해 값을 채웁니다.
5. `npm run dev`로 다시 실행하면 신청서가 DB에 저장됩니다.

접수된 신청서는 로그인 후 `/app/applications` 에서 확인하고, 처리 상태를
접수 → 연락 완료 → 등록 완료 로 옮길 수 있습니다.

> anon key는 브라우저에 노출되는 공개 키입니다. 신청서 **작성만** 허용되고
> 조회·수정·삭제는 RLS 정책으로 막혀 있어, 다른 사람의 신청 내용을 볼 수 없습니다.

## 앞으로의 단계

- **완료** 홍보 페이지 + 무료 온라인 진단 테스트 + 신청 폼
- **완료** 로그인 · 역할 구분 · 관리자 화면 (진단 문항 편집 / 신청서 관리)
- 다음 수강생 페이지 (공지·숙제·자료·질문)
- 다음 튜터 페이지 (질문 답변·숙제 채점)
- 다음 통계 대시보드
