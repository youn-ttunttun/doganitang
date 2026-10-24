import { ArrowRight, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'

export default function Hero() {
  const { hero, stats } = useContent()
  const visibleStats = stats.filter(stat => stat.value.trim() && stat.label.trim())
  const badges = hero.badges.filter(badge => badge.trim()).map(badge => badge.replace('서울대·연세대', '서울대').replace('서울대 연세대', '서울대'))
  const hasDisplayHeadline = Boolean(hero.headline.trim())
  const headline = hasDisplayHeadline ? hero.headline : hero.hook.replace('학생들이 ', '학생들이\n')

  return (
    <div className="hero" id="top">
      <picture className="hero-photo" aria-hidden="true"><source media="(max-width: 640px)" srcSet="/snu-gate-brand-mobile-v2.webp" /><img src="/snu-gate-brand-v2.webp" alt="" fetchPriority="high" width={1104} height={1424} /></picture><div className="hero-photo-shade" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-badges">
          {badges.map((badge) => (
            <span className="badge" key={badge}>
              {badge}
            </span>
          ))}
        </div>

        <p className="hero-lead">{hero.lead}</p>

        <h1 className={hasDisplayHeadline ? 'hero-title' : 'hero-message'}>
          {headline.split('\n').map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        {hasDisplayHeadline && hero.hook && <p className="hero-hook">{hero.hook}</p>}

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
          <Link className="btn btn-ghost btn-lg" to="/apply">
            시범 수업 신청
            <ArrowRight size={18} />
          </Link>
        </div>

        {hero.ctaNote && <p className="hero-cta-note">{hero.ctaNote}</p>}

        {visibleStats.length > 0 && <div className="bento hero-stats">
          {visibleStats.map((stat) => (
            <div className="tile tile--stat tile--hover s3" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  )
}
