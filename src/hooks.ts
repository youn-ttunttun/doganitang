import { useEffect, useRef, useState } from 'react'

/**
 * 요소가 화면에 들어오면 한 번만 true가 됩니다. 등장 애니메이션에 씁니다.
 * 애니메이션을 끈 사용자(prefers-reduced-motion)에게는 처음부터 보이게 합니다.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return { ref, shown }
}

/** 스크롤이 기준선을 넘었는지 (헤더 배경 처리에 사용) */
export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])

  return scrolled
}
