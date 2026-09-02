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
        {/* 누구를 위한 무엇인가 → 그래서 뭘 만들었나 → 어떤 순서로 → 뭐가 다른가 → 누가 → 신청 */}
        <Hero />
        <Marquee />
        <Audience />
        <Material />
        <Curriculum />
        <Positioning />
        <Teachers />
        <Proof />
        <Pricing />
        <Faq />
        <Apply />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
