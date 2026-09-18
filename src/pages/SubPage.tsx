import { useEffect, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import StickyCta from '../components/StickyCta'

/** 메인에서 떼어낸 페이지들의 공통 껍데기. */
export default function SubPage({ children }: { children: ReactNode }) {
  // 링크를 눌러 들어왔을 때 이전 페이지의 스크롤 위치가 남지 않게 합니다.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Nav />
      <main className="subpage">
        {children}
        <div className="container subpage-back">
          <Link className="section-more" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            첫 화면으로
          </Link>
        </div>
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
