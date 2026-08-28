import type { ReactNode } from 'react'
import { useReveal } from '../hooks'

type Props = {
  id?: string
  eyebrow?: string
  title?: ReactNode
  lead?: string
  tone?: 'plain' | 'muted' | 'dark'
  children: ReactNode
}

/** 모든 섹션의 공통 껍데기 — 여백, 헤더, 스크롤 등장 효과를 담당합니다. */
export default function Section({ id, eyebrow, title, lead, tone = 'plain', children }: Props) {
  const { ref, shown } = useReveal<HTMLElement>()

  return (
    <section
      id={id}
      ref={ref}
      className={`section section--${tone} ${shown ? 'is-visible' : ''}`}
    >
      <div className="container">
        {(eyebrow || title || lead) && (
          <header className="section-head">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="section-title">{title}</h2>}
            {lead && <p className="section-lead">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
