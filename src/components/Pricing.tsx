import { ArrowRight, Check } from 'lucide-react'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 수강료. 등록된 항목이 없으면 렌더링하지 않습니다. */
export default function Pricing() {
  const { pricing } = useContent()
  if (pricing.plans.length === 0) return null

  // 두 개면 절반씩, 그 이상이면 3열로. (2개를 3열 폭에 두면 오른쪽이 비어 보입니다)
  const span = pricing.plans.length === 2 ? 's6' : 's4'

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
            className={`tile tile--hover ${span} plan ${plan.highlight ? 'tile--feature' : ''}`}
            key={plan.name}
          >
            <div className="plan-head">
              <h3 className="plan-name">{plan.name}</h3>
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            </div>
            {plan.desc && <p className="plan-desc">{plan.desc}</p>}

            <div className="plan-price">
              <strong>{plan.price}</strong>
              {plan.hourly && <span className="plan-hourly">{plan.hourly}</span>}
              {plan.unit && <span className="plan-unit">{plan.unit}</span>}
            </div>

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

            <a className={`btn ${plan.highlight ? 'btn-on-feature' : 'btn-ghost'} plan-cta`} href="#apply">
              {pricing.cta}
              <ArrowRight size={16} />
            </a>
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
