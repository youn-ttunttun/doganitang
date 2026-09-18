import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 모집 소식·공지. 올린 글이 없으면 섹션을 만들지 않습니다. */
export default function News() {
  const { news, sections } = useContent()
  const copy = sections.news
  if (news.length === 0) return null

  return (
    <Section
      id="news"
      tone="muted"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      <div className="news-list">
        {news.map((item) => (
          <article className="news-item" key={`${item.date}-${item.title}`}>
            {item.date && <time className="news-date">{item.date}</time>}
            <div className="news-body">
              <h3 className="news-title">{item.title}</h3>
              {item.body && <p className="news-text">{item.body}</p>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
