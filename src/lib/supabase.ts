import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Supabase 접속 정보는 .env.local 에서 읽습니다. (.env.example 참고)
// 값이 없으면 사이트는 '백엔드 없이' 동작합니다.
//  - 신청 폼 → 인스타그램 DM 문구 생성
//  - 진단 테스트 → src/diagnostic.ts 의 기본 문항으로 진행
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isBackendReady = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getClient(): SupabaseClient {
  if (!client) {
    if (!isBackendReady) throw new Error('Supabase 환경 변수가 설정되지 않았습니다.')
    client = createClient(url as string, anonKey as string)
  }
  return client
}
