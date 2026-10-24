import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Apply from '../components/Apply'
import { useContent } from '../lib/siteContent'

/**
 * 신청서 전용 페이지. 진단 테스트처럼 따로 열립니다.
 * 사이트 맨 아래에 폼을 두면 한참 내려가야 했고, 무엇을 신청하는지도 흐렸습니다.
 */
export default function ApplyPage() {
  const { site } = useContent()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="quiz-page apply-page">
      <header className="quiz-top">
        <Link className="quiz-back" to="/">
          <ArrowLeft size={16} />
          {site.name}
        </Link>
      </header>
      <Apply />
    </div>
  )
}
