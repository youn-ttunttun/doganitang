import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultContent, type SiteContent } from '../content'
import { getClient, isBackendReady } from './supabase'

const ROW_ID = 'main'

/**
 * 관리자가 고친 문구를 기본 문구 위에 덮습니다.
 * 고치지 않은 항목은 기본값이 그대로 남습니다. 배열은 통째로 교체합니다.
 * (선생님 목록처럼 개수가 달라지는 값은 합치면 오히려 이상해집니다)
 */
function merge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T
  if (typeof base !== 'object' || typeof override !== 'object') return override as T

  const result = { ...(base as object) } as Record<string, unknown>
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (key in result) result[key] = merge(result[key], value)
  }
  return result as T
}

// ── 브라우저에 남겨 두는 마지막 문구 ─────────────────────────
// 새로고침마다 코드의 기본 문구가 먼저 그려졌다가 DB 문구로 바뀌며
// 옛 화면이 번쩍였습니다. 마지막으로 받은 DB 문구를 남겨 두고 그것부터 그립니다.

const CACHE_KEY = 'teamlesson:content'

function readCache(): unknown {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(data: unknown) {
  try {
    if (data === null) localStorage.removeItem(CACHE_KEY)
    else localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // 시크릿 모드 등에서 막히면 매번 DB 를 기다립니다.
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!isBackendReady) return defaultContent

  const { data, error } = await getClient()
    .from('site_content')
    .select('data')
    .eq('id', ROW_ID)
    .maybeSingle()

  if (error || !data?.data) {
    if (error) console.warn('[content] 문구를 불러오지 못해 기본값으로 표시합니다:', error.message)
    return defaultContent
  }

  writeCache(data.data)
  return merge(defaultContent, data.data)
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const { error } = await getClient()
    .from('site_content')
    .upsert({ id: ROW_ID, data: content, updated_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
  // 고친 직후 새로고침해도 옛 값이 번쩍이지 않게 남겨 둔 것도 바꿉니다.
  writeCache(content)
}

/** 관리자 화면에서 '기본값으로 되돌리기' 용도 */
export async function clearSiteContent(): Promise<void> {
  const { error } = await getClient().from('site_content').delete().eq('id', ROW_ID)
  if (error) throw new Error(error.message)
  writeCache(null)
}

// ── 화면에 문구를 공급하는 통로 ──────────────────────────────

const ContentContext = createContext<SiteContent>(defaultContent)

/**
 * 문구를 공급합니다.
 *
 * 전에는 코드의 기본 문구로 먼저 그린 뒤 DB 문구로 갈아끼워서, 새로고침할
 * 때마다 옛 화면이 잠깐 보였습니다. 이제는
 *  - 전에 받아 둔 DB 문구가 있으면 그것으로 바로 그리고 (번쩍임 없음)
 *  - 처음 오는 사람은 DB 문구가 올 때까지 기다렸다 그립니다.
 *  - DB 가 2초 안에 답하지 않으면 그때만 기본 문구로 그립니다.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const cached = isBackendReady ? readCache() : null
  const [content, setContent] = useState<SiteContent>(() =>
    cached ? merge(defaultContent, cached) : defaultContent,
  )
  const [ready, setReady] = useState(!isBackendReady || cached !== null)

  useEffect(() => {
    if (!isBackendReady) return
    let alive = true
    const fallback = window.setTimeout(() => alive && setReady(true), 2000)
    loadSiteContent().then((loaded) => {
      if (!alive) return
      setContent(loaded)
      setReady(true)
    })
    return () => {
      alive = false
      window.clearTimeout(fallback)
    }
  }, [])

  // 기다리는 동안은 빈 바탕만 둡니다. 틀린 문구를 보여주는 것보다 낫습니다.
  return createElement(
    ContentContext.Provider,
    { value: content },
    ready ? children : createElement('div', { style: { minHeight: '100vh' } }),
  )
}

export function useContent(): SiteContent {
  return useContext(ContentContext)
}
