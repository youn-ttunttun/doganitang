import { BookOpen } from 'lucide-react'
import { material } from '../content'
import { asset } from '../lib/asset'
import Section from './Section'

export default function Material() {
  return (
    <Section id="material" tone="muted" eyebrow={material.eyebrow} title={material.title}>
      <div className="bento">
        <div className="tile s7">
          {material.paragraphs.map((paragraph) => (
            <p className="tile-body" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="books s5">
          {material.books.map((book) => (
            <article className="book" key={book.title}>
              <div className="book-cover" aria-hidden="true">
                <BookOpen size={18} />
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-subject">{book.subject}</p>
                <p className="book-desc">{book.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 교재 실물 사진이 준비되면 여기에 나란히 표시됩니다. */}
      {material.images.length > 0 && (
        <div className="bento material-photos">
          {material.images.map((image) => (
            <figure className="tile tile--photo s4" key={image.src}>
              <img src={asset(image.src)} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      )}
    </Section>
  )
}
