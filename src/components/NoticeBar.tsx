import { ArrowRight, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'

/**
 * 첫 화면 바로 아래의 최신 공지 한 줄.
 * 공지가 페이지 맨 아래에 있어 거의 아무도 못 봤습니다. 가장 최근 글 하나를
 * 위로 올리고, 누르면 공지 페이지로 갑니다. 공지가 없으면 나오지 않습니다.
 */
export default function NoticeBar() {
  const { news } = useContent()
  const latest = news[0]
  if (!latest) return null

  return (
    <div className="container">
      <Link className="notice-bar" to="/news">
        <Megaphone size={16} aria-hidden="true" />
        <span className="notice-bar-label">공지</span>
        <span className="notice-bar-title">{latest.title}</span>
        {latest.date && <time className="notice-bar-date">{latest.date}</time>}
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  )
}
