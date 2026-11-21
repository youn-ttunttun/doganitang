import { useEffect, useState } from 'react'

export const LMS_ORIGIN = 'https://teamlesson-lms.teamlesson-56978fcf.workers.dev'
type PublicTutor = { id: string; name: string; grade_exams: string; pledge: string }

/** 공개 전용 응답만 사용합니다. 연락처·학교·증빙·관리자 정보를 요청하지 않습니다. */
function parseTutors(value: unknown): PublicTutor[] {
  if (!value || typeof value !== 'object' || !('tutors' in value) || !Array.isArray(value.tutors)) throw new Error('공개 목록 형식 오류')
  const rows = value.tutors
  if (rows.length > 1000) throw new Error('공개 목록 크기 오류')
  return rows.map((row: unknown) => {
    if (!row || typeof row !== 'object') throw new Error('공개 소개 형식 오류')
    const r = row as Record<string, unknown>
    if (typeof r.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(r.id) ||
      typeof r.name !== 'string' || !r.name.trim() || r.name.length > 50 ||
      typeof r.grade_exams !== 'string' || r.grade_exams.length > 2000 ||
      typeof r.pledge !== 'string' || r.pledge.length > 500) throw new Error('공개 소개 형식 오류')
    return { id: r.id, name: r.name, grade_exams: r.grade_exams, pledge: r.pledge }
  })
}

export function usePublicTutors(enabled: boolean) {
  const [tutors, setTutors] = useState<PublicTutor[]>([])
  useEffect(() => {
    if (!enabled) return
    let alive = true
    let controller: AbortController | null = null
    async function refresh() {
      controller?.abort()
      const current = new AbortController()
      controller = current
      const timer = window.setTimeout(() => current.abort(), 5000)
      try {
        const response = await fetch(`${LMS_ORIGIN}/api/public/tutors`, { signal: current.signal, cache: 'no-store', credentials: 'omit' })
        if (!response.ok) throw new Error('공개 목록 연결 오류')
        const result = parseTutors(await response.json())
        if (alive && controller === current) setTutors(result)
      } catch {
        // 연결이 끊겼을 때 이전 공개 정보를 보관하지 않아 철회된 소개가 남지 않게 합니다.
        if (alive && controller === current) setTutors([])
      } finally { window.clearTimeout(timer) }
    }
    void refresh()
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 30000)
    const visible = () => { if (document.visibilityState === 'visible') void refresh() }
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('focus', visible)
    return () => {
      alive = false
      controller?.abort()
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('focus', visible)
    }
  }, [enabled])
  return tutors
}
