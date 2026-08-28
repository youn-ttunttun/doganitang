import { BookOpen } from 'lucide-react'
import { curriculum } from '../content'
import Section from './Section'

export default function Curriculum() {
  return (
    <Section
      id="curriculum"
      eyebrow="Curriculum"
      title="처음부터, 순서대로"
      lead="Pre과정에서 기초를 채우고 대수와 미적분1으로 넘어갑니다.\n어느 튜터에게 배우든 이 순서와 이 교재로 진행합니다."
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

        {/* 교재 배너 — 가로로 넓은 타일 */}
        <article className="tile tile--material s12">
          <div className="material-icon" aria-hidden="true">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="tile-title" style={{ marginTop: 0 }}>
              모든 과정을 자체 제작 교재로 진행합니다
            </h3>
            <p className="tile-body">
              시중 교재가 전제하는 선행 지식 없이도 읽을 수 있도록 「Checklist」 시리즈를 직접
              집필했습니다. 수업과 함께 지금도 계속 다듬고 있습니다.
            </p>
          </div>
        </article>
      </div>
    </Section>
  )
}
