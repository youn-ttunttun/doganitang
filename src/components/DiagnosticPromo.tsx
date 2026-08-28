import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { diagnosticPromo } from '../content'
import { questions } from '../diagnostic'
import Section from './Section'

export default function DiagnosticPromo() {
  return (
    <Section tone="dark">
      <div className="promo">
        <div className="promo-body">
          <p className="eyebrow">Free Diagnostic</p>
          <h2 className="section-title">{diagnosticPromo.title}</h2>
          <p className="section-lead">{diagnosticPromo.sub}</p>

          <ul className="promo-points">
            {diagnosticPromo.points.map((point) => (
              <li key={point}>
                <Check size={15} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>

          <Link className="btn btn-primary btn-lg" to="/diagnostic">
            {questions.length}문항 진단 시작하기
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="promo-visual" aria-hidden="true">
          <div className="promo-card">
            <span className="promo-card-label">Q3 · 중등 기초</span>
            <p>3x − 7 = 8 을 만족하는 x 의 값을 구하시오.</p>
            <div className="promo-input">5</div>
          </div>
          <div className="promo-card promo-card--back">
            <span className="promo-card-label">결과</span>
            <p>Pre과정부터 시작하는 것을 권합니다</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
