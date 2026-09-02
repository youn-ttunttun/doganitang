import { useContent } from '../lib/siteContent'
import Section from './Section'

export default function Teachers() {
  const { leads, tutors } = useContent()
  return (
    <Section
      id="teachers"
      tone="dark"
      eyebrow="Team"
      title="교재를 만드는 사람과, 가르치는 사람"
      lead={`공동대표 ${leads.length}인이 교재와 커리큘럼을 만들고 튜터를 교육합니다.\n수업은 튜터 ${tutors.length}인이 1:1로 진행합니다.`}
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

      <h3 className="tutors-title">수업을 맡는 튜터진</h3>
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
