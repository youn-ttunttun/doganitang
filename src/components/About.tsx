import { Check } from 'lucide-react'
import { audience, principles, story } from '../content'
import Section from './Section'

export default function About() {
  return (
    <Section
      id="about"
      tone="muted"
      eyebrow={story.eyebrow}
      title={story.title.split('\n').map((line) => (
        <span key={line}>{line}</span>
      ))}
    >
      <div className="about-grid">
        <div className="about-story">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="about-audience">
          <h3>이런 학생을 위한 수업입니다</h3>
          <ul>
            {audience.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="principles">
        {principles.map((principle, index) => (
          <article className="principle" key={principle.title}>
            <span className="principle-num">{String(index + 1).padStart(2, '0')}</span>
            <h3>{principle.title}</h3>
            <p>{principle.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
