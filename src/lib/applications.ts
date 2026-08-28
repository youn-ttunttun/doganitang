import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Supabase 접속 정보는 .env.local 에서 읽습니다. (.env.example 참고)
// 아직 프로젝트를 만들지 않았다면 값이 비어 있고, 이때 신청 폼은
// '인스타그램 DM으로 보내기' 방식으로 자동 전환됩니다.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isBackendReady = Boolean(url && anonKey)

let client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (!client) {
    if (!isBackendReady) throw new Error('Supabase 환경 변수가 설정되지 않았습니다.')
    client = createClient(url as string, anonKey as string)
  }
  return client
}

export type ApplicationKind = 'consult' | 'diagnostic'

export type ApplicationInput = {
  kind: ApplicationKind
  name: string
  contact: string
  grade: string
  course: string
  level: string
  message: string
}

export const applicationKindLabel: Record<ApplicationKind, string> = {
  consult: '수업 등록 상담',
  diagnostic: '진단 테스트',
}

export async function submitApplication(input: ApplicationInput): Promise<void> {
  const { error } = await getClient().from('applications').insert({
    kind: input.kind,
    name: input.name,
    contact: input.contact,
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
    `학년: ${input.grade}`,
    `희망 과목: ${input.course}`,
    input.level && `현재 상황: ${input.level}`,
    input.message && `남길 말: ${input.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}
