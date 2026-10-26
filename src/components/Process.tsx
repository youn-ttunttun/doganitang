import { useContent } from '../lib/siteContent'
import Section from './Section'

export default function Process() {
  const { process } = useContent()
  if (process.steps.length === 0) return null

  const steps = process.steps.slice(0, 5)
  const endings = process.endings.filter((text) => text.trim() !== '').slice(0, 2)

  return (
    <Section
      id="process"
      tone="muted"
      eyebrow={process.eyebrow || undefined}
      title={process.title || undefined}
      lead={process.lead || undefined}
    >
      <ol className="flow">
        {steps.map((step, index) => (
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
