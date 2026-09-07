# Teamlesson — 인수인계 문서

> 이 파일은 Claude Code가 세션을 시작할 때 자동으로 읽습니다.
> **다른 계정·다른 세션에서 이어서 작업할 때 이 파일부터 읽으면 됩니다.**
> 사실이 바뀌면 이 파일도 같이 고쳐주세요.

---

## 1. 이 사업이 뭔지 (제일 중요)

**Teamlesson** — 노베이스 학생을 위한 **수능수학 1:1 과외** 서비스입니다.

- **공동대표 3인**이 자체 교재(Checklist 시리즈)와 커리큘럼을 만들고, 튜터를 교육합니다
- **실제 수업은 튜터가 진행합니다.** 구몬 같은 구조 — 표준화된 교재 + 커리큘럼을 튜터가 전달
- 커리큘럼: **Pre과정**(중등부터 다시) → **대수** → **미적분1**
- 수강료: **화상 38만원 / 대면 48만원** (4주 · 주 2회 · 회당 2시간 = 총 16시간), 계좌이체
- 무료 **온라인 진단 테스트**(약 20분)로 유입 → 결과지 → **정밀 상담(화상, 2만원)** 또는 수업 등록 상담
- 인스타그램 DM이 주 문의 창구

### ⚠️ 문구에서 절대 틀리면 안 되는 것

| 안 됨 | 맞음 |
| --- | --- |
| "서울대·연세대 재학생이 1:1로 가르칩니다" | "**수학 1등급 튜터**가 1:1로 진행합니다" |
| 대표진 학력을 수업 품질의 근거로 쓰기 | 대표진 학력은 **본인 프로필과 창업 스토리에만** |
| 확인 안 된 숫자(합격률·성적 상승폭 등) | 확인된 것만. 없으면 그 섹션은 비워두면 자동으로 사라집니다 |

전에 이걸 틀려서 지적받은 적이 있습니다. 사실관계는 추측하지 말고 물어보세요.

---

## 2. 지금 어디까지 왔는지

**완료**
- 홍보 페이지 (`/`) — 벤토 그리드 레이아웃, 반응형, 다크모드
- 무료 온라인 진단 테스트 (`/diagnostic`) — 객관식·단답형, **수식(KaTeX) 지원**, 서버 채점
- 신청 폼 — 수업 등록 상담(무료) / 진단 결과 상담(무료) / 정밀 상담(2만원)
- 로그인 + 역할 구분 (`student` / `tutor` / `admin`)
- 관리자 화면 — 사이트 문구 편집 / 진단 문항 편집 / 신청서 관리(CSV 내보내기)
- 관리자 화면에서 **사진 직접 업로드** (Supabase Storage)
- Vercel 자동 배포

**아직 안 함**
- 수강생 페이지 (공지·숙제·자료·질문)
- 튜터 페이지 (질문 답변·숙제 채점)

**채워야 할 자료 (대표진이 주셔야 함)**
- 성적 인증 캡처 / 후기 캡처 / 교재 실물 사진 → 이제 `/app/content` 에서 직접 올릴 수 있음
- 실제 20분 분량 진단 문항 (지금 12개는 형식 예시용 초안)
- 교재비 포함 여부, 수업 횟수 조정 가능 여부

---

## 3. 구조

React 18 + TypeScript + Vite 5 + react-router-dom v7 (BrowserRouter). 백엔드는 Supabase.

```
src/
  content.ts          모든 문구의 기본값 (defaultContent)
  diagnostic.ts       진단 문항 기본값 + 채점 로직 + 판정(Verdict) 타입
  styles.css          전부 여기 한 파일 (디자인 토큰은 :root)
  components/         홍보 페이지 섹션들 + 공용 부품
  pages/
    Landing.tsx       홍보 페이지 (섹션 순서가 여기 있음)
    Diagnostic.tsx    진단 테스트 (intro → quiz → result)
    app/              로그인 영역 (AppShell / Login / Admin*)
  hooks.ts            useReveal() — 스크롤 등장 애니메이션
  lib/
    supabase.ts       클라이언트. 환경변수 없으면 isBackendReady=false
    auth.ts           useAuth() — 세션 + 역할
    siteContent.ts    ContentProvider / useContent() / merge()
    contentSpec.ts    관리자 문구 편집 화면을 만드는 "표"
    diagnosticStore.ts 문항 로드 + 채점 + 관리자 CRUD
    applications.ts   신청서 제출 / DM 문구 생성
    uploads.ts        사진 업로드 (Supabase Storage)
    asset.ts          이미지 주소 (전체 URL이면 그대로, 파일명이면 BASE_URL 붙임)
supabase/schema.sql   테이블·정책·함수 전부. 여러 번 실행해도 안전
```

