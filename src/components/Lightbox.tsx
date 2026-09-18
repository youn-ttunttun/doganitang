import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { asset } from '../lib/asset'

export type Shot = { src: string; alt: string }

type Props = {
  title: string
  shots: Shot[]
  onClose: () => void
}

/** 교재 사진을 크게 넘겨보는 창. */
export default function Lightbox({ title, shots, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const shot = shots[index]

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(shots.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    // 창이 열려 있는 동안 뒤 화면이 같이 스크롤되지 않게 막습니다.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [shots.length, onClose])

  if (!shot) return null

  // 섹션의 등장 애니메이션이 transform 을 쓰기 때문에, 그 안에서 그리면
  // position: fixed 가 화면이 아니라 섹션 기준이 되어 엉뚱한 곳에 박힙니다.
  // 그래서 body 로 빼내서 그립니다.
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <header className="lightbox-head">
          <span className="lightbox-title">
            {title}
            {shots.length > 1 && (
              <em>
                {index + 1} / {shots.length}
              </em>
            )}
          </span>
          <button className="lightbox-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <figure className="lightbox-figure">
          <img src={asset(shot.src)} alt={shot.alt || title} />
          {shot.alt && <figcaption>{shot.alt}</figcaption>}
        </figure>

        {shots.length > 1 && (
          <div className="lightbox-nav">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="이전 사진"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIndex((i) => Math.min(shots.length - 1, i + 1))}
              disabled={index === shots.length - 1}
              aria-label="다음 사진"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
