import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 신청 뒤 진행 순서. 단계가 없으면 섹션을 만들지 않습니다. */
export default function Process() {
  const { process } = useContent()
  if (process.steps.length === 0) return null

  const endings = process.endings.filter((text) => text.trim() !== '')

  return (
    <Section
      id="process"
      tone="muted"
      eyebrow={process.eyebrow || undefined}
      title={process.title || undefined}
      lead={process.lead || undefined}
    >
      <ol className="flow">
        {process.steps.map((step, index) => (
          <li className="flow-step" key={step.title}>
            <span className="flow-num">{index + 1}</span>
            <h3 className="flow-title">{step.title}</h3>
            {step.desc && <p className="flow-desc">{step.desc}</p>}
          </li>
        ))}
      </ol>

      {endings.length > 0 && (
        <div className="flow-endings">
          {endings.map((text) => (
            <span className="flow-ending" key={text}>
              {text}
            </span>
          ))}
        </div>
      )}

      {process.note && <p className="flow-note">{process.note}</p>}
    </Section>
  )
}
