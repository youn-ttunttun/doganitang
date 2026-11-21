import { useState } from 'react'
import { ArrowRight, BookOpen, Images, Send } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { asset } from '../lib/asset'
import { useContent } from '../lib/siteContent'
import Lightbox, { type Shot } from './Lightbox'
import Section from './Section'

/** 관리자가 예전에 저장한 문구에는 새로 만든 칸이 없을 수 있습니다. */
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

type Book = { title: string; subject: string; desc: string; cover?: string; toc?: string; gallery?: Shot[] }

type Chapter = { title: string; desc?: string }

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

/**
 * compact 는 메인 페이지에 얹는 요약입니다.
 * 과정 카드만 보여주고, 교재 이야기·사진·수업 원칙은 전용 페이지로 넘깁니다.
 */
export default function Curriculum({ compact = false }: { compact?: boolean }) {
  const { curriculum, principles, sections, material } = useContent()
  const copy = sections.curriculum
  const [preview, setPreview] = useState<{ title: string; shots: Shot[] } | null>(null)

  // 전용 페이지에서는 과정을 탭으로 골라 자세히 봅니다. 메인 카드의 '자세히' 에서
  // 넘어오면 주소의 ?course= 로 그 과정이 바로 열립니다.
  const [params, setParams] = useSearchParams()
  const picked = curriculum.findIndex((course) => course.code === params.get('course'))
  const active = picked >= 0 ? picked : 0
  const pick = (index: number) =>
    setParams({ course: curriculum[index].code }, { replace: true, preventScrollReset: true })

  const books = list<Book>(material.books)

  // 카드 개수에 맞춰 폭을 정해야 마지막 줄에 빈칸이 안 생깁니다.
  // (4개면 한 줄에 넷, 2개면 둘. 좁은 화면에서는 styles.css 가 다시 접습니다)
  const courseSpan =
    { 1: 's12', 2: 's6', 4: 's3' }[curriculum.length as 1 | 2 | 4] ?? 's4'

  // 교재의 '과목' 과 과정의 '이름' 이 같으면 그 과정 카드에 함께 보여줍니다.
  // 한 과정에 여러 권을 둘 수 있습니다. (Pre 처럼 여러 권짜리 교재)
  const booksOf = (courseName: string) =>
    books.filter((book) => text(book.subject) === text(courseName))

  // 어느 과정에도 붙지 못한 교재는 아래에 따로 남깁니다. 말없이 사라지면 안 됩니다.
  const looseBooks = books.filter(
    (book) => !curriculum.some((course) => text(course.name) === text(book.subject)),
  )

  // 교재별 사진은 과정 탭 안에 나오므로, 아래 모음에는 교재와 상관없는 사진만 둡니다.
  const photos = list<Shot>(material.images).filter((image) => text(image.src) !== '')

  return (
    <Section
      id="curriculum"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      {compact && (
      <div className="bento course-cards">
        {curriculum.map((course, index) => {
          const courseBooks = booksOf(course.name)
          const shots = courseBooks.flatMap(shotsOf)

          return (
            <article
              // 첫 과정(Pre)은 시작점이라 강조 타일로 둡니다.
              className={`tile tile--hover ${courseSpan} ${index === 0 ? 'tile--feature' : ''}`}
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
                      className="course-shots"
                      onClick={() => setPreview({ title: `${course.code} 교재`, shots })}
                      aria-label={`${course.code} 교재 사진 ${shots.length}장 크게 보기`}
                    >
                      {shots.slice(0, 2).map((shot) => (
                        <img key={shot.src} src={asset(shot.src)} alt={shot.alt} loading="lazy" />
                      ))}
                      <span className="course-shots-hint">
                        <Images size={13} aria-hidden="true" />
                        {shots.length > 2 ? `+${shots.length - 2}장 더` : '크게 보기'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              <Link className="course-more" to={`/curriculum?course=${encodeURIComponent(course.code)}`}>
                {course.code} 자세히
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </article>
          )
        })}
      </div>
      )}

      {!compact && curriculum.length > 0 && (() => {
        const course = curriculum[active]
        const courseBooks = booksOf(course.name)
        const chapters = list<Chapter>((course as { chapters?: unknown }).chapters).filter(
          (chapter) => text(chapter.title) !== '',
        )
        const target = text((course as { target?: unknown }).target)
        const duration = text((course as { duration?: unknown }).duration)

        return (
          <div className="course-detail">
            <div className="course-tabs" role="tablist">
              {curriculum.map((item, index) => (
                <button
                  key={item.code}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={index === active ? 'is-active' : ''}
                  onClick={() => pick(index)}
                >
                  <span>STEP {index + 1}</span>
                  {item.code}
                </button>
              ))}
            </div>

            <article className="course-panel" role="tabpanel">
              <header className="course-panel-head">
                <h3 className="course-name">
                  {course.code}
                  <small>{course.name}</small>
                </h3>
                {duration && <span className="course-duration">{duration}</span>}
              </header>

              <p className="course-summary">{course.summary}</p>
              <p className="course-body">{course.body}</p>

              {target && (
                <div className="course-target">
                  <strong>이런 학생에게</strong>
                  <p>{target}</p>
                </div>
              )}

              <div className="course-panel-grid">
                <section>
                  <h4 className="course-panel-label">배우는 단원</h4>
                  {chapters.length > 0 ? (
                    <ol className="course-chapters">
                      {chapters.map((chapter) => (
                        <li key={chapter.title}>
                          <strong>{chapter.title}</strong>
                          {text(chapter.desc) && <span>{chapter.desc}</span>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ol className="course-chapters">
                      {course.topics.map((topic) => (
                        <li key={topic}>
                          <strong>{topic}</strong>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                {courseBooks.length > 0 && (
                  <section>
                    <h4 className="course-panel-label">교재</h4>
                    {courseBooks.map((book) => {
                      const cover = text(book.cover)
                      const shots = shotsOf(book)
                      return (
                        <div className="course-panel-book" key={book.title}>
                          <div className="course-book">
                            <div className={`book-cover book-cover--sm ${cover ? 'has-photo' : ''}`}>
                              {cover ? (
                                <img src={asset(cover)} alt={`${book.title} 표지`} loading="lazy" />
                              ) : (
                                <BookOpen size={14} aria-hidden="true" />
                              )}
                            </div>
                            <p className="course-book-title">{book.title}</p>
                          </div>
                          {text(book.desc) && <p className="course-panel-book-desc">{book.desc}</p>}
                          {shots.length > 0 && (
                            <div className="course-panel-shots">
                              {shots.map((shot, i) => (
                                <button
                                  key={shot.src}
                                  type="button"
                                  onClick={() => setPreview({ title: book.title, shots: [...shots.slice(i), ...shots.slice(0, i)] })}
                                  aria-label={`${shot.alt} 크게 보기`}
                                >
                                  <img src={asset(shot.src)} alt={shot.alt} loading="lazy" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </section>
                )}
              </div>

              <Link className="btn btn-primary course-panel-cta" to="/apply">
                <Send size={16} />
                시범 수업 신청
              </Link>
            </article>
          </div>
        )
      })()}

      {compact && (
        <Link className="section-more" to="/curriculum">
          교재와 수업 방식까지 자세히 보기
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      {/* 교재를 왜 직접 만들었는지. 예전 '교재' 섹션이 여기로 들어왔습니다. */}
      {!compact && (material.paragraphs.length > 0 || looseBooks.length > 0) && (
        <div className="material-story" id="material">
          {text(material.title) && <h3 className="tutors-title">{material.title}</h3>}

          {material.paragraphs.length > 0 && (
            <div className="bento">
              <div className="tile s12">
                {material.paragraphs.map((paragraph) => (
                  <p className="tile-body" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 아직 어느 과정에도 붙지 않은 교재입니다. 글 옆에 끼우면 글이
              눌리고 교재도 작아져서, 아래에 한 줄을 따로 씁니다.
              커리큘럼에 같은 이름의 과정을 만들면 위 과정 카드로 올라갑니다. */}
          {looseBooks.length > 0 && (
            <div className="bento">
              {looseBooks.map((book) => {
                const cover = text(book.cover)
                return (
                  <article className="book s4" key={book.title}>
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
      )}

      {/* 교재 실물·목차 사진이 준비되면 여기에 나란히 표시됩니다. */}
      {!compact && photos.length > 0 && (
        <div className="bento material-photos">
          {photos.map((image, i) => (
            <figure className="tile tile--photo s4" key={`${image.src}-${i}`}>
              <img src={asset(text(image.src))} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      )}

      {/* 원칙을 전부 지우면 제목도 함께 사라집니다 */}
      {!compact && principles.length > 0 && copy.principlesTitle && (
        <h3 className="tutors-title tutors-title--light">{copy.principlesTitle}</h3>
      )}
      <div className="bento">
        {!compact && principles.map((principle, index) => (
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
