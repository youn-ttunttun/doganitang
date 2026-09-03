import { useContent } from '../lib/siteContent'
import Section from './Section'

export default function Teachers() {
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

      {tutors.length > 0 && copy.tutorsTitle && (
        <h3 className="tutors-title">{copy.tutorsTitle}</h3>
      )}
      <div className="bento">
        {tutors.map((tutor) => (
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
