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

  async function move(index: number, direction: -1 | 1) {
    const current = rows[index]
    const target = rows[index + direction]
    if (!target) return
    await run(async () => {
      await saveQuestion({ ...current, position: target.position })
      await saveQuestion({ ...target, position: current.position })
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
            onClick={() => setDraft({ ...EMPTY_DRAFT, position: rows.length })}
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
