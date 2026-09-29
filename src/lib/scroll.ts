/** 섹션 등장 애니메이션을 즉시 끝내라는 신호. hooks.ts 의 useReveal 이 듣습니다. */
export const REVEAL_ALL = 'teamlesson:reveal-all'

const NAV_OFFSET = 84

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * 섹션으로 이동합니다.
 *
 * 브라우저 기본 부드러운 스크롤은 거리에 비례해 시간이 늘어서, 페이지 끝까지
 * 가는 이동은 화면이 뭉개집니다. 그래서 거리와 상관없이 비슷한 시간에 끝나도록
 * 직접 움직입니다.
 *
 * 움직이기 전에 모든 섹션을 먼저 나타나게 합니다. 그러지 않으면 도착한 자리가
 * 비어 있다가 뒤늦게 떠오릅니다.
 */
export function scrollToId(id: string, options: { instant?: boolean } = {}) {
  const el = document.getElementById(id)
  if (!el) return

  window.dispatchEvent(new Event(REVEAL_ALL))

  // 나타나면서 자리가 잡히도록 한 프레임 기다린 뒤 위치를 잽니다.
  requestAnimationFrame(() => {
    const from = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const to = Math.max(0, Math.min(max, el.getBoundingClientRect().top + from - NAV_OFFSET))
    const distance = to - from

    if (options.instant || reduced() || Math.abs(distance) < 2) {
      window.scrollTo({ top: to, behavior: 'instant' as ScrollBehavior })
      return
    }

    // 가까우면 짧게, 멀어도 0.7초를 넘지 않습니다.
    const duration = Math.min(700, 320 + Math.abs(distance) * 0.12)
    const start = performance.now()

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration)
      window.scrollTo({ top: from + distance * easeInOutCubic(t), behavior: 'instant' as ScrollBehavior })
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}
