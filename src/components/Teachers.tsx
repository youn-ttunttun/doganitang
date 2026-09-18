import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** compact 는 메인 페이지 요약입니다. 튜터 목록은 전용 페이지에만 둡니다. */
export default function Teachers({ compact = false }: { compact?: boolean }) {
  const { leads, tutors, sections } = useContent()
  const copy = sections.teachers
  return (
    <Section
      id="teachers"
      tone="dark"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      <div className="bento">
        {leads.map((lead) => (
          <article className="tile tile--hover s4" key={lead.name}>
            <div className="lead-initial" aria-hidden="true">
              {lead.name.slice(0, 1)}
            </div>
            <h3 className="lead-name">
              {lead.name} <span>T</span>
            </h3>
            <p className="lead-role">{lead.role}</p>
            <p className="lead-school">{lead.school}</p>
            <ul className="lead-lines">
              {lead.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {compact && (
        <Link className="section-more section-more--on-dark" to="/teachers">
          가르치는 사람들 자세히 보기
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      {!compact && tutors.length > 0 && copy.tutorsTitle && (
        <h3 className="tutors-title">{copy.tutorsTitle}</h3>
      )}
      <div className="bento">
        {!compact && tutors.map((tutor) => (
          <article className="tile tile--tutor tile--hover s4" key={tutor.name}>
            <div className="tutor-top">
              <span className="tutor-name">{tutor.name} T</span>
              <span className="tutor-role">{tutor.role}</span>
            </div>
            <p className="tutor-note">{tutor.note}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
