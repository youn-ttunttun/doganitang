import { useEffect, useRef, useState } from 'react'
import { Quote } from 'lucide-react'
import { asset } from '../lib/asset'
import { useContent } from '../lib/siteContent'
import Section from './Section'

type Review = { quote: string; who: string; image?: string }

/**
 * 후기 한 장. 길면 접어 두고 '더 보기' 로 펼칩니다.
 * 후기가 길어 한참 내려야 한다는 말씀이 있어서, 기본은 다섯 줄만 보입니다.
 */
function ReviewCard({ review }: { review: Review }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [tooLong, setTooLong] = useState(false)

  // 접었을 때 잘린 내용이 있을 때만 '더 보기' 를 붙입니다.
  useEffect(() => {
    const el = ref.current
    if (el) setTooLong(el.scrollHeight > el.clientHeight + 2)
  }, [])

  return (
    <article className="tile s4">
      <Quote size={18} className="review-mark" aria-hidden="true" />
      <p ref={ref} className={`review-quote ${open ? '' : 'is-clamped'}`}>
        {review.quote}
      </p>
      {tooLong && (
        <button className="review-more" type="button" onClick={() => setOpen((v) => !v)}>
          {open ? '접기' : '더 보기'}
        </button>
      )}
      <p className="review-who">{review.who}</p>
      {review.image && (
        <img className="review-image" src={asset(review.image)} alt="후기 캡처" loading="lazy" />
      )}
    </article>
  )
}

/** 후기. 비어 있으면 섹션을 만들지 않습니다. */
export default function Proof() {
  const { reviews, sections } = useContent()
  const copy = sections.proof
  if (reviews.length === 0) return null

  return (
    <Section
      id="proof"
      eyebrow={copy.eyebrow || undefined}
      title={copy.title || undefined}
      lead={copy.lead || undefined}
    >
      {reviews.length > 0 && (
        <>
          {copy.reviewsTitle && <h3 className="tutors-title">{copy.reviewsTitle}</h3>}
          <div className="bento swipe-cards">
            {reviews.map((review) => (
              <ReviewCard review={review} key={review.quote} />
            ))}
          </div>
        </>
      )}
    </Section>
  )
}
