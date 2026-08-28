import About from './components/About'
import Apply from './components/Apply'
import Curriculum from './components/Curriculum'
import Faq from './components/Faq'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Nav from './components/Nav'
import Teachers from './components/Teachers'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Curriculum />
        <Teachers />
        <Faq />
        <Apply />
      </main>
      <Footer />
    </>
  )
}
