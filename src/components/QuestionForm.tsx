import { Check, Loader2, Plus, X } from 'lucide-react'
import type { Stage } from '../diagnostic'
import type { QuestionDraft } from '../lib/diagnosticStore'
import MathText from './MathText'

/** 수식 입력이 처음인 분을 위한 예시. 누르면 문제칸 끝에 붙습니다. */
const MATH_SNIPPETS: { label: string; tex: string }[] = [
  { label: '분수', tex: '\\frac{1}{2}' },
  { label: '루트', tex: '\\sqrt{2}' },
  { label: '제곱', tex: 'x^2' },
  { label: '아래첨자', tex: 'a_1' },
  { label: '적분', tex: '\\int_0^1 x\\,dx' },
  { label: '시그마', tex: '\\sum_{k=1}^{n} k' },
  { label: '극한', tex: '\\lim_{x \\to 0}' },
  { label: '곱하기', tex: '\\times' },
  { label: '≤', tex: '\\leq' },
  { label: '≠', tex: '\\neq' },
]

export const EMPTY_DRAFT: QuestionDraft = {
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

export function isDraftValid(draft: QuestionDraft): boolean {
  if (draft.prompt.trim() === '') return false
  return draft.type === 'choice'
    ? draft.choices.filter((c) => c.trim() !== '').length >= 2 && draft.answer !== null
    : draft.accept.filter((a) => a.trim() !== '').length >= 1
}

type Props = {
  draft: QuestionDraft
  busy?: boolean
  onChange: (draft: QuestionDraft) => void
  onCancel: () => void
  onSave: () => void
}

/** 문항 추가·수정 모달. 관리자 화면과 간이 편집기가 함께 씁니다. */
export default function QuestionForm({ draft, busy = false, onChange, onCancel, onSave }: Props) {
  const set = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) =>
    onChange({ ...draft, [key]: value })

  const hasMath = [draft.prompt, ...draft.choices].some((text) => text.includes('$'))

  return (
    <div className="app-modal" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="app-modal-box">
        <div className="app-modal-head">
          <h2>{draft.id ? '문항 수정' : '문항 추가'}</h2>
          <button onClick={onCancel} aria-label="닫기">
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
              placeholder="$x^2 - 5x + 6$ 을 인수분해하면?"
            />
          </label>

          <div className="app-math-help">
            <p className="app-hint">
              수식은 <code>$</code> 와 <code>$</code> 사이에 적습니다. 예)
              <code>$\frac{'{'}1{'}'}{'{'}2{'}'}$ 보다 큰 수는?</code> — 아래 버튼을 누르면 문제칸
              끝에 붙습니다.
            </p>
            <div className="app-math-keys">
              {MATH_SNIPPETS.map((snippet) => (
                <button
                  type="button"
                  key={snippet.label}
                  onClick={() => set('prompt', `${draft.prompt}$${snippet.tex}$`)}
                  title={snippet.tex}
                >
                  {snippet.label}
                </button>
              ))}
            </div>
          </div>

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
                <span className="field-label">정답 — 인정할 표기를 쉼표로 구분해 적어주세요</span>
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

          {hasMath && (
            <div className="app-preview">
              <span className="field-label">미리보기 — 학생에게는 이렇게 보입니다</span>
              <p className="app-preview-prompt">
                <MathText>{draft.prompt}</MathText>
              </p>
              {draft.type === 'choice' && (
                <ol className="app-preview-choices">
                  {draft.choices.map((choice, i) => (
                    <li key={i}>
                      <MathText>{choice}</MathText>
                    </li>
                  ))}
                </ol>
              )}
            </div>
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
          <button className="btn btn-ghost" onClick={onCancel}>
            취소
          </button>
          <button className="btn btn-primary" disabled={!isDraftValid(draft) || busy} onClick={onSave}>
            {busy ? <Loader2 size={15} className="spin" /> : <Check size={15} />}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
