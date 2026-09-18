import { useState } from 'react'
import { BookOpen, Images } from 'lucide-react'
import { asset } from '../lib/asset'
import { useContent } from '../lib/siteContent'
import Lightbox, { type Shot } from './Lightbox'
import Section from './Section'

/** 관리자가 예전에 저장한 문구에는 새로 만든 칸이 없을 수 있습니다. */
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

type Book = { title: string; subject: string; desc: string; cover?: string; toc?: string; gallery?: Shot[] }

/** 한 교재에서 미리보기로 넘겨볼 사진들. 표지 → 목차 → 나머지 순서입니다. */
function shotsOf(book: Book): Shot[] {
  const shots: Shot[] = []
  if (text(book.cover)) shots.push({ src: text(book.cover), alt: `${book.title} 표지` })
  if (text(book.toc)) shots.push({ src: text(book.toc), alt: `${book.title} 목차` })
  for (const shot of list<Shot>(book.gallery)) {
    if (text(shot.src)) shots.push({ src: text(shot.src), alt: text(shot.alt) || book.title })
  }
  return shots
}

export default function Curriculum() {
  const { curriculum, principles, sections, material } = useContent()
  const copy = sections.curriculum
  const [preview, setPreview] = useState<{ title: string; shots: Shot[] } | null>(null)

  const books = list<Book>(material.books)

  // 교재의 '과목' 과 과정의 '이름' 이 같으면 그 과정 카드에 함께 보여줍니다.
  // 한 과정에 여러 권을 둘 수 있습니다. (Pre 처럼 여러 권짜리 교재)
  const booksOf = (courseName: string) =>
    books.filter((book) => text(book.subject) === text(courseName))

  // 어느 과정에도 붙지 못한 교재는 아래에 따로 남깁니다. 말없이 사라지면 안 됩니다.
  const looseBooks = books.filter(
    (book) => !curriculum.some((course) => text(course.name) === text(book.subject)),
  )

  const photos = [
    ...books
      .filter((book) => text(book.toc) !== '')
      .map((book) => ({ src: text(book.toc), alt: `${book.title} 목차` })),
    ...list<Shot>(material.images),
  ].filter((image) => text(image.src) !== '')

  return (
    <Section
      id="curriculum"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      <div className="bento">
        {curriculum.map((course, index) => {
          const courseBooks = booksOf(course.name)
          const shots = courseBooks.flatMap(shotsOf)

          return (
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

              {courseBooks.length > 0 && (
                <div className="course-books">
                  <span className="course-book-label">
                    교재
                    {courseBooks.length > 1 && ` ${courseBooks.length}권`}
                  </span>

                  {courseBooks.map((book) => {
                    const cover = text(book.cover)
                    return (
                      <div className="course-book" key={book.title}>
                        <div className={`book-cover book-cover--sm ${cover ? 'has-photo' : ''}`}>
                          {cover ? (
                            <img src={asset(cover)} alt={`${book.title} 표지`} loading="lazy" />
                          ) : (
                            <BookOpen size={14} aria-hidden="true" />
                          )}
                        </div>
                        <p className="course-book-title">{book.title}</p>
                      </div>
                    )
                  })}

                  {shots.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm course-preview"
                      onClick={() => setPreview({ title: `${course.code} 교재`, shots })}
                    >
                      <Images size={14} />
                      미리보기 {shots.length}장
                    </button>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* 교재를 왜 직접 만들었는지. 예전 '교재' 섹션이 여기로 들어왔습니다. */}
      {(material.paragraphs.length > 0 || looseBooks.length > 0) && (
        <div className="material-story" id="material">
          {text(material.title) && <h3 className="tutors-title">{material.title}</h3>}
          <div className="bento">
            {/* 교재 카드가 전부 과정으로 옮겨가면 글이 폭을 다 씁니다. */}
            <div className={`tile ${looseBooks.length > 0 ? 's7' : 's12'}`}>
              {material.paragraphs.map((paragraph) => (
                <p className="tile-body" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            {looseBooks.length > 0 && (
              <div className="books s5">
                {looseBooks.map((book) => {
                  const cover = text(book.cover)
                  return (
                    <article className="book" key={book.title}>
                      <div className={`book-cover ${cover ? 'has-photo' : ''}`}>
                        {cover ? (
                          <img src={asset(cover)} alt={`${book.title} 표지`} loading="lazy" />
                        ) : (
                          <BookOpen size={18} aria-hidden="true" />
                        )}
                      </div>
                      <div className="book-info">
                        <h4 className="book-title">{book.title}</h4>
                        <p className="book-subject">{book.subject}</p>
                        <p className="book-desc">{book.desc}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 교재 실물·목차 사진이 준비되면 여기에 나란히 표시됩니다. */}
      {photos.length > 0 && (
        <div className="bento material-photos">
          {photos.map((image, i) => (
            <figure className="tile tile--photo s4" key={`${image.src}-${i}`}>
              <img src={asset(text(image.src))} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      )}

      {/* 원칙을 전부 지우면 제목도 함께 사라집니다 */}
      {principles.length > 0 && copy.principlesTitle && (
        <h3 className="tutors-title tutors-title--light">{copy.principlesTitle}</h3>
      )}
      <div className="bento">
        {principles.map((principle, index) => (
          <article className="tile tile--hover s4" key={principle.title}>
            <span className="tile-num">{String(index + 1).padStart(2, '0')}</span>
            <h4 className="tile-title">{principle.title}</h4>
            <p className="tile-body">{principle.body}</p>
          </article>
        ))}
      </div>

      {preview && (
        <Lightbox title={preview.title} shots={preview.shots} onClose={() => setPreview(null)} />
      )}
    </Section>
  )
}
