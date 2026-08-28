import { Quote, TrendingUp } from 'lucide-react'
import { resultCases, reviews } from '../content'
import Section from './Section'

/** 성적 사례와 후기. content.ts의 두 배열이 모두 비어 있으면 섹션을 만들지 않습니다. */
export default function Proof() {
  if (resultCases.length === 0 && reviews.length === 0) return null

  return (
    <Section
      id="proof"
      tone="muted"
      eyebrow="Records"
      title="숫자로 남은 변화"
      lead="수업을 들은 학생들의 실제 기록입니다."
    >
      {resultCases.length > 0 && (
        <div className="bento">
          {resultCases.map((item) => (
            <article className="tile tile--hover s4" key={`${item.who}-${item.before}`}>
              <div className="result-head">
                <TrendingUp size={16} aria-hidden="true" />
                <span>
                  {item.course} · {item.period}
                </span>
              </div>

              <p className="result-change">
                <span className="result-before">{item.before}</span>
                <i aria-hidden="true">→</i>
                <span className="result-after">{item.after}</span>
              </p>

              <p className="result-who">{item.who}</p>
              {item.note && <p className="tile-body">{item.note}</p>}

              {item.image && (
                <img className="result-image" src={item.image} alt="성적 인증" loading="lazy" />
              )}
            </article>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <h3 className="tutors-title">수강생·학부모 후기</h3>
          <div className="bento">
            {reviews.map((review) => (
              <article className="tile s4" key={review.quote}>
                <Quote size={18} className="review-mark" aria-hidden="true" />
                <p className="review-quote">{review.quote}</p>
                <p className="review-who">{review.who}</p>
                {review.image && (
                  <img className="review-image" src={review.image} alt="후기 캡처" loading="lazy" />
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </Section>
  )
}
