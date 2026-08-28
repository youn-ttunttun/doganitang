import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { nav, resultCases, reviews, site } from '../content'
import { useScrolled } from '../hooks'

export default function Nav() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  // 후기·성적 자료가 아직 없으면 해당 메뉴는 감춥니다.
  const hasProof = resultCases.length > 0 || reviews.length > 0
  const items = nav.filter((item) => item.id !== 'proof' || hasProof)

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
        <a className="nav-logo" href="#top" onClick={() => setOpen(false)}>
          {site.name}
          <span className="nav-logo-dot">:</span>
          <span className="nav-logo-sub">{site.tagline}</span>
        </a>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link className="nav-cta" to="/diagnostic" onClick={() => setOpen(false)}>
            무료 진단
          </Link>
        </nav>

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
