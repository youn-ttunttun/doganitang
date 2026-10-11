import { useContent } from '../lib/siteContent'
import Section from './Section'

/** 글자가 상자를 넘지 않도록 띄어쓰기 기준으로 두 줄까지 나눕니다. */
function wrap(text: string, perLine = 9): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (line && (line + ' ' + word).length > perLine) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 2)
}

/**
 * 신청 뒤 진행 순서.
 *
 * 넓은 화면에서는 손으로 그린 도식처럼 화살표로 잇고, 좁은 화면에서는
 * 카드로 쌓습니다. SVG 는 자리를 미리 잡아야 해서 폭이 좁으면 글씨가
 * 읽을 수 없을 만큼 작아지기 때문입니다.
 */
export default function Process() {
  const { process } = useContent()
  if (process.steps.length === 0) return null

  const steps = process.steps.slice(0, 5)
  const endings = process.endings.filter((text) => text.trim() !== '').slice(0, 2)

  // ── 도식 자리 계산 ───────────────────────────────────────
  const W = 1000
  const H = endings.length > 0 ? 300 : 230
  const BOX_H = 60
  const GAP = 30
  const END_W = 160
  const mainRight = endings.length > 0 ? W - END_W - 90 : W - 10
  const boxW = Math.min(175, (mainRight - 10 - (steps.length - 1) * GAP) / steps.length)
  const rowY = endings.length > 0 ? 112 : 60
  const midY = rowY + BOX_H / 2
  const xOf = (i: number) => 10 + i * (boxW + GAP)

  const lastRight = xOf(steps.length - 1) + boxW
  const endX = W - END_W - 10

  return (
    <Section
      id="process"
      tone="muted"
      eyebrow={process.eyebrow || undefined}
      title={process.title || undefined}
      lead={process.lead || undefined}
    >
      <div className="flow-diagram" role="img" aria-label={
        `${steps.map((s) => s.title).join(' 다음 ')}${endings.length ? `, 그다음 ${endings.join(' 또는 ')}` : ''}`
      }>
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-faint)" />
            </marker>
          </defs>

          {/* 단계 사이 화살표 */}
          {steps.slice(0, -1).map((step, i) => (
            <line
              key={`arrow-${step.title}`}
              x1={xOf(i) + boxW + 4}
              y1={midY}
              x2={xOf(i + 1) - 6}
              y2={midY}
              stroke="var(--text-faint)"
              strokeWidth="2"
              markerEnd="url(#flow-arrow)"
            />
          ))}

          {/* 첫 단계에서 등록으로 바로 가는 지름길 */}
          {steps.length >= 3 && (
            <path
              d={`M ${xOf(0) + boxW / 2} ${rowY + BOX_H + 4}
                  C ${xOf(0) + boxW / 2} ${rowY + BOX_H + 70},
                    ${xOf(2) + boxW / 2} ${rowY + BOX_H + 70},
                    ${xOf(2) + boxW / 2} ${rowY + BOX_H + 8}`}
              fill="none"
              stroke="var(--text-faint)"
              strokeWidth="2"
              strokeDasharray="5 5"
              markerEnd="url(#flow-arrow)"
            />
          )}

          {/* 마지막에서 갈라지는 화살표 */}
          {endings.map((text, i) => {
            const y = endings.length === 1 ? midY : i === 0 ? 46 : H - 66
            return (
              <line
                key={`branch-${text}`}
                x1={lastRight + 4}
                y1={midY}
                x2={endX - 6}
                y2={y + 25}
                stroke="var(--text-faint)"
                strokeWidth="2"
                markerEnd="url(#flow-arrow)"
              />
            )
          })}

          {/* 단계 상자 */}
          {steps.map((step, i) => (
            <g key={step.title}>
              <rect
                x={xOf(i)} y={rowY} width={boxW} height={BOX_H} rx="14"
                fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.5"
              />
              {wrap(step.title).map((line, li, all) => (
                <text
                  key={line}
                  x={xOf(i) + boxW / 2}
                  y={rowY + BOX_H / 2 + (all.length === 1 ? 5 : li === 0 ? -4 : 14)}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="15"
                  fontWeight="700"
                >
                  {line}
                </text>
              ))}
            </g>
          ))}

          {/* 갈라진 끝 */}
          {endings.map((text, i) => {
            const y = endings.length === 1 ? rowY : i === 0 ? 21 : H - 91
            return (
              <g key={`end-${text}`}>
                <rect
                  x={endX} y={y} width={END_W} height={50} rx="25"
                  fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5"
                />
                <text
                  x={endX + END_W / 2} y={y + 31}
                  textAnchor="middle" fill="var(--brand)" fontSize="15" fontWeight="700"
                >
                  {text}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 좁은 화면용. 도식은 글씨가 너무 작아집니다. */}
      <ol className="flow">
        {steps.map((step, index) => (
          <li className="flow-step" key={step.title}>
            <span className="flow-num">{index + 1}</span>
            <h3 className="flow-title">{step.title}</h3>
            {step.desc && <p className="flow-desc">{step.desc}</p>}
          </li>
        ))}
      </ol>

      {endings.length > 0 && (
        <div className="flow-endings">
          {endings.map((text) => (
            <span className="flow-ending" key={text}>
              {text}
            </span>
          ))}
        </div>
      )}

      {process.note && <p className="flow-note">{process.note}</p>}
    </Section>
  )
}