### 라우트

| 경로 | 화면 | 접근 |
| --- | --- | --- |
| `/` | 홍보 페이지 | 공개 |
| `/diagnostic` | 진단 테스트 | 공개 |
| `/app/login` | 로그인·가입 | 공개 |
| `/app/content` | 사이트 문구 + 사진 편집 | 로그인 |
| `/app/questions` | 진단 문항 편집 | 관리자 |
| `/app/applications` | 신청서 관리 | 관리자 |

`/` 만 즉시 불러오고 나머지는 `React.lazy` 로 따로 불러옵니다. KaTeX가 홍보
페이지를 무겁게 하지 않도록 한 것이니, 새 라우트도 같은 방식으로 추가하세요.

### 문구가 화면에 닿기까지 (여기가 핵심)

```
src/content.ts 의 defaultContent
        ↓  merge()   (배열은 통째로 교체, 객체는 깊게 병합)
DB의 site_content 한 줄 (jsonb)
        ↓  ContentProvider
useContent()  →  각 컴포넌트
```

- **컴포넌트에서 `content.ts` 를 직접 import 하지 마세요.** `useContent()` 를 쓰세요.
  (직접 import하면 관리자가 고친 문구가 반영되지 않습니다)
- 문구 항목을 새로 만들면 **`content.ts` 와 `contentSpec.ts` 를 같이** 고쳐야
  관리자 화면에도 나타납니다
- `contentSpec.ts` 의 필드 종류: `text` `multiline` `strings` `rows` `toggle` `group` `image`
- 배열이 비면 그 섹션은 화면에서 사라지도록 되어 있습니다 (제목까지 같이 사라져야 함)

### 진단 테스트

- DB에 문항이 있으면 `diagnostic_public` 뷰(정답 칸 없음)에서 가져오고,
  채점은 `grade_diagnostic(jsonb)` RPC로 **DB 안에서** 합니다.
  **정답은 절대 브라우저로 내려가지 않습니다.** 이 성질을 깨지 마세요.
- DB가 비어 있으면 `src/diagnostic.ts` 의 기본 12문항으로 진행하고 브라우저에서 채점합니다
- 결과 판정(Verdict) 구간은 `/app/content → 진단 결과 판정` 에서 편집합니다.
  `eligible: false` 면 "Pre 듣기엔 이미 실력이 있다" 쪽으로 갈라집니다
- 수식은 `$` 와 `$` 사이 (KaTeX). `MathText` 컴포넌트가 그립니다.
  단답형 정답(`accept`)은 **글자 그대로 비교**하므로 수식을 쓰면 안 됩니다

---

## 4. Supabase

`supabase/schema.sql` 하나에 전부 들어 있고, **여러 번 실행해도 안전**합니다.
스키마를 바꿀 땐 이 파일 끝에 번호 붙인 섹션으로 덧붙이세요 (기존 섹션을
고치면 이미 실행한 사람에게 안 먹힙니다).

| 테이블/뷰/함수 | 용도 |
| --- | --- |
| `profiles` | 가입 시 트리거로 자동 생성. `role` 기본값 `student` |
| `is_admin()` | RLS에서 쓰는 security definer 함수 |
| `applications` | 신청서. 작성은 누구나, 조회·수정은 관리자만 |
| `diagnostic_questions` | 문항 원본 (정답 포함). 관리자만 접근 |
| `diagnostic_public` | 정답 칸을 뺀 뷰. `security_invoker = false` |
| `grade_diagnostic(jsonb)` | 서버 채점 RPC |
| `site_content` | 사이트 문구 jsonb 한 줄 |
| `site-media` (Storage) | 사진. 보기는 누구나, 올리기·지우기는 관리자만 |

### 키 규칙 — 반드시 지킬 것

- `VITE_SUPABASE_ANON_KEY` (= `sb_publishable_…`) 는 **브라우저에 노출돼도 됩니다.**
  번들에 들어가는 게 정상이고, 권한은 RLS가 막습니다
- `service_role` / `sb_secret_…` 키는 **절대** 코드·커밋·대화에 넣지 마세요
- Supabase **Database Password** 도 마찬가지입니다. 사용자에게 요구하지 마세요
- `.env.local` 은 `.gitignore` 의 `*.local` 로 빠져 있습니다

