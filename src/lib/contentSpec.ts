import type { SiteContent } from '../content'

/**
 * 관리자 화면에서 어떤 문구를 어떻게 보여줄지 적어둔 표입니다.
 * 여기에 항목을 추가하면 편집 화면에도 자동으로 나타납니다.
 */

export type Field =
  | { key: string; label: string; kind: 'text'; hint?: string }
  | { key: string; label: string; kind: 'multiline'; hint?: string }
  | { key: string; label: string; kind: 'strings'; hint?: string }
  | { key: string; label: string; kind: 'rows'; titleKey: string; fields: Field[]; hint?: string }

export type SectionSpec = {
  /** SiteContent 의 최상위 키 */
  key: keyof SiteContent
  label: string
  desc?: string
  /** 이 섹션 자체가 배열이면 rows 하나만 씁니다 */
  fields: Field[]
}

export const contentSpec: SectionSpec[] = [
  {
    key: 'hero',
    label: '첫 화면',
    desc: '사이트를 열었을 때 제일 먼저 보이는 부분입니다.',
    fields: [
      { key: 'badges', label: '배지', kind: 'strings', hint: '제목 위의 작은 라벨' },
      { key: 'lead', label: '한 줄 소개', kind: 'text' },
      { key: 'headline', label: '큰 제목', kind: 'multiline', hint: '줄바꿈하면 화면에서도 줄이 나뉩니다' },
      { key: 'sub', label: '설명', kind: 'multiline' },
    ],
  },
  {
    key: 'stats',
    label: '지표',
    desc: '첫 화면 아래 네 칸. 확인된 숫자만 적어주세요.',
    fields: [
      {
        key: '',
        label: '지표',
        kind: 'rows',
        titleKey: 'label',
        fields: [
          { key: 'value', label: '숫자', kind: 'text' },
          { key: 'label', label: '설명', kind: 'text' },
        ],
      },
    ],
  },
  {
    key: 'audienceSection',
    label: '대상 — 제목',
    fields: [
      { key: 'eyebrow', label: '라벨', kind: 'text' },
      { key: 'title', label: '제목', kind: 'text' },
    ],
  },
  {
    key: 'audience',
    label: '대상 — 목록',
    desc: '"이런 학생을 위한 과외입니다" 아래 항목들.',
    fields: [{ key: '', label: '항목', kind: 'strings' }],
  },
  {
    key: 'material',
    label: '교재',
    fields: [
      { key: 'eyebrow', label: '라벨', kind: 'text' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'paragraphs', label: '본문', kind: 'strings', hint: '한 칸이 한 문단입니다' },
      {
        key: 'books',
        label: '교재 카드',
        kind: 'rows',
        titleKey: 'title',
        fields: [
          { key: 'title', label: '교재명', kind: 'text' },
          { key: 'subject', label: '과목', kind: 'text' },
          { key: 'desc', label: '설명', kind: 'multiline' },
        ],
      },
    ],
  },
  {
    key: 'curriculum',
    label: '커리큘럼',
    fields: [
      {
        key: '',
        label: '과정',
        kind: 'rows',
        titleKey: 'code',
        fields: [
          { key: 'code', label: '과정 이름', kind: 'text', hint: '예) Pre, 대수' },
          { key: 'name', label: '부제', kind: 'text' },
          { key: 'summary', label: '한 줄 요약', kind: 'text' },
          { key: 'body', label: '설명', kind: 'multiline' },
          { key: 'topics', label: '단원', kind: 'strings' },
        ],
      },
    ],
  },
  {
    key: 'principles',
    label: '수업 원칙',
    desc: '커리큘럼 아래 "수업은 이렇게 진행합니다".',
    fields: [
      {
        key: '',
        label: '원칙',
        kind: 'rows',
        titleKey: 'title',
        fields: [
          { key: 'title', label: '제목', kind: 'text' },
          { key: 'body', label: '설명', kind: 'multiline' },
        ],
      },
    ],
  },
  {
    key: 'positioning',
    label: '왜 우리인가',
    desc: '일반 과외와 비교하는 표.',
    fields: [
      { key: 'eyebrow', label: '라벨', kind: 'text' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'lead', label: '설명', kind: 'multiline' },
      {
        key: 'rows',
        label: '비교 항목',
        kind: 'rows',
        titleKey: 'point',
        fields: [
          { key: 'point', label: '기준', kind: 'text' },
          { key: 'others', label: '보통의 과외', kind: 'text' },
          { key: 'ours', label: 'Teamlesson', kind: 'text' },
        ],
      },
    ],
  },
  {
    key: 'leads',
    label: '공동대표',
    fields: [
      {
        key: '',
        label: '선생님',
        kind: 'rows',
        titleKey: 'name',
        fields: [
          { key: 'name', label: '이름', kind: 'text' },
          { key: 'role', label: '역할', kind: 'text' },
          { key: 'school', label: '학교', kind: 'text' },
          { key: 'lines', label: '이력', kind: 'strings' },
        ],
      },
    ],
  },
  {
    key: 'tutors',
    label: '튜터',
    fields: [
      {
        key: '',
        label: '튜터',
        kind: 'rows',
        titleKey: 'name',
        fields: [
          { key: 'name', label: '이름', kind: 'text' },
          { key: 'role', label: '역할', kind: 'text', hint: '예) 튜터, 제작팀' },
          { key: 'note', label: '이력', kind: 'text' },
        ],
      },
    ],
  },
  {
    key: 'scoreBadges',
    label: '성적 변화 띠',
    desc: '첫 화면 아래를 흐르는 배지. 비워두면 이 영역이 나오지 않습니다. 확인된 기록만 적어주세요.',
    fields: [
      {
        key: '',
        label: '기록',
        kind: 'rows',
        titleKey: 'label',
        fields: [
          { key: 'from', label: '이전', kind: 'text', hint: '예) 5등급' },
          { key: 'to', label: '이후', kind: 'text', hint: '예) 3등급' },
          { key: 'label', label: '설명', kind: 'text', hint: '예) 고2 · 대수' },
        ],
      },
    ],
  },
  {
    key: 'resultCases',
    label: '성적 사례',
    desc: '비워두면 이 섹션이 나오지 않습니다.',
    fields: [
      {
        key: '',
        label: '사례',
        kind: 'rows',
        titleKey: 'who',
        fields: [
          { key: 'who', label: '누구', kind: 'text', hint: '예) 고3 김OO' },
          { key: 'course', label: '수강 과정', kind: 'text' },
          { key: 'period', label: '기간', kind: 'text' },
          { key: 'before', label: '이전', kind: 'text' },
          { key: 'after', label: '이후', kind: 'text' },
          { key: 'note', label: '메모', kind: 'multiline' },
          { key: 'image', label: '인증 이미지 파일명', kind: 'text', hint: 'public/ 폴더에 넣은 파일명' },
        ],
      },
    ],
  },
  {
    key: 'reviews',
    label: '후기',
    desc: '비워두면 이 섹션이 나오지 않습니다. 캡처를 올릴 때는 이름·프로필 사진을 가려주세요.',
    fields: [
      {
        key: '',
        label: '후기',
        kind: 'rows',
        titleKey: 'who',
        fields: [
          { key: 'quote', label: '내용', kind: 'multiline' },
          { key: 'who', label: '작성자', kind: 'text', hint: '예) 고2 학부모' },
          { key: 'image', label: '캡처 파일명', kind: 'text' },
        ],
      },
    ],
  },
  {
    key: 'pricing',
    label: '수강료',
    desc: '비워두면 이 섹션이 나오지 않습니다. 금액을 적으면 그때 켜집니다.',
    fields: [
      { key: 'eyebrow', label: '라벨', kind: 'text' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'lead', label: '설명', kind: 'multiline' },
      {
        key: 'plans',
        label: '수강 상품',
        kind: 'rows',
        titleKey: 'name',
        fields: [
          { key: 'name', label: '이름', kind: 'text', hint: '예) 화상 수업' },
          { key: 'price', label: '금액', kind: 'text', hint: '예) 38만원 · 문의' },
          {
            key: 'unit',
            label: '금액 기준',
            kind: 'text',
            hint: "금액 바로 아래에 붙습니다. 없으면 '월 얼마'로 오해받습니다",
          },
          { key: 'hourly', label: '시간당', kind: 'text', hint: '예) 시간당 약 2만 4천원' },
          { key: 'desc', label: '한 줄 설명', kind: 'text' },
          { key: 'features', label: '포함 내용', kind: 'strings' },
          { key: 'badge', label: '라벨', kind: 'text', hint: '카드 위 작은 표시. 예) 추천' },
        ],
      },
      { key: 'cta', label: '카드 버튼 문구', kind: 'text' },
      {
        key: 'fallbackTitle',
        label: '망설이는 사람용 — 제목',
        kind: 'text',
        hint: '비우면 이 안내가 나오지 않습니다',
      },
      { key: 'fallbackText', label: '망설이는 사람용 — 설명', kind: 'multiline' },
      { key: 'fallbackCta', label: '망설이는 사람용 — 버튼', kind: 'text' },
      {
        key: 'notes',
        label: '안내 문구',
        kind: 'strings',
        hint: '표 아래 작은 글씨. 교재비, 결제 방식, 환불 규정 등',
      },
    ],
  },
  {
    key: 'faqs',
    label: '자주 묻는 질문',
    fields: [
      {
        key: '',
        label: '질문',
        kind: 'rows',
        titleKey: 'q',
        fields: [
          { key: 'q', label: '질문', kind: 'text' },
          { key: 'a', label: '답변', kind: 'multiline' },
        ],
      },
    ],
  },
  {
    key: 'diagnosticInfo',
    label: '진단 테스트 안내',
    desc: '진단 테스트 시작 화면에 나오는 문구입니다.',
    fields: [
      { key: 'duration', label: '소요 시간', kind: 'text', hint: '예) 약 20분' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'lead', label: '설명', kind: 'multiline' },
      { key: 'facts', label: '안내 항목', kind: 'strings' },
      { key: 'note', label: '시작 버튼 아래 문구', kind: 'text' },
    ],
  },
  {
    key: 'consulting',
    label: '상세 상담 (유료)',
    desc: '진단 결과 화면 아래에 나옵니다. 제목을 비우면 이 안내가 나오지 않습니다.',
    fields: [
      { key: 'badge', label: '라벨', kind: 'text', hint: '예) 유료' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'desc', label: '설명', kind: 'multiline' },
      { key: 'features', label: '포함 내용', kind: 'strings' },
      { key: 'price', label: '금액', kind: 'text', hint: "비우면 '신청 후 안내'로 표시됩니다" },
      { key: 'unit', label: '금액 기준', kind: 'text', hint: '예) 1회 · 40분' },
      { key: 'cta', label: '버튼 문구', kind: 'text' },
      { key: 'note', label: '안내 문구', kind: 'multiline' },
    ],
  },
  {
    key: 'apply',
    label: '신청 섹션',
    fields: [
      { key: 'eyebrow', label: '라벨', kind: 'text' },
      { key: 'title', label: '제목', kind: 'text' },
      { key: 'sub', label: '설명', kind: 'multiline' },
    ],
  },
  {
    key: 'site',
    label: '기본 정보',
    desc: '사이트 이름과 연락처. 여러 곳에 함께 쓰입니다.',
    fields: [
      { key: 'name', label: '사이트 이름', kind: 'text' },
      { key: 'slogan', label: '슬로건', kind: 'text' },
      { key: 'tagline', label: '한 줄 설명', kind: 'text' },
      { key: 'description', label: '검색용 소개', kind: 'multiline' },
      { key: 'instagram', label: '인스타그램 주소', kind: 'text' },
      { key: 'instagramHandle', label: '인스타그램 아이디', kind: 'text' },
      { key: 'email', label: '이메일', kind: 'text' },
      { key: 'studentSiteUrl', label: '수강생 전용 페이지 주소', kind: 'text' },
    ],
  },
]
