import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import QuestionForm, { EMPTY_DRAFT } from '../../components/QuestionForm'
import QuestionList from '../../components/QuestionList'
import {
  deleteQuestion,
  listQuestionsForAdmin,
  saveQuestion,
  seedFromLocal,
  type EditableQuestion,
  type QuestionDraft,
} from '../../lib/diagnosticStore'

export default function AdminQuestions() {
  const [rows, setRows] = useState<EditableQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<QuestionDraft | null>(null)

  async function refresh() {
    try {
      setRows(await listQuestionsForAdmin())
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '문항을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    try {
      await action()
      await refresh()
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  // position 값을 서로 맞바꾸지 않고, 바뀐 화면 순서대로 0부터 다시 매깁니다.
  // 맞바꾸는 방식은 두 문항의 position 이 같으면 같은 값을 두 번 쓰는 셈이라
  // 아무것도 움직이지 않았습니다. (문항을 지운 뒤 새로 추가하면 값이 겹칩니다)
  // 다시 매기면 값이 겹쳐 있든 중간이 비어 있든 그 자리에서 바로잡힙니다.
  async function move(index: number, direction: -1 | 1) {
    const swapped = index + direction
    if (swapped < 0 || swapped >= rows.length) return

    const next = [...rows]
    ;[next[index], next[swapped]] = [next[swapped], next[index]]

    await run(async () => {
      for (const [order, row] of next.entries()) {
        if (row.position !== order) await saveQuestion({ ...row, position: order })
      }
    })
  }

  if (loading) {
    return (
      <p className="app-note">
        <Loader2 size={16} className="spin" /> 불러오는 중…
      </p>
    )
  }

  return (
    <>
      <div className="app-head">
        <h1>진단 문항 {rows.length}개</h1>
        <div className="app-head-actions">
          <Link className="btn btn-ghost btn-sm" to="/diagnostic" target="_blank">
            학생 화면으로 보기
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              // 중간 문항을 지운 적이 있으면 '개수'와 '마지막 position'이 어긋나
              // 이미 있는 문항과 같은 값이 됩니다. 그래서 개수가 아니라
              // 가장 큰 position 다음 번호를 씁니다.
              setDraft({
                ...EMPTY_DRAFT,
                position: rows.length ? Math.max(...rows.map((row) => row.position)) + 1 : 0,
              })
            }
          >
            <Plus size={15} />
            문항 추가
          </button>
        </div>
      </div>

      {error && <p className="app-error">{error}</p>}

      {rows.length === 0 && (
        <div className="app-card app-seed">
          <h2>등록된 문항이 없습니다</h2>
          <p>
            코드에 들어 있는 기본 문항 12개를 그대로 가져와 시작할 수 있습니다. 가져온 뒤
            자유롭게 고치면 됩니다.
          </p>
          <button className="btn btn-primary" disabled={busy} onClick={() => run(() => seedFromLocal())}>
            기본 문항 12개 가져오기
          </button>
        </div>
      )}

      <QuestionList
        rows={rows}
        busy={busy}
        onEdit={(row) => setDraft({ ...row })}
        onDelete={(row) => {
          if (confirm('이 문항을 삭제할까요?')) run(() => deleteQuestion(row.id))
        }}
        onMove={move}
      />

      {draft && (
        <QuestionForm
          draft={draft}
          busy={busy}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={() =>
            run(async () => {
              await saveQuestion({
                ...draft,
                choices: draft.choices.filter((c) => c.trim() !== ''),
                accept: draft.accept.filter((a) => a.trim() !== ''),
              })
              setDraft(null)
            })
          }
        />
      )}
    </>
  )
}
