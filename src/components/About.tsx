import { ArrowRight, Check } from 'lucide-react'
import { audience, principles, story } from '../content'
import Section from './Section'

export default function About() {
  return (
    <Section id="about" tone="muted" eyebrow={story.eyebrow}>
      <div className="bento">
        {/* 스토리 — 가장 큰 타일 */}
        <article className="tile s7 r2">
          <h2 className="story-quote">
            {story.title.split('\n').map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h2>
          {story.paragraphs.map((paragraph) => (
            <p className="tile-body" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </article>

        {/* 대상 */}
        <aside className="tile s5 r2">
          <p className="tile-label">For Whom</p>
          <h3 className="tile-title">이런 학생을 위한 수업입니다</h3>
          <ul className="audience-list">
            {audience.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* 남는 공간을 진단 테스트로 연결합니다 */}
          <a className="tile-cta" href="#apply">
            지금 어디서 막히는지 모르겠다면, 진단 테스트부터
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </aside>

        {/* 수업 철학 3가지 */}
        {principles.map((principle, index) => (
          <article className="tile tile--hover s4" key={principle.title}>
            <span className="tile-num">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="tile-title">{principle.title}</h3>
            <p className="tile-body">{principle.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
