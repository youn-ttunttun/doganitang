import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useScrolled } from '../hooks'
import { useContent } from '../lib/siteContent'
import { useTheme } from '../lib/theme'

/** 메인에서 떼어내 따로 페이지가 된 항목들. 나머지는 메인 안의 위치로 갑니다. */
const PAGES: Record<string, string> = {
  material: '/curriculum',
  curriculum: '/curriculum',
  teachers: '/teachers',
}

export default function Nav() {
  const { nav, resultCases, reviews, site, pricing, news } = useContent()
  const scrolled = useScrolled()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // 아직 채우지 않은 섹션은 메뉴에서도 감춥니다.
  const hasProof = resultCases.length > 0 || reviews.length > 0
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

  // 공지를 올렸는데 메뉴에 없으면 넣어줍니다.
  const menu =
    news.length > 0 && !items.some((item) => item.id === 'news')
      ? [...items, { id: 'news', label: '공지' }]
      : items

  // 메뉴가 열려 있는 동안에는 뒤 배경이 스크롤되지 않도록 잠급니다.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
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

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {menu.map((item) => {
            const page = PAGES[item.id]
            if (page) {
              return (
                <Link key={item.id} to={page} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              )
            }
            // 메인 밖에서는 먼저 메인으로 돌아가야 그 자리로 갈 수 있습니다.
            const href = pathname === '/' ? `#${item.id}` : `/#${item.id}`
            return (
              <a key={item.id} href={href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            )
          })}
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
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}