### 관리자 만들기

가입 → 메일 인증 → SQL Editor에서:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

---

## 5. 배포

- **Vercel** — `main` 브랜치에 푸시하면 자동 배포. https://teamlesson.vercel.app
- 환경변수는 Vercel **Settings → Environment Variables**
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `vercel.json` 의 rewrite가 BrowserRouter의 새로고침을 받아줍니다
- GitHub Pages는 **쓰지 않습니다.** (`github-pages` 환경이 기본 브랜치만
  허용해서 세 번 실패한 뒤 접었습니다. 다시 시도하지 마세요)
- 도메인을 사면 두 곳을 바꿔야 합니다:
  `vite.config.ts` 의 `SITE_URL`, Supabase **Authentication → URL Configuration**

### 브랜치

작업은 `claude/website-development-hkhosu` 에서 하고, 배포하려면 `main` 에
fast-forward 머지 후 푸시합니다. (`main` 이 Vercel 배포 브랜치)

---

## 6. 작업할 때 지킬 것

**말투와 문서**
- 사용자는 한국어를 씁니다. 코드 주석·커밋 메시지·문서 전부 한국어로 씁니다
- 주석은 "이게 왜 이렇게 되어 있는지"를 적습니다. 코드를 다시 읽어주는 주석은 쓰지 않습니다
- 관리자 화면 문구는 비개발자가 읽습니다. "필드", "레코드" 같은 말 대신
  "칸", "항목" 처럼 씁니다

**디자인**
- 디자인 토큰은 `styles.css` 의 `:root` 에 있고 다크모드에서 덮어씁니다.
  `--brand: #185fa5`, `--accent: #3f9a5c`, 어두운 배경 위에서는 `--brand-on-dark`
- **Bebas Neue는 라틴 전용 폰트입니다.** 한글에 걸면 한 단어 안에서 폰트가
  갈려서 촌스러워집니다. 히어로 제목과 푸터 슬로건에만 씁니다.
  나머지 숫자는 Pretendard + `tabular-nums`
- 벤토 그리드: `.bento` 12칸 + `.tile` + `.s3~.s12` / `.r2`.
  카드 개수에 맞춰 span을 정해야 빈칸이 안 생깁니다

**하지 말 것 (전에 겪은 것들)**
- 인스타 카드 이미지처럼 글자가 박힌 사진을 본문 옆에 넣기 — 내용이 겹쳐서 조잡해집니다
- 확인 안 된 수치를 채워 넣기
- 관리자 편집 화면에서 `input { width: 100% }` 를 체크박스까지 상속시키기
- `.field-label` 색을 어두운 배경 기준으로만 잡기 (관리자 화면은 밝은 배경)

**검증**
- `npm run build` (타입 체크 포함) 는 항상 통과시키고 커밋합니다
- 화면 확인은 `npx vite preview --port 4173` + Playwright
  (전역 설치: `/opt/node22/lib/node_modules/playwright`)
- 스크린샷 전에 `html{scroll-behavior:auto !important}` 를 주입해야 스크롤
  중간에 찍히지 않습니다

**샌드박스 제약**
이 컨테이너는 `supabase.co`, `vercel.app`, `github.io`, `fonts.googleapis.com`,
`cdn.jsdelivr.net` 로 나가는 연결이 막혀 있습니다. **실제 DB나 배포된 사이트를
직접 확인할 수 없습니다.** 로컬 빌드로 검증하고, DB가 필요한 확인은 사용자에게
"이렇게 해보시고 알려달라"고 부탁하세요. CDN 대신 npm 패키지를 쓰세요
(KaTeX도 그래서 self-host 중).

---

## 7. 새 세션에서 처음 할 일

```bash
npm install
npm run build          # 타입 체크까지 한 번에
```

읽는 순서를 추천하면:

1. 이 파일
2. `README.md` — 대표진(비개발자)용 사용 설명서
3. `src/content.ts` — 사이트가 무슨 말을 하고 있는지
4. `src/pages/Landing.tsx` — 섹션 순서
5. `supabase/schema.sql` — 데이터 구조와 권한

그리고 사용자에게 **지금 무엇부터 하고 싶은지** 물어보세요. 남은 큰 덩어리는
수강생 페이지와 튜터 페이지지만, 대체로 대표진이 카톡으로 모아온 수정 요청을
가져옵니다.
