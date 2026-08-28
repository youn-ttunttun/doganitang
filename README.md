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

문항은 **`src/diagnostic.ts`** 에 있습니다. 객관식과 단답형을 섞어 쓸 수 있고,
문항을 더하거나 빼도 채점과 결과 판정이 자동으로 맞춰집니다.
파일 맨 위 주석에 문항 추가 형식이 예시와 함께 적혀 있습니다.

- 단답형은 공백·대소문자를 무시하고 채점합니다 (`5 / 6` = `5/6`)
- 표기가 갈릴 수 있는 답은 `accept` 에 여러 개 적어두세요
- 결과 구간(Pre부터 / 대수부터 / 바로 시작)은 같은 파일의 `VERDICTS` 에서 조정합니다

## 신청서 접수 (Supabase 연결)

연결 전에도 사이트는 정상 동작합니다. 이때 신청 폼은 작성 내용을 정리해
**인스타그램 DM으로 보내는 방식**으로 자동 전환됩니다.

연결하려면:

1. [supabase.com](https://supabase.com)에서 프로젝트를 만듭니다. (무료)
2. **SQL Editor**에 `supabase/schema.sql` 내용을 붙여넣고 실행합니다.
3. **Project Settings → API**에서 URL과 anon key를 복사합니다.
4. `.env.example`을 `.env.local`로 복사해 값을 채웁니다.
5. `npm run dev`로 다시 실행하면 신청서가 DB에 저장됩니다.

접수된 신청서는 Supabase 대시보드의 **Table Editor → applications**에서 볼 수 있습니다.
(관리자 화면은 2단계에서 만듭니다.)

> anon key는 브라우저에 노출되는 공개 키입니다. 신청서 **작성만** 허용되고
> 조회·수정·삭제는 RLS 정책으로 막혀 있어, 다른 사람의 신청 내용을 볼 수 없습니다.

## 앞으로의 단계

- **1단계 (현재)** 홍보 페이지 + 무료 온라인 진단 테스트 + 신청 폼
- 2단계 로그인 + 관리자 신청서 관리
- 3단계 수강생 페이지 (공지·숙제·자료·질문)
- 4단계 튜터 페이지 (질문 답변·숙제 채점)
- 5단계 통계 대시보드 · 진단 테스트 온라인 응시
