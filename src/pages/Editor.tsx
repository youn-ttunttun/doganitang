import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, KeyRound, Plus, RotateCcw, Upload } from 'lucide-react'
import { site } from '../content'
import QuestionForm, { EMPTY_DRAFT } from '../components/QuestionForm'
import QuestionList from '../components/QuestionList'
import {
  builtInAsEditable,
  loadQuestionFile,
  parseQuestionFile,
  type EditableQuestion,
  type QuestionDraft,
} from '../lib/diagnosticStore'

// 서버 없이 도는 편집기라 비밀번호는 브라우저 안에 있습니다.
// 뚫려도 남이 우리 사이트를 바꿀 수는 없습니다 — 반영하려면 저장소 권한이 필요합니다.
// 배포할 때 VITE_EDITOR_PASSCODE 로 바꿀 수 있습니다.
const PASSCODE = import.meta.env.VITE_EDITOR_PASSCODE || 'jindan3094-tangsu-yeonpil#'
const DRAFT_KEY = 'teamlesson:questions-draft'

export default function Editor() {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  const [rows, setRows] = useState<EditableQuestion[]>([])
  const [draft, setDraft] = useState<QuestionDraft | null>(null)
  const [note, setNote] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // 작업하던 내용을 브라우저에 임시 저장해 새로고침해도 날아가지 않게 합니다.
  useEffect(() => {
    if (!unlocked) return
    ;(async () => {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const parsed = parseQuestionFile(JSON.parse(saved))
          if (parsed) {
            setRows(parsed)
            setNote('저장해둔 편집 내용을 불러왔습니다.')
            return
          }
        }
      } catch {
        // 저장소를 못 쓰면 그냥 현재 문항으로 시작합니다.
      }
      setRows((await loadQuestionFile()) ?? builtInAsEditable())
    })()
  }, [unlocked])

  useEffect(() => {
    if (!unlocked || rows.length === 0) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rows))
    } catch {
      // 임시 저장이 안 돼도 편집 자체는 계속됩니다.
    }
  }, [rows, unlocked])

  function renumber(list: EditableQuestion[]): EditableQuestion[] {
    return list.map((row, index) => ({ ...row, position: index }))
  }

  function move(index: number, direction: -1 | 1) {
    setRows((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return renumber(next)
    })
  }

  function saveDraft() {
    if (!draft) return
    const cleaned = {
      ...draft,
      choices: draft.choices.filter((c) => c.trim() !== ''),
      accept: draft.accept.filter((a) => a.trim() !== ''),
    }

    setRows((prev) =>
      draft.id
        ? prev.map((row) => (row.id === draft.id ? ({ ...cleaned, id: draft.id } as EditableQuestion) : row))
        : renumber([...prev, { ...cleaned, id: `q-${Date.now()}` } as EditableQuestion]),
    )
    setDraft(null)
    setNote('')
  }

  function exportFile() {
    const blob = new Blob([JSON.stringify(renumber(rows), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'questions.json'
    link.click()
    URL.revokeObjectURL(url)
    setNote('questions.json 을 내려받았습니다. 저장소의 public/ 폴더에 올리면 사이트에 반영됩니다.')
  }

  async function importFile(file: File) {
    try {
      const parsed = parseQuestionFile(JSON.parse(await file.text()))
      if (!parsed) {
        setNote('이 파일은 문항 파일이 아닌 것 같습니다.')
        return
      }
      setRows(parsed)
      setNote(`${parsed.length}문항을 불러왔습니다.`)
    } catch {
      setNote('파일을 읽지 못했습니다.')
    }
  }

  if (!unlocked) {
    return (
      <div className="app-shell app-center">
        <form
          className="app-card"
          onSubmit={(e) => {
            e.preventDefault()
            if (input === PASSCODE) setUnlocked(true)
            else setWrong(true)
          }}
        >
          <Link className="app-brand" to="/">
            {site.name}
          </Link>
          <h1>문항 편집기</h1>

          <label className="field">
            <span className="field-label">비밀번호</span>
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setWrong(false)
              }}
              autoFocus
            />
          </label>

          {wrong && <p className="app-error">비밀번호가 맞지 않습니다.</p>}

          <button className="btn btn-primary btn-block">
            <KeyRound size={16} />
            들어가기
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-top">
        <div className="app-top-inner">
          <Link className="app-brand" to="/">
            {site.name}
            <em>문항 편집기</em>
          </Link>
        </div>
      </header>

      <main className="app-main">
        <div className="app-head">
          <h1>진단 문항 {rows.length}개</h1>
          <div className="app-head-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              <Upload size={15} />
              파일 불러오기
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (confirm('편집 내용을 버리고 기본 문항으로 되돌릴까요?')) {
                  setRows(builtInAsEditable())
                  setNote('기본 문항으로 되돌렸습니다.')
                }
              }}
            >
              <RotateCcw size={15} />
              되돌리기
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDraft({ ...EMPTY_DRAFT, position: rows.length })}>
              <Plus size={15} />
              문항 추가
            </button>
            <button className="btn btn-primary btn-sm" onClick={exportFile}>
              <Download size={15} />
              파일로 내보내기
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importFile(file)
            e.target.value = ''
          }}
        />

        <div className="app-card app-guide">
          <h2>반영하는 방법</h2>
          <ol className="app-steps">
            <li>여기서 문항을 고칩니다 <em>(브라우저에 자동 저장돼 새로고침해도 남습니다)</em></li>
            <li><b>파일로 내보내기</b>를 눌러 <code>questions.json</code> 을 받습니다</li>
            <li>
              저장소의{' '}
              <a
                href="https://github.com/youn-ttunttun/doganitang/upload/main/public"
                target="_blank"
                rel="noreferrer"
              >
                public 폴더
              </a>
              에 그 파일을 올립니다 <em>(끌어다 놓고 Commit)</em>
            </li>
            <li>1분 뒤 사이트의 진단 테스트에 반영됩니다</li>
          </ol>
        </div>

        {note && <p className="app-note app-note--ok">{note}</p>}

        <QuestionList
          rows={rows}
          onEdit={(row) => setDraft({ ...row })}
          onDelete={(row) => {
            if (confirm('이 문항을 삭제할까요?')) {
              setRows((prev) => renumber(prev.filter((r) => r.id !== row.id)))
            }
          }}
          onMove={move}
        />
      </main>

      {draft && (
        <QuestionForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={saveDraft}
        />
      )}
    </div>
  )
}
