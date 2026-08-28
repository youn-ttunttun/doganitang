import { BookOpen } from 'lucide-react'
import { curriculum } from '../content'
import Section from './Section'

export default function Curriculum() {
  return (
    <Section
      id="curriculum"
      eyebrow="Curriculum"
      title="처음부터, 순서대로"
      lead="Pre과정에서 기초를 채우고 대수와 미적분1으로 넘어갑니다. 모든 과정은 자체 제작 교재로 진행됩니다."
    >
      <ol className="courses">
        {curriculum.map((course, index) => (
          <li className="course" key={course.code}>
            <div className="course-head">
              <span className="course-step">STEP {index + 1}</span>
              <h3 className="course-name">
                {course.code}
                <small>{course.name}</small>
              </h3>
            </div>

            <p className="course-summary">{course.summary}</p>
            <p className="course-body">{course.body}</p>

            <ul className="course-topics">
              {course.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>

            <p className="course-material">
              <BookOpen size={14} aria-hidden="true" />
              {course.material}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
