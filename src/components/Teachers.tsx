import { leads, tutors } from '../content'
import Section from './Section'

export default function Teachers() {
  return (
    <Section
      id="teachers"
      tone="dark"
      eyebrow="About Us"
      title={`${leads.length + tutors.length}명이 함께 만듭니다`}
      lead="수업을 진행하는 대표 선생님과, 질문 답변과 교재 제작을 맡는 튜터진입니다."
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

      <h3 className="tutors-title">튜터진</h3>
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
