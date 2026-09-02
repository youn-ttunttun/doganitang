import { useEffect, useState } from 'react'
import { Instagram, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'

/**
 * 아래에 붙는 CTA 바.
 * 첫 화면을 충분히 지난 뒤에 나타나고, 신청 폼에 도착하면 사라집니다.
 * (바로 앞에 신청 폼이 있는데 버튼이 계속 따라다닐 이유가 없습니다)
 */
export default function StickyCta() {
  const { site } = useContent()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const apply = document.getElementById('apply')

    // 신청 폼이 화면에 보이는 동안에는 감춥니다.
    let applyVisible = false
    const observer = apply
      ? new IntersectionObserver(
          ([entry]) => {
            applyVisible = entry.isIntersecting
            update()
          },
          { rootMargin: '0px 0px -20% 0px' },
        )
      : null
    observer?.observe(apply as Element)

    function update() {
      setShown(window.scrollY > 1200 && !applyVisible)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      observer?.disconnect()
    }
  }, [])

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
