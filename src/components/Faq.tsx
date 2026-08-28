import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../content'
import Section from './Section'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <Section id="faq" tone="muted" eyebrow="FAQ" title="자주 묻는 질문">
      <div className="faq-list">
        {faqs.map((faq, index) => {
          const open = openIndex === index
          return (
            <div className={`faq-item ${open ? 'is-open' : ''}`} key={faq.q}>
              <button
                className="faq-q"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
              >
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
    </Section>
  )
}
