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

  return merge(defaultContent, data.data)
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const { error } = await getClient()
    .from('site_content')
    .upsert({ id: ROW_ID, data: content, updated_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
}

/** 관리자 화면에서 '기본값으로 되돌리기' 용도 */
export async function clearSiteContent(): Promise<void> {
  const { error } = await getClient().from('site_content').delete().eq('id', ROW_ID)
  if (error) throw new Error(error.message)
}

// ── 화면에 문구를 공급하는 통로 ──────────────────────────────

const ContentContext = createContext<SiteContent>(defaultContent)

/**
 * 처음에는 기본 문구로 즉시 그리고, DB에서 받아오면 조용히 갈아끼웁니다.
 * 로딩 화면을 두지 않아 첫 화면이 늦게 뜨는 일이 없습니다.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)

  useEffect(() => {
    let alive = true
    loadSiteContent().then((loaded) => {
      if (alive) setContent(loaded)
    })
    return () => {
      alive = false
    }
  }, [])

  return createElement(ContentContext.Provider, { value: content }, children)
}

export function useContent(): SiteContent {
  return useContext(ContentContext)
}
