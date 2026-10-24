import { useState } from 'react'
import { ArrowRight, Check, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 수강료. 등록된 항목이 없으면 렌더링하지 않습니다. */
export default function Pricing() {
  const { pricing } = useContent()
  // 좁은 화면에서는 한 번에 하나만 보여주고 탭으로 고릅니다.
  // 제일 가벼운 과정부터 보여줘야 값에 놀라 나가지 않습니다.
  const [active, setActive] = useState(0)

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
      {pricing.plans.length > 1 && (
        <div className="plan-tabs" role="tablist">
          {pricing.plans.map((plan, index) => (
            <button
              key={plan.name}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={index === active ? 'is-active' : ''}
              onClick={() => setActive(index)}
            >
              {plan.name}
            </button>
          ))}
        </div>
      )}

      <div className="bento plan-cards">
        {pricing.plans.map((plan, index) => (
          <article
            className={`tile tile--hover ${span} plan ${plan.highlight ? 'tile--feature' : ''} ${
              index === active ? 'is-active' : ''
            }`}
            key={plan.name}
          >
            <div className="plan-head">
              <h3 className="plan-name">{plan.name}</h3>
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            </div>
            {plan.desc && <p className="plan-desc">{plan.desc}</p>}

            <div className="plan-price">
              <strong>{plan.price}</strong>
              {plan.unit && <span className="plan-unit">{plan.unit}</span>}
              {plan.hourly && <span className="plan-hourly">{plan.hourly}</span>}
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

            <Link
              className={`btn ${plan.highlight ? 'btn-on-feature' : 'btn-ghost'} plan-cta`}
              to={`/apply?plan=${encodeURIComponent(plan.name)}`}
            >
              {pricing.cta}
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>

      {/* 가격을 보고 망설이는 사람이 그냥 나가지 않도록, 돈 들지 않는 다음 걸음을 둡니다 */}
      {pricing.fallbackTitle && (
        <div className="plan-fallback">
          <div>
            <strong>{pricing.fallbackTitle}</strong>
            <p>{pricing.fallbackText}</p>
          </div>
          <Link className="btn btn-primary" to="/diagnostic">
            <PencilRuler size={16} />
            {pricing.fallbackCta}
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

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
