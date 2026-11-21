import { Fragment } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { asset } from '../lib/asset'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 예전에 저장한 튜터에는 새로 만든 칸이 없을 수 있습니다. */
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

/** 메인에서는 수업 구조만 설명하고, 상세에서는 실제 수업을 맡는 튜터를 먼저 소개합니다. */
type Person = {
  name: string
  role: string
  note: string
  photo: string
  school: string
  subjects: string[]
  lines: string[]
}

/** 관리자 화면에서 넣은 한 사람. 이름이 비어 있으면 화면에 내보내지 않습니다. */
const toPerson = (raw: unknown): Person | null => {
  const row = (raw ?? {}) as Record<string, unknown>
  const name = text(row.name)
  if (!name) return null
  return {
    name,
    role: text(row.role),
    note: text(row.note),
    photo: text(row.photo),
    school: text(row.school),
    subjects: list<unknown>(row.subjects).map(text).filter(Boolean),
    lines: list<unknown>(row.lines).map(text).filter(Boolean),
  }
}
const people = (value: unknown) => list<unknown>(value).map(toPerson).filter((p): p is Person => p !== null)

/** 메인에서는 수업 구조만 설명하고, 상세에서는 실제 수업을 맡는 튜터를 먼저 소개합니다. */
export default function Teachers({ compact = false }: { compact?: boolean }) {
  const content = useContent()
  const { sections } = content
  const copy = sections.teachers
  const qualification = '전원 평가원 수학 1등급(상위 4% 이내)'
  // DB에 남아 있는 이전 문장에도 적용하되, 관리자가 다른 내용으로 고친 문구는 유지합니다.
  const description = copy.lead.replace(
    /수업은 튜터가 1:1\s*로 진행합니다\./g,
    `수업은 ${qualification}인 튜터가 1:1로 진행합니다.`,
  )
  // 튜터와 제작팀은 관리자 화면에서 따로 추가합니다.
  // 예전에는 튜터 명단 하나에 역할로 나눴으므로, 역할에 '튜터'가 없는 예전 항목은 제작팀으로 옮겨 보여줍니다.
  const tutorRows = people(content.tutors)
  const teachingTutors = tutorRows.filter((p) => !p.role || p.role.includes('튜터'))
  const productionRows = people((content as { production?: unknown }).production)
  const productionTeam = [
    ...productionRows,
    ...tutorRows.filter(
      (p) => p.role && !p.role.includes('튜터') && !productionRows.some((q) => q.name === p.name),
    ),
  ]
  const leads = people(content.leads)
  const tutorCards = (group: Person[]) => (
    <div className="bento">
      {group.map((person) => (
        <article className="tile tile--tutor tile--hover s4" key={person.name}>
          <div className="tutor-top">
            <span className={`tutor-avatar ${person.photo ? 'has-photo' : ''}`} aria-hidden="true">
              {person.photo ? <img src={asset(person.photo)} alt="" loading="lazy" /> : person.name.slice(0, 1)}
            </span>
            <h4 className="tutor-name">{person.name} T</h4>
            {person.role && (
              <span className="tutor-role">
                {/* 기존 DB 명단의 이전 역할에도 요청한 제작팀 표기를 적용합니다. */}
                {person.name === '김정우' && person.role === '튜터' ? '튜터, 제작팀' : person.role}
              </span>
            )}
          </div>
          {person.school && <p className="tutor-school">{person.school}</p>}
          {person.note && <p className="tutor-note">{person.note}</p>}
          {person.lines.map((line) => (
            <p className="tutor-note" key={line}>
              {line}
            </p>
          ))}
          {person.subjects.length > 0 && (
            <ul className="tutor-subjects">
              {person.subjects.map((sub) => (
                <li key={sub}>{sub}</li>
              ))}
            </ul>
          )}
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
      lead={description ? description.split(qualification).map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <strong className="teachers-qualification">{qualification}</strong>}
          {part.split('튜터가 1:1로').map((segment, i) => (
            <Fragment key={i}>
              {i > 0 && <>튜터가 <span className="teachers-mobile-student">학생과 </span>1:1로</>}
              {segment}
            </Fragment>
          ))}
        </Fragment>
      )) : undefined}
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
              {copy.tutorsTitle && <h3 className="teachers-group-title">{copy.tutorsTitle}</h3>}
              {tutorCards(teachingTutors)}
            </div>
          )}
          {leads.length > 0 && (
            <div className="teachers-group">
              {copy.leadsTitle && <h3 className="teachers-group-title">{copy.leadsTitle}</h3>}
              <div className="bento">
                {leads.map((lead) => (
                  <article className="tile tile--hover s4" key={lead.name}>
                    <div className="lead-initial" aria-hidden="true">
                      {lead.name.slice(0, 1)}
                    </div>
                    <h4 className="lead-name">
                      {lead.name} <span>T</span>
                    </h4>
                    {lead.role && <p className="lead-role">{lead.role}</p>}
                    {lead.school && <p className="lead-school">{lead.school}</p>}
                    {lead.lines.length > 0 && (
                    <ul className="lead-lines">
                      {lead.lines.map((line) => (
                        <li key={line}>
                          {/* DB에서 불러온 이력에도 같은 화살표 표기를 적용합니다. */}
                          {lead.name === '조동희' ? line.replace(/\s*->\s*/g, ' → ') : line}
                        </li>
                      ))}
                    </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
          {productionTeam.length > 0 && (
            <div className="teachers-group">
              {copy.productionTitle && <h3 className="teachers-group-title">{copy.productionTitle}</h3>}
              {tutorCards(productionTeam)}
            </div>
          )}
        </>
      )}
    </Section>
  )
}
