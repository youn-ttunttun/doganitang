import { ArrowRight, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'

export default function Hero() {
  const { hero, stats } = useContent()

  return (
    <div className="hero" id="top">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-badges">
          {hero.badges.map((badge) => (
            <span className="badge" key={badge}>
              {badge}
            </span>
          ))}
        </div>

        <p className="hero-lead">{hero.lead}</p>

        <h1 className="hero-title">
          {hero.headline.split('\n').map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <p className="hero-sub">
          {hero.sub.split('\n').map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/diagnostic">
            <PencilRuler size={18} />
            무료 진단 테스트
          </Link>
          <a className="btn btn-ghost btn-lg" href="#apply">
            수업 등록 상담
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="bento hero-stats">
          {stats.map((stat) => (
            <div className="tile tile--stat tile--hover s3" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
