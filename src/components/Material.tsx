import { BookOpen } from 'lucide-react'
import { asset } from '../lib/asset'
import { useContent } from '../lib/siteContent'
import Section from './Section'

export default function Material() {
  const { material } = useContent()
  // 사진칸만 만들어 두고 아직 안 올린 경우는 건너뜁니다.
  const photos = material.images.filter((image) => image.src.trim() !== '')

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
      {photos.length > 0 && (
        <div className="bento material-photos">
          {photos.map((image, i) => (
            <figure className="tile tile--photo s4" key={`${image.src}-${i}`}>
              <img src={asset(image.src)} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      )}
    </Section>
  )
}
