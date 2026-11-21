# LMS 튜터 공개 소개 연결

새 튜터는 LMS `/tutor-apply`에서 신청하고 `/admin/tutor-applications`에서 관리자가 검토합니다.
수락·공개 동의·공개 체크를 모두 충족한 튜터만 홈페이지 `/teachers`에 자동 표시됩니다.
사이트 관리자 상단의 ‘튜터 신청·공개’가 LMS 관리 화면으로 연결되며 LMS 관리자 로그인이 필요합니다.

`src/lib/publicTutors.ts`는 기존 LMS 운영 주소의 `/api/public/tutors`만 읽습니다.
받는 정보는 별도 공개 ID·성함·1등급 시험 이력·수업 다짐입니다. 신청 원본·학교·연락처·이메일·증빙·관리자 메모를 요청하지 않습니다.
공개 소개 수정·숨김·동의 철회는 LMS에서 처리합니다. 홈페이지는 캐시 없이 최초 방문·30초 간격·창 복귀 시 갱신합니다.
통신이 실패하면 새 연동 소개는 숨기며 기존 `site_content`의 수동 등록 자료는 유지합니다.

기존 튜터·대표진·제작팀은 `useContent()`를 계속 사용합니다. 새 튜터를 콘텐츠 관리자에서 다시 추가하면 중복되므로 LMS에서 관리하세요.
이름이 같다고 기존 수동 항목을 자동으로 지우거나 합치지는 않습니다.
기존 `site_content` 행과 `applications` 스키마·상담 연결키에는 변경이 없습니다.

배포는 기존 `main` → Vercel 자동 배포를 사용합니다. LMS의 신규 DB·Worker 적용 후 공개 API를 확인한 다음 이 PR을 병합합니다.
현재 운영 주소 `https://teamlesson.vercel.app`와 동일 커밋의 `Vercel – teamlesson`, `Vercel – doganitang` 배포를 구분해 확인해야 합니다.
새 Vercel 계정이나 별도 Sites 호스팅을 만들지 않습니다.

LMS의 `docs/TUTOR-ONBOARDING.md`에 비공개 범위, 90일 보관·파기, 적용 순서·접수 중단 방법을 정리했습니다.
자동 매칭·문자·카카오톡 안내·진단 테스트 통합은 이번 범위가 아닙니다.
