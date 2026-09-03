import { getClient, isBackendReady } from './supabase'

export { isBackendReady }

export type ApplicationKind = 'consult' | 'diagnostic' | 'detail'

export type ApplicationInput = {
  kind: ApplicationKind
  name: string
  contact: string
  guardianContact: string
  grade: string
  course: string
  level: string
  message: string
}

export const applicationKindLabel: Record<ApplicationKind, string> = {
  consult: '수업 등록 상담',
  diagnostic: '진단 결과 상담',
  detail: '정밀 상담 (유료)',
}

export async function submitApplication(input: ApplicationInput): Promise<void> {
  const { error } = await getClient().from('applications').insert({
    kind: input.kind,
    name: input.name,
    contact: input.contact,
    guardian_contact: input.guardianContact,
    grade: input.grade,
    course: input.course,
    level: input.level,
    message: input.message,
    status: 'new',
  })

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
    `학년: ${input.grade}`,
    `희망 과목: ${input.course}`,
    input.level && `현재 상황: ${input.level}`,
    input.message && `남길 말: ${input.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}
