import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Apply from '../components/Apply'
import Audience from '../components/Audience'
import Curriculum from '../components/Curriculum'
import Faq from '../components/Faq'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Material from '../components/Material'
import Nav from '../components/Nav'
import Positioning from '../components/Positioning'
import Pricing from '../components/Pricing'
import Proof from '../components/Proof'
import StickyCta from '../components/StickyCta'
import Teachers from '../components/Teachers'

export default function Landing() {
  const { hash } = useLocation()

  // 진단 결과 화면에서 '/#apply' 로 넘어온 경우 해당 위치로 이동시킵니다.
  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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
        <Material />
        <Curriculum />
        <Positioning />
        <Proof />
        <Teachers />
        <Pricing />
        <Faq />
        <Apply />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
