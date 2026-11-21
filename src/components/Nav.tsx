import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Instagram, Menu, Moon, PencilRuler, Send, Sun, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useScrolled } from '../hooks'
import { scrollToId } from '../lib/scroll'
import { useContent } from '../lib/siteContent'
import { useTheme } from '../lib/theme'

/** 메인에서 떼어내 따로 페이지가 된 항목들. 나머지는 메인 안의 위치로 갑니다. */
const PAGES: Record<string, string> = {
  material: '/curriculum',
  curriculum: '/curriculum',
  teachers: '/teachers',
  why: '/why',
  proof: '/proof',
  pricing: '/pricing',
  faq: '/faq',
  news: '/news',
}

export default function Nav() {
  const { nav, reviews, site, pricing, news, faqs } = useContent()
  const scrolled = useScrolled()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // 아직 채우지 않은 섹션은 메뉴에서도 감춥니다.
  const hasProof = reviews.length > 0
  const items = nav.filter((item) => {
    if (item.id === 'proof') return hasProof
    if (item.id === 'pricing') return pricing.plans.length > 0
    if (item.id === 'news') return news.length > 0

    // '교재' 와 '커리큘럼' 처럼 두 항목이 같은 페이지로 가면 하나만 남깁니다.
    // 페이지 이름과 이어지는 곳이 같은 쪽(= 커리큘럼)을 남깁니다.
    const page = PAGES[item.id]
    const duplicated =
      page &&
      page !== `/${item.id}` &&
      nav.some((other) => PAGES[other.id] === page && page === `/${other.id}`)

    return !duplicated
  })

  // 메뉴에 빠져 있으면 넣어줍니다. 자주 묻는 질문은 공지 앞에 둡니다.
  const menu = [...items]
  if (faqs.length > 0 && !menu.some((item) => item.id === 'faq')) {
    const at = menu.findIndex((item) => item.id === 'news')
    menu.splice(at >= 0 ? at : menu.length, 0, { id: 'faq', label: 'FAQ' })
  }
  if (news.length > 0 && !menu.some((item) => item.id === 'news')) {
    menu.push({ id: 'news', label: '공지' })
  }

  // 메뉴가 열려 있는 동안에는 뒤 배경이 스크롤되지 않도록 잠급니다.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const links = menu.map((item) => {
            const page = PAGES[item.id]
            if (page) {
              return (
                <Link
                  key={item.id}
                  to={page}
                  aria-current={pathname === page ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            }
            // 메인 밖에서는 먼저 메인으로 돌아가야 그 자리로 갈 수 있습니다.
            const onLanding = pathname === '/'
            return (
              <a
                key={item.id}
                href={onLanding ? `#${item.id}` : `/#${item.id}`}
                onClick={(event) => {
                  setOpen(false)
                  if (!onLanding) return
                  // 브라우저 기본 이동 대신 직접 움직입니다. (scroll.ts 참고)
                  event.preventDefault()
                  history.replaceState(null, '', `#${item.id}`)
                  scrollToId(item.id)
                }}
              >
                {item.label}
              </a>
            )
          })

  return (
    <header className={`nav ${pathname === '/' ? 'nav--landing' : ''} ${scrolled ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="container nav-inner">
        <Link
          className="nav-logo"
          to="/"
          onClick={() => {
            setOpen(false)
            window.scrollTo(0, 0)
          }}
        >
          {site.name}
          <span className="nav-logo-dot">:</span>
          <span className="nav-logo-sub">{site.tagline}</span>
        </Link>

        <nav id="site-navigation" aria-label="주 메뉴" className={`nav-links ${open ? 'is-open' : ''}`}>
          {links}
          <Link className="nav-cta" to="/diagnostic" onClick={() => setOpen(false)}>
            무료 진단
          </Link>
        </nav>

        <button
          className="nav-theme"
          onClick={toggle}
          aria-label={theme === 'dark' ? '밝게 보기' : '어둡게 보기'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          aria-controls="site-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 좁은 화면의 메뉴. 위에서 내려오는 작은 창 대신 옆에서 통째로 열립니다.
          머리말이 backdrop-filter 를 써서 그 안에 두면 화면 전체를 못 덮으므로
          body 로 빼서 그립니다. */}
      {open &&
        createPortal(
          <div className="drawer" onClick={() => setOpen(false)}>
            <aside className="drawer-panel" aria-label="메뉴" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-head">
                <Link className="drawer-logo" to="/" onClick={() => setOpen(false)}>
                  {site.name}
                </Link>
                <button className="drawer-close" onClick={() => setOpen(false)} aria-label="메뉴 닫기">
                  <X size={20} />
                </button>
              </div>

              <nav className="drawer-links">{links}</nav>

              <div className="drawer-actions">
                <Link className="btn btn-primary" to="/diagnostic" onClick={() => setOpen(false)}>
                  <PencilRuler size={16} />
                  무료 진단 테스트
                </Link>
                <Link className="btn btn-ghost" to="/apply" onClick={() => setOpen(false)}>
                  <Send size={16} />
                  시범 수업 신청
                </Link>
              </div>

              {site.instagram && (
                <a className="drawer-sub" href={site.instagram} target="_blank" rel="noreferrer">
                  <Instagram size={15} />
                  {site.instagramHandle || '인스타그램'}
                </a>
              )}
            </aside>
          </div>,
          document.body,
        )}
    </header>
  )
}
