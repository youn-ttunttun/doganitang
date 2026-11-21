import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, X } from 'lucide-react'
import { useContent } from '../lib/siteContent'
import { asset } from '../lib/asset'
import './StoryInvitation.css'

function Highlight({ text }: { text: string }) {
  return <>{text.split(/(<[^<>]+>)/g).map((part, i) => part.startsWith('<') && part.endsWith('>')
    ? <mark key={i}>{part.slice(1, -1)}</mark> : <Fragment key={i}>{part}</Fragment>)}</>
}

export default function StoryInvitation() {
  const { storyManifesto: copy } = useContent()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // 이전에 펼친 항목과 읽던 위치를 다음 입장에 남기지 않습니다.
    dialog.current?.querySelectorAll('details').forEach((item) => { item.open = false })
    dialog.current?.showModal()
    if (dialog.current) dialog.current.scrollTop = 0
    return () => { document.body.style.overflow = previous }
  }, [open])
  function close() { dialog.current?.close() }
  function toggleAll() {
    const items = Array.from(dialog.current?.querySelectorAll('details') ?? [])
    const shouldOpen = items.some((item) => !item.open)
    items.forEach((item) => { item.open = shouldOpen })
  }
  return <>
    <section className="story-invitation" aria-label="팀레슨의 수업 철학">
      <button ref={trigger} className="story-invitation-link" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span className="story-invitation-statement"><Highlight text={copy.cta} /></span>
        <span className="story-invitation-hint">{copy.invitation} <ArrowUpRight size={16} aria-hidden="true" /></span>
      </button>
    </section>
    <dialog ref={dialog} className="story-dialog" aria-labelledby="story-dialog-title"
      onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }}
      onClick={(event) => { if (event.target === event.currentTarget) close() }}>
      <div className="story-sheet">
        <header className="story-sheet-head">
          <div><span className="story-wordmark">TEAMLESSON</span><h2 id="story-dialog-title">{copy.title}</h2></div>
          <button className="story-close" onClick={close} aria-label="닫고 메인으로 돌아가기" autoFocus><X size={22} /></button>
        </header>
        <div className="story-tools"><span>{copy.chapters.length}개의 이야기</span><button onClick={toggleAll}>모두 펼치기 / 접기</button></div>
        <div className="story-chapters">
          {copy.chapters.map((chapter, index) => <details className="story-chapter" key={chapter.title}>
            <summary><span className="story-number">{String(index + 1).padStart(2, '0')}</span><h3><Highlight text={chapter.title} /></h3><ChevronDown size={20} aria-hidden="true" /></summary>
            <div className="story-prose">
              {chapter.image && <figure>
                <div className={chapter.secondImage ? 'story-photos' : undefined}>
                  <img src={asset(chapter.image)} alt={chapter.imageAlt} loading="lazy" width="900" height="800" />
                  {chapter.secondImage && <img src={asset(chapter.secondImage)} alt={chapter.secondImageAlt} loading="lazy" width="900" height="800" />}
                </div>
                <figcaption>{chapter.imageAlt}</figcaption>
              </figure>}
              {chapter.body.split(/\n\n+/).map((paragraph, i) => paragraph.startsWith('- ')
                ? <ul className="story-comparison" key={i}>{paragraph.split('\n').map((line, j) => <li key={j}><span><Highlight text={line.replace(/^- /, '')} /></span></li>)}</ul>
                : paragraph.startsWith('‘') && paragraph.endsWith('’') && index === 1
                  ? <blockquote key={i}><Highlight text={paragraph} /></blockquote>
                  : <p key={i}><Highlight text={paragraph} /></p>)}
            </div>
          </details>)}
        </div>
        <footer className="story-sheet-foot"><button onClick={close}>메인으로 돌아가기 <ArrowUpRight size={16} aria-hidden="true" /></button></footer>
      </div>
    </dialog>
  </>
}
