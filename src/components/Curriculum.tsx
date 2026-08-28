import { curriculum, principles } from '../content'
import Section from './Section'

export default function Curriculum() {
  return (
    <Section
      id="curriculum"
      eyebrow="Curriculum"
      title="처음부터, 순서대로"
      lead="Pre과정에서 기초를 채우고 대수와 미적분1으로 넘어갑니다.
어느 튜터에게 배우든 이 순서와 이 교재로 진행합니다."
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

      {/* 수업을 어떻게 끌고 가는지 — 별도 섹션으로 두면 흐름이 끊겨 여기에 붙였습니다. */}
      <h3 className="tutors-title tutors-title--light">수업은 이렇게 진행합니다</h3>
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
