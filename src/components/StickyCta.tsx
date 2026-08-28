import { Instagram, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../content'
import { useScrolled } from '../hooks'

/** 첫 화면을 지나면 아래에 붙는 상시 CTA 바. */
export default function StickyCta() {
  const shown = useScrolled(560)

  return (
    <div className={`sticky-cta ${shown ? 'is-shown' : ''}`}>
      <Link className="btn btn-primary" to="/diagnostic">
        <PencilRuler size={16} />
        무료 진단 테스트
      </Link>
      <a className="btn btn-ghost" href={site.instagram} target="_blank" rel="noreferrer">
        <Instagram size={16} />
        DM 문의
      </a>
    </div>
  )
}
