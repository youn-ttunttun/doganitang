import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import About from '../components/About'
import Apply from '../components/Apply'
import Curriculum from '../components/Curriculum'
import DiagnosticPromo from '../components/DiagnosticPromo'
import Faq from '../components/Faq'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Material from '../components/Material'
import Nav from '../components/Nav'
import Positioning from '../components/Positioning'
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
        <Hero />
        <Marquee />
        <Positioning />
        <Material />
        <Curriculum />
        <DiagnosticPromo />
        <Proof />
        <About />
        <Teachers />
        <Faq />
        <Apply />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
