import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToId } from '../lib/scroll'
import Apply from '../components/Apply'
import Audience from '../components/Audience'
import Curriculum from '../components/Curriculum'
import Faq from '../components/Faq'
import News from '../components/News'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Nav from '../components/Nav'
import Positioning from '../components/Positioning'
import Pricing from '../components/Pricing'
import Proof from '../components/Proof'
import StickyCta from '../components/StickyCta'
import Teachers from '../components/Teachers'

export default function Landing() {
  const { hash } = useLocation()

  // 다른 화면에서 '/#apply' 처럼 위치를 달고 넘어온 경우입니다.
  // 이미 페이지가 바뀌며 한 번 움직였으므로, 여기서 또 미끄러지면
  // 두 번 움직이는 것처럼 보입니다. 그래서 바로 그 자리로 놓습니다.
  useEffect(() => {
    if (!hash) return
    scrollToId(hash.slice(1), { instant: true })
  }, [hash])

  return (
    <>
      <Nav />
      <main>
        {/*
          내 얘기다 → 그래서 뭘 만들었나 → 어떤 순서로 → 뭐가 다른가
          → 정말 그런가(증거) → 누가 하나 → 얼마인가 → 남은 의문 → 신청

          증거는 주장 바로 뒤에 와야 합니다. 사이에 다른 섹션이 끼면
          '정말?' 하고 생긴 의심이 답을 못 만나고 식습니다.
        */}
        <Hero />
        <Marquee />
        <Audience />
        <Curriculum compact />
        <Positioning />
        <Proof />
        <Teachers compact />
        <Pricing />
        <Faq />
        <News />
        <Apply />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
