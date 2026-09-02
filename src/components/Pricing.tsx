import { Check } from 'lucide-react'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 수강료. 등록된 항목이 없으면 렌더링하지 않습니다. */
export default function Pricing() {
  const { pricing } = useContent()
  if (pricing.plans.length === 0) return null

  return (
    <Section
      id="pricing"
      tone="muted"
      eyebrow={pricing.eyebrow}
      title={pricing.title}
      lead={pricing.lead || undefined}
    >
      <div className="bento">
        {pricing.plans.map((plan) => (
          <article
            className={`tile tile--hover s4 ${plan.highlight ? 'tile--feature' : ''}`}
            key={plan.name}
          >
            <h3 className="plan-name">{plan.name}</h3>
            {plan.desc && <p className="plan-desc">{plan.desc}</p>}

            <p className="plan-price">
              {plan.price}
              {plan.unit && <small>{plan.unit}</small>}
            </p>

            {plan.features.length > 0 && (
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {pricing.notes.length > 0 && (
        <ul className="plan-notes">
          {pricing.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </Section>
  )
}
