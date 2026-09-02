import { Check } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 첫 화면 바로 다음 — "내 얘기네" 하고 걸리는 자리입니다. */
export default function Audience() {
  const { audience, audienceSection } = useContent()
  return (
    <Section id="audience" tone="muted" eyebrow={audienceSection.eyebrow} title={audienceSection.title}>
      <ul className="audience-grid">
        {audience.map((item) => (
          <li className="tile audience-item" key={item}>
            <Check size={17} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link className="audience-cta" to="/diagnostic">
        어디서 막혔는지 모르겠다면, 3분 진단 테스트로 확인해보세요
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </Section>
  )
}
