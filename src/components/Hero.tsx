import { ArrowRight, Instagram } from 'lucide-react'
import { hero, site, stats } from '../content'

export default function Hero() {
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
          <a className="btn btn-primary btn-lg" href="#apply">
            수업 등록 · 진단 테스트 신청
            <ArrowRight size={18} />
          </a>
          <a className="btn btn-ghost btn-lg" href={site.instagram} target="_blank" rel="noreferrer">
            <Instagram size={18} />
            {site.instagramHandle}
          </a>
        </div>

        <dl className="hero-stats">
          {stats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <dt>{stat.value}</dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
