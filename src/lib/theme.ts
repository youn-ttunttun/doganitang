import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'teamlesson:theme'

/** 기기 설정을 그대로 따를지, 사람이 고른 값을 쓸지 결정합니다. */
function current(): Theme {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return current()
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // 시크릿 모드 등에서 저장이 막힐 수 있습니다. 이번 방문에만 적용됩니다.
    }
  }, [theme])

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
