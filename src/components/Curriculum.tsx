import { useContent } from '../lib/siteContent'
import Section from './Section'

export default function Curriculum() {
  const { curriculum, principles, sections } = useContent()
  const copy = sections.curriculum
  return (
    <Section
      id="curriculum"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      <div className="bento">
        {curriculum.map((course, index) => (
          <article
            // 첫 과정(Pre)은 시작점이라 강조 타일로 둡니다.
            className={`tile tile--hover s4 ${index === 0 ? 'tile--feature' : ''}`}
            key={course.code}
          >
            <span className="course-step">STEP {index + 1}</span>
            <h3 className="course-name">
              {course.code}
              <small>{course.name}</small>
            </h3>

            <p className="course-summary">{course.summary}</p>
            <p className="course-body">{course.body}</p>

            <ul className="course-topics">
              {course.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* 원칙을 전부 지우면 제목도 함께 사라집니다 */}
      {principles.length > 0 && copy.principlesTitle && (
        <h3 className="tutors-title tutors-title--light">{copy.principlesTitle}</h3>
      )}
      <div className="bento">
        {principles.map((principle, index) => (
          <article className="tile tile--hover s4" key={principle.title}>
            <span className="tile-num">{String(index + 1).padStart(2, '0')}</span>
            <h4 className="tile-title">{principle.title}</h4>
            <p className="tile-body">{principle.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
