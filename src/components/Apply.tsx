import { useEffect, useState } from 'react'
import { Check, Copy, Instagram, Loader2, Send } from 'lucide-react'
import { apply as applyCopy, site } from '../content'
import {
  buildDmText,
  isBackendReady,
  submitApplication,
  type ApplicationInput,
  type ApplicationKind,
} from '../lib/applications'
import Section from './Section'

const GRADES = ['고1', '고2', '고3', 'N수', '중등']
const COURSES = ['Pre (기초부터)', '대수', '미적분1', '아직 모르겠어요']

const EMPTY: ApplicationInput = {
  kind: 'consult',
  name: '',
  contact: '',
  grade: '',
  course: '',
  level: '',
  message: '',
}

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function Apply() {
  const [form, setForm] = useState<ApplicationInput>(EMPTY)

  // 진단 테스트를 풀고 넘어온 경우, 결과를 '현재 수학 상황'에 자동으로 채웁니다.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('teamlesson:diagnostic')
      if (saved) setForm((prev) => ({ ...prev, kind: 'diagnostic', level: saved }))
    } catch {
      // 저장소 접근이 막혀 있으면 그냥 빈 폼으로 둡니다.
    }
  }, [])
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)

  const set = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const filled = form.name.trim() && form.contact.trim() && form.grade && form.course
  const canSubmit = Boolean(filled) && agreed && status !== 'sending'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    // 백엔드 연결 전에는 신청 내용을 정리해 인스타 DM으로 보내도록 안내합니다.
    if (!isBackendReady) {
      setStatus('done')
      return
    }

    setStatus('sending')
    try {
      await submitApplication({ ...form, name: form.name.trim(), contact: form.contact.trim() })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  async function copyDmText() {
    try {
      await navigator.clipboard.writeText(buildDmText(form))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (status === 'done') {
    return (
      <Section id="apply" tone="dark">
        <div className="apply-done">
          <div className="apply-done-icon" aria-hidden="true">
            <Check size={28} />
          </div>

          {isBackendReady ? (
            <>
              <h2>신청이 접수되었습니다</h2>
              <p>
                {form.name}님, 감사합니다. 남겨주신 연락처로 순서대로 연락드리겠습니다.
                <br />
                급하시면 인스타그램 DM으로 편하게 문의해주세요.
              </p>
            </>
          ) : (
            <>
              <h2>거의 다 됐습니다</h2>
              <p>
                아래 내용을 복사해 인스타그램 DM으로 보내주시면 접수됩니다.
                <br />
                순서대로 확인하고 연락드리겠습니다.
              </p>
              <pre className="apply-dm">{buildDmText(form)}</pre>
              <button type="button" className="btn btn-ghost" onClick={copyDmText}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '복사했습니다' : '내용 복사하기'}
              </button>
            </>
          )}

          <div className="apply-done-actions">
            <a className="btn btn-primary" href={site.instagram} target="_blank" rel="noreferrer">
              <Instagram size={16} />
              인스타그램 DM 열기
            </a>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setForm(EMPTY)
                setAgreed(false)
                setStatus('idle')
              }}
            >
              다시 작성하기
            </button>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      id="apply"
      tone="dark"
      eyebrow={applyCopy.eyebrow}
      title={applyCopy.title}
      lead={applyCopy.sub}
    >
      <form className="apply-form" onSubmit={handleSubmit}>
        <fieldset className="field field--kind">
          <legend>무엇을 신청하시나요?</legend>
          <div className="kind-options">
            {(
              [
                { value: 'consult', label: '수업 등록 상담', desc: '수업 일정과 시작점을 함께 정합니다' },
                { value: 'diagnostic', label: '진단 테스트', desc: '지금 어디서 막히는지 먼저 확인합니다' },
              ] as { value: ApplicationKind; label: string; desc: string }[]
            ).map((option) => (
              <label
                key={option.value}
                className={`kind-option ${form.kind === option.value ? 'is-active' : ''}`}
              >
                <input
                  type="radio"
                  name="kind"
                  value={option.value}
                  checked={form.kind === option.value}
                  onChange={() => set('kind', option.value)}
                />
                <span className="kind-label">{option.label}</span>
                <span className="kind-desc">{option.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span className="field-label">
              이름 <em>필수</em>
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="학생 이름"
              maxLength={40}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">
              연락처 <em>필수</em>
            </span>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => set('contact', e.target.value)}
              placeholder="전화번호, 카카오 ID, 인스타 아이디 등"
              maxLength={120}
              required
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field-label">
              학년 <em>필수</em>
            </span>
            <select value={form.grade} onChange={(e) => set('grade', e.target.value)} required>
              <option value="">선택해주세요</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">
              희망 과목 <em>필수</em>
            </span>
            <select value={form.course} onChange={(e) => set('course', e.target.value)} required>
              <option value="">선택해주세요</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">현재 수학 상황 (선택)</span>
          <input
            type="text"
            value={form.level}
            onChange={(e) => set('level', e.target.value)}
            placeholder="예) 최근 모의고사 7등급, 중학교 때부터 손 놓았어요"
            maxLength={500}
          />
        </label>

        <label className="field">
          <span className="field-label">남기고 싶은 말 (선택)</span>
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="궁금한 점이나 원하는 수업 일정을 자유롭게 적어주세요"
            rows={4}
            maxLength={2000}
          />
        </label>

        <label className="agree">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            상담 연락을 위해 입력한 정보를 수집·이용하는 데 동의합니다. 상담이 끝나면 파기됩니다.
          </span>
        </label>

        {status === 'error' && (
          <p className="apply-error">
            전송에 실패했습니다. 잠시 후 다시 시도하시거나{' '}
            <a href={site.instagram} target="_blank" rel="noreferrer">
              인스타그램 DM
            </a>
            으로 문의해주세요.
          </p>
        )}

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!canSubmit}>
          {status === 'sending' ? (
            <>
              <Loader2 size={18} className="spin" />
              보내는 중…
            </>
          ) : (
            <>
              <Send size={18} />
              신청서 보내기
            </>
          )}
        </button>
      </form>
    </Section>
  )
}
