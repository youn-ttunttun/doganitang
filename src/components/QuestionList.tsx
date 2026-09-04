import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { stageLabel, type Stage } from '../diagnostic'
import type { EditableQuestion } from '../lib/diagnosticStore'
import MathText from './MathText'

type Props = {
  rows: EditableQuestion[]
  busy?: boolean
  onEdit: (row: EditableQuestion) => void
  onDelete: (row: EditableQuestion) => void
  onMove: (index: number, direction: -1 | 1) => void
}

/** 문항 목록. 관리자 화면과 간이 편집기가 함께 씁니다. */
export default function QuestionList({ rows, busy = false, onEdit, onDelete, onMove }: Props) {
  return (
    <div className="app-list">
      {rows.map((row, index) => (
        <article className={`app-row ${row.active ? '' : 'is-off'}`} key={row.id}>
          <div className="app-row-main">
            <div className="app-row-top">
              <span className="app-kind">{row.type === 'choice' ? '객관식' : '단답형'}</span>
              <span className="app-dim">{stageLabel[row.stage as Stage]}</span>
              <span className="app-dim">{row.concept}</span>
              {!row.active && <span className="app-off">출제 안 함</span>}
            </div>

            <p className="app-prompt">
              {index + 1}. <MathText>{row.prompt}</MathText>
            </p>

            <p className="app-answer">
              정답 —{' '}
              {row.type === 'choice' ? (
                <MathText>{row.choices[row.answer ?? 0] ?? '(설정 안 됨)'}</MathText>
              ) : (
                row.accept.join(' 또는 ')
              )}
            </p>
          </div>

          <div className="app-row-actions">
            <button title="위로" disabled={index === 0 || busy} onClick={() => onMove(index, -1)}>
              <ArrowUp size={15} />
            </button>
            <button
              title="아래로"
              disabled={index === rows.length - 1 || busy}
              onClick={() => onMove(index, 1)}
            >
              <ArrowDown size={15} />
            </button>
            <button title="수정" onClick={() => onEdit(row)}>
              <Pencil size={15} />
            </button>
            <button
              title="삭제"
              className="is-danger"
              disabled={busy}
              onClick={() => onDelete(row)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
