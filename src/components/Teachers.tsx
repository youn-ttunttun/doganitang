import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 메인에서는 수업 구조만 설명하고, 상세에서는 실제 수업을 맡는 튜터를 먼저 소개합니다. */
export default function Teachers({ compact = false }: { compact?: boolean }) {
  const { leads, tutors, sections } = useContent()
  const copy = sections.teachers
  const teachingTutors = tutors.filter((tutor) => tutor.role.includes('튜터'))
  const productionTeam = tutors.filter((tutor) => !tutor.role.includes('튜터'))
  const tutorCards = (people: typeof tutors) => (
    <div className="bento">
      {people.map((tutor) => (
        <article className="tile tile--tutor tile--hover s4" key={tutor.name}>
          <div className="tutor-top">
            <h4 className="tutor-name">{tutor.name} T</h4>
            <span className="tutor-role">{tutor.role}</span>
          </div>
          <p className="tutor-note">{tutor.note}</p>
        </article>
      ))}
    </div>
  )

  return (
    <Section
      id="teachers"
      tone="dark"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      {compact ? (
        <Link className="section-more section-more--on-dark" to="/teachers">
          {copy.detailsLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <>
          {teachingTutors.length > 0 && (
            <div className="teachers-group">
              <h3 className="teachers-group-title">{copy.tutorsTitle}</h3>
              {tutorCards(teachingTutors)}
            </div>
          )}
          {leads.length > 0 && (
            <div className="teachers-group">
              <h3 className="teachers-group-title">{copy.leadsTitle}</h3>
              <div className="bento">
                {leads.map((lead) => (
                  <article className="tile tile--hover s4" key={lead.name}>
                    <div className="lead-initial" aria-hidden="true">
                      {lead.name.slice(0, 1)}
                    </div>
                    <h4 className="lead-name">
                      {lead.name} <span>T</span>
                    </h4>
                    <p className="lead-role">{lead.role}</p>
                    <p className="lead-school">{lead.school}</p>
                    <ul className="lead-lines">
                      {lead.lines.map((line) => (
                        <li key={line}>
                          {/* DB에서 불러온 이력에도 같은 화살표 표기를 적용합니다. */}
                          {lead.name === '조동희' ? line.replace(/\s*->\s*/g, ' → ') : line}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}
          {productionTeam.length > 0 && (
            <div className="teachers-group">
              <h3 className="teachers-group-title">{copy.productionTitle}</h3>
              {tutorCards(productionTeam)}
            </div>
          )}
        </>
      )}
    </Section>
  )
}
