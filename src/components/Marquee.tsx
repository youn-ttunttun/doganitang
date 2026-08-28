import { scoreBadges } from '../content'

/** 성적 변화 배지가 흐르는 띠. content.ts의 scoreBadges가 비어 있으면 렌더링하지 않습니다. */
export default function Marquee() {
  if (scoreBadges.length === 0) return null

  // 끊김 없이 이어지도록 같은 목록을 두 번 이어 붙입니다.
  const track = [...scoreBadges, ...scoreBadges]

  return (
    <div className="marquee" aria-label="수강생 성적 변화 기록">
      <div className="marquee-track">
        {track.map((badge, index) => (
          <span className="marquee-item" key={`${badge.label}-${index}`} aria-hidden={index >= scoreBadges.length}>
            <b>{badge.from}</b>
            <i aria-hidden="true">→</i>
            <b className="to">{badge.to}</b>
            <em>{badge.label}</em>
          </span>
        ))}
      </div>
    </div>
  )
}
