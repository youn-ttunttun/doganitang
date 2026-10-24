import { getClient, isBackendReady } from './supabase'

export { isBackendReady }

// 지금 받는 신청은 시범 수업 하나입니다. 나머지는 예전에 받은 신청서를 읽기 위해 남겨 둡니다.
export type ApplicationKind = 'trial' | 'consult' | 'diagnostic' | 'detail'

export type ApplicationInput = {
  kind: ApplicationKind
  name: string
  contact: string
  guardianContact: string
  grade: string
  course: string
  level: string
  message: string
  source: string
  birthYear: string
  gender: string
  recentExam: string
  paymentTermsAgreed: boolean
  tuitionConfirmed: boolean
  marketingSms: boolean
  marketingEmail: boolean
  marketingPhone: string
  marketingEmailAddress: string
  recentGrade: string
  /** 수강료에서 고른 과정. 비어 있으면 아직 안 고른 것입니다. */
  plan: string
}

export const applicationKindLabel: Record<ApplicationKind, string> = {
  trial: '시범 수업',
  consult: '수업 등록 상담',
  diagnostic: '진단 결과 상담',
  detail: '정밀 상담 (유료)',
}

export async function submitApplication(input: ApplicationInput): Promise<void> {
  const row = {
    kind: input.kind,
    name: input.name,
    contact: input.contact,
    guardian_contact: input.guardianContact,
    grade: input.grade,
    course: input.course,
    level: input.level,
    message: input.message,
    source: input.source,
    plan: input.plan,
    recent_grade: input.recentGrade,
    birth_year: Number(input.birthYear),
    gender: input.gender,
    recent_exam: input.recentExam,
    tuition_confirmed: input.tuitionConfirmed,
    payment_terms_agreed: input.paymentTermsAgreed,
    payment_terms_version: '2026-10-25-payment-v1',
    consent_version: '2026-10-24-v3',
    consent_at: new Date().toISOString(),
    form_version: 3,
    marketing_sms: input.marketingSms,
    marketing_email: input.marketingEmail,
    marketing_phone: input.marketingSms ? input.marketingPhone.replace(/[- ]/g, '') : null,
    marketing_email_address: input.marketingEmail ? input.marketingEmailAddress.trim() : null,
    marketing_consent_version: input.marketingSms || input.marketingEmail ? '2026-10-24-v3' : null,
    status: 'new',
  }
  let { error } = await getClient().from('applications').insert(row)

  // DB 에 'trial' 이 아직 허용되지 않았을 때(schema.sql 16번 실행 전) 신청서를
  // 잃지 않도록 예전 값으로 한 번 더 넣습니다. 16번을 실행하면 이 경로는 안 탑니다.
  if (error?.code === '23514' && row.kind === 'trial') {
    ;({ error } = await getClient().from('applications').insert({ ...row, kind: 'consult' }))
  }

  if (error) {
    // 개발자용 상세 로그. 사용자에게는 폼에서 안내 문구를 따로 보여줍니다.
    console.error('[applications] 저장 실패:', error)
    throw new Error(error.message)
  }
}

// 백엔드가 아직 없을 때 인스타 DM으로 붙여넣을 수 있는 텍스트를 만들어 줍니다.
export function buildDmText(input: ApplicationInput): string {
  return [
    `[${applicationKindLabel[input.kind]} 신청]`,
    `이름: ${input.name}`,
    `연락처: ${input.contact}`,
    input.guardianContact && `학부모 연락처: ${input.guardianContact}`,
    `상태: ${input.grade}`,
    `출생 연도: ${input.birthYear}`,
    `성별: ${input.gender || "미응답"}`,
    `최근 모의고사 등급: ${input.recentGrade || "미응답"}`,
    `최근 응시한 모의고사명/원점수: ${input.recentExam || "미응답"}`,
    `유입 경로: ${input.source}`,
    `수업료 확인: ${input.tuitionConfirmed ? "확인" : "미확인"}`,
    `희망 과목: ${input.course}`,
    input.level && `현재 상황: ${input.level}`,
    input.message && `남길 말: ${input.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}
