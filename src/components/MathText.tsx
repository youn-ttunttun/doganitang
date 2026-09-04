import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * 수식이 섞인 문장을 화면에 그려 줍니다.
 *
 * 관리자 화면에서 문제를 적을 때 수식은 달러 기호 사이에 넣습니다.
 *   예) $\frac{1}{2}$ 은 얼마인가요?  →  ½ 모양으로 예쁘게 나옵니다.
 *
 * 달러 기호가 하나도 없으면 그냥 글자 그대로 나오니, 수식을 안 쓰는
 * 문제는 지금까지처럼 적으면 됩니다. 줄바꿈은 그대로 지켜집니다.
 */

type Piece = { kind: 'text' | 'math'; value: string }

/** '$...$' 를 기준으로 글자와 수식을 번갈아 잘라냅니다. */
export function splitMath(input: string): Piece[] {
  const pieces: Piece[] = []
  let rest = input
  // \$ 로 적으면 진짜 달러 기호로 취급합니다.
  const pattern = /(?<!\\)\$([^$]+?)(?<!\\)\$/

  for (;;) {
    const match = pattern.exec(rest)
    if (!match || match.index === undefined) break
    if (match.index > 0) pieces.push({ kind: 'text', value: rest.slice(0, match.index) })
    pieces.push({ kind: 'math', value: match[1] })
    rest = rest.slice(match.index + match[0].length)
  }

  if (rest !== '') pieces.push({ kind: 'text', value: rest })
  return pieces
}

function render(tex: string): string {
  try {
    // \displaystyle 를 붙여야 분수·시그마가 교과서처럼 큼직하게 나옵니다.
    return katex.renderToString(`\\displaystyle ${tex}`, {
      throwOnError: false,
      output: 'html',
    })
  } catch {
    // 수식이 잘못 적혀 있어도 화면이 깨지지는 않게, 적은 그대로 보여줍니다.
    return ''
  }
}

/** 줄바꿈을 살려서 글자를 그립니다. */
function Text({ value }: { value: string }) {
  const lines = value.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  )
}

export default function MathText({ children }: { children: string | undefined | null }) {
  const source = children ?? ''
  const pieces = useMemo(() => splitMath(source), [source])

  // 수식이 없으면 예전과 똑같이 글자만 그립니다.
  if (!pieces.some((p) => p.kind === 'math')) {
    return <Text value={source.replace(/\\\$/g, '$')} />
  }

  return (
    <>
      {pieces.map((piece, i) =>
        piece.kind === 'math' ? (
          <span
            key={i}
            className="math"
            // KaTeX 가 만든 수식 HTML 입니다. 관리자만 입력할 수 있습니다.
            dangerouslySetInnerHTML={{ __html: render(piece.value) || escapeHtml(`$${piece.value}$`) }}
          />
        ) : (
          <Text key={i} value={piece.value.replace(/\\\$/g, '$')} />
        ),
      )}
    </>
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
