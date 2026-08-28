import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { stageLabel, type Stage } from '../../diagnostic'
import {
  deleteQuestion,
  listQuestionsForAdmin,
  saveQuestion,
  seedFromLocal,
  type AdminQuestion,
  type QuestionDraft,
} from '../../lib/diagnosticStore'

const EMPTY: QuestionDraft = {
  position: 0,
  active: true,
  type: 'choice',
  concept: '',
  stage: 'middle',
  prompt: '',
  choices: ['', '', '', ''],
  placeholder: '',
  answer: 0,
  accept: [],
}

export default function AdminQuestions() {
  const [rows, setRows] = useState<AdminQuestion[]>([])
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

  function set<K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

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
    const target = rows[index + direction]
    const current = rows[index]
    if (!target) return
    await run(async () => {
      await saveQuestion({ ...current, position: target.position })
      await saveQuestion({ ...target, position: current.position })
    })
  }

  const valid =
    draft &&
    draft.prompt.trim() !== '' &&
    (draft.type === 'choice'
      ? draft.choices.filter((c) => c.trim() !== '').length >= 2 && draft.answer !== null
      : draft.accept.filter((a) => a.trim() !== '').length >= 1)

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
            onClick={() => setDraft({ ...EMPTY, position: rows.length })}
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
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => run(() => seedFromLocal())}
          >
            기본 문항 12개 가져오기
          </button>
        </div>
      )}

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
                {index + 1}. {row.prompt}
              </p>

              <p className="app-answer">
                정답 —{' '}
                {row.type === 'choice'
                  ? row.choices[row.answer ?? 0] ?? '(설정 안 됨)'
                  : row.accept.join(' 또는 ')}
              </p>
            </div>

            <div className="app-row-actions">
              <button title="위로" disabled={index === 0 || busy} onClick={() => move(index, -1)}>
                <ArrowUp size={15} />
              </button>
              <button
                title="아래로"
                disabled={index === rows.length - 1 || busy}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={15} />
              </button>
              <button title="수정" onClick={() => setDraft({ ...row })}>
                <Pencil size={15} />
              </button>
              <button
                title="삭제"
                className="is-danger"
                disabled={busy}
                onClick={() => {
                  if (confirm('이 문항을 삭제할까요?')) run(() => deleteQuestion(row.id))
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {draft && (
        <div className="app-modal" onClick={(e) => e.target === e.currentTarget && setDraft(null)}>
          <div className="app-modal-box">
            <div className="app-modal-head">
              <h2>{draft.id ? '문항 수정' : '문항 추가'}</h2>
              <button onClick={() => setDraft(null)} aria-label="닫기">
                <X size={18} />
              </button>
            </div>

            <div className="app-modal-body">
              <div className="field-row">
                <label className="field">
                  <span className="field-label">유형</span>
                  <select
                    value={draft.type}
                    onChange={(e) => set('type', e.target.value as 'choice' | 'short')}
                  >
                    <option value="choice">객관식</option>
                    <option value="short">단답형</option>
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">난이도 구간</span>
                  <select value={draft.stage} onChange={(e) => set('stage', e.target.value as Stage)}>
                    <option value="middle">중등 기초</option>
                    <option value="high1">고1 개념</option>
                    <option value="high2">수능 과목</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span className="field-label">개념 이름 (결과 화면에 표시)</span>
                <input
                  value={draft.concept}
                  onChange={(e) => set('concept', e.target.value)}
                  placeholder="예) 인수분해"
                />
              </label>

              <label className="field">
                <span className="field-label">문제</span>
                <textarea
                  rows={3}
                  value={draft.prompt}
                  onChange={(e) => set('prompt', e.target.value)}
                  placeholder="x² − 5x + 6 을 인수분해하면?"
                />
              </label>

              {draft.type === 'choice' ? (
                <div className="field">
                  <span className="field-label">보기 — 정답인 보기를 눌러 선택하세요</span>
                  {draft.choices.map((choice, i) => (
                    <div className="app-choice-row" key={i}>
                      <button
                        type="button"
                        className={`app-pick ${draft.answer === i ? 'is-on' : ''}`}
                        onClick={() => set('answer', i)}
                        title="정답으로 지정"
                      >
                        <Check size={14} />
                      </button>
                      <input
                        value={choice}
                        onChange={(e) =>
                          set(
                            'choices',
                            draft.choices.map((c, j) => (j === i ? e.target.value : c)),
                          )
                        }
                        placeholder={`보기 ${i + 1}`}
                      />
                      <button
                        type="button"
                        className="app-choice-del"
                        onClick={() =>
                          set(
                            'choices',
                            draft.choices.filter((_, j) => j !== i),
                          )
                        }
                        disabled={draft.choices.length <= 2}
                        title="보기 삭제"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => set('choices', [...draft.choices, ''])}
                  >
                    <Plus size={14} />
                    보기 추가
                  </button>
                </div>
              ) : (
                <>
                  <label className="field">
                    <span className="field-label">
                      정답 — 인정할 표기를 쉼표로 구분해 적어주세요
                    </span>
                    <input
                      value={draft.accept.join(', ')}
                      onChange={(e) =>
                        set(
                          'accept',
                          e.target.value.split(',').map((v) => v.trim()),
                        )
                      }
                      placeholder="5/6, 5÷6"
                    />
                  </label>
                  <p className="app-hint">
                    공백과 대소문자는 알아서 무시합니다. (<code>5 / 6</code> = <code>5/6</code>)
                  </p>

                  <label className="field">
                    <span className="field-label">입력칸 안내문 (선택)</span>
                    <input
                      value={draft.placeholder}
                      onChange={(e) => set('placeholder', e.target.value)}
                      placeholder="숫자만 입력"
                    />
                  </label>
                </>
              )}

              <label className="app-toggle">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => set('active', e.target.checked)}
                />
                <span>학생에게 출제하기</span>
              </label>
            </div>

            <div className="app-modal-foot">
              <button className="btn btn-ghost" onClick={() => setDraft(null)}>
                취소
              </button>
              <button
                className="btn btn-primary"
                disabled={!valid || busy}
                onClick={() =>
                  run(async () => {
                    await saveQuestion({
                      ...draft,
                      choices: draft.choices.filter((c) => c.trim() !== ''),
                      accept: draft.accept.filter((a) => a.trim() !== ''),
                    })
                    setDraft(null)
                  })
                }
              >
                {busy ? <Loader2 size={15} className="spin" /> : <Check size={15} />}
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
