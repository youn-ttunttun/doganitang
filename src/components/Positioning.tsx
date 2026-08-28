import { X, Check } from 'lucide-react'
import { positioning } from '../content'
import Section from './Section'

export default function Positioning() {
  return (
    <Section
      id="why"
      eyebrow={positioning.eyebrow}
      title={positioning.title}
      lead={positioning.lead}
    >
      <div className="compare">
        <div className="compare-head">
          <span className="compare-point" />
          <span className="compare-col compare-col--others">보통의 수업</span>
          <span className="compare-col compare-col--ours">Teamlesson</span>
        </div>

        {positioning.rows.map((row) => (
          <div className="compare-row" key={row.point}>
            <span className="compare-point">{row.point}</span>
            <span className="compare-col compare-col--others">
              <X size={15} aria-hidden="true" />
              {row.others}
            </span>
            <span className="compare-col compare-col--ours">
              <Check size={15} aria-hidden="true" />
              {row.ours}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
