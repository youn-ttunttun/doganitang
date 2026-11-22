import { useState } from 'react'
import { ChevronDown, Instagram, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/siteContent'
import Section from './Section'

/**
 * 자주 묻는 질문.
 * 여러 개를 함께 펼쳐 비교할 수 있게 하고, '모두 펼치기' 를 두었습니다.
 * 메인에는 관리자가 정한 순서대로 세 질문만 보여주고 전체 페이지로 연결합니다.
 */
export default function Faq({ compact = false }: { compact?: boolean }) {
  const { faqs, sections, site } = useContent()
  const copy = sections.faq
  const [opened, setOpened] = useState<Set<number>>(() => new Set())

  if (faqs.length === 0) return null

  const visibleFaqs = compact ? faqs.slice(0, 3) : faqs
  const allOpen = opened.size === faqs.length
  const toggle = (index: number) =>
    setOpened((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <Section
      id="faq"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      {!compact && (
        <div className="faq-tools">
          <span>{faqs.length}개 질문</span>
          <button
            type="button"
            onClick={() => setOpened(allOpen ? new Set() : new Set(faqs.map((_, i) => i)))}
          >
            {allOpen ? '모두 접기' : '모두 펼치기'}
          </button>
        </div>
      )}

      <div className="faq-list">
        {visibleFaqs.map((faq, index) => {
          const open = opened.has(index)
          return (
            <div className={`faq-item ${open ? 'is-open' : ''}`} key={faq.q}>
              <button className="faq-q" onClick={() => toggle(index)} aria-expanded={open}>
                <span className="faq-mark" aria-hidden="true">
                  Q
                </span>
                <span>{faq.q}</span>
                <ChevronDown size={18} aria-hidden="true" />
              </button>
              <div className="faq-a" hidden={!open}>
                <p>{faq.a}</p>
              </div>
            </div>
          )
        })}
      </div>

      {compact ? (
        <Link className="section-more faq-overview-link" to="/faq">
          자주 묻는 질문 전체 보기
        </Link>
      ) : (
        <div className="faq-more">
          <strong>원하는 답이 없나요?</strong>
          <div>
            {site.instagram && (
              <a className="btn btn-ghost btn-sm" href={site.instagram} target="_blank" rel="noreferrer">
                <Instagram size={15} />
                DM으로 묻기
              </a>
            )}
            <Link className="btn btn-primary btn-sm" to="/apply">
              <Send size={15} />
              시범 수업에서 직접 묻기
            </Link>
          </div>
        </div>
      )}
    </Section>
  )
}
