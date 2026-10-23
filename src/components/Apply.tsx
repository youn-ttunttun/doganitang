import { useEffect, useState } from 'react'
import { Check, Copy, Instagram, Loader2, Send } from 'lucide-react'
import { useContent } from '../lib/siteContent'
import {
  buildDmText,
  isBackendReady,
  submitApplication,
  type ApplicationInput,
  type ApplicationKind,
} from '../lib/applications'
import Section from './Section'

const GRADES = ['고1', '고2', '고3', 'N수', '중등', '자퇴', '기타: 직장인, 만학도 등']
const COURSES = ['Pre (기초부터)', '대수', '미적분1', '아직 모르겠어요']

/** 어디서 보고 왔는지. 홍보를 어디에 더 쓸지 정하는 근거가 됩니다. */
const SOURCES = ['인스타그램', '지인 소개', '검색(네이버·구글)', '학교·학원', '기타']

const RECENT_GRADES = [
  '3등급', '4등급', '5등급',
  '6등급', '7등급', '8등급', '9등급', '아직 본 적 없어요',
]

const EMPTY: ApplicationInput = {
  kind: 'consult',
  name: '',
  contact: '',
  guardianContact: '',
  grade: '',
  course: '',
  level: '',
  message: '',
  source: '',
  recentGrade: '',
  birthYear: '',
  gender: '',
  recentExam: '',
  tuitionConfirmed: false,
  marketingSms: false, marketingEmail: false, marketingPhone: '', marketingEmailAddress: '',
}

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function Apply() {
  const { apply: applyCopy, site, consulting } = useContent()
  const [form, setForm] = useState<ApplicationInput>(EMPTY)

  // 진단 테스트를 풀고 넘어온 경우, 결과를 '현재 수학 상황'에 자동으로 채웁니다.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('teamlesson:diagnostic')
      const kind = sessionStorage.getItem('teamlesson:applyKind') as ApplicationKind | null
      if (saved || kind) {
        setForm((prev) => ({
          ...prev,
          kind: kind ?? 'diagnostic',
          level: saved ?? prev.level,
        }))
      }
    } catch {
      // 저장소 접근이 막혀 있으면 그냥 빈 폼으로 둡니다.
    }
  }, [])
  const [agreed, setAgreed] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)

  const set = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const filled = form.name.trim() && form.contact.trim() && form.grade && form.course && form.birthYear && form.level.trim() && form.source && (!GRADES.slice(0, 3).concat('중등').includes(form.grade) || form.guardianContact.trim())
  const canSubmit = Boolean(filled) && (!form.marketingSms || /^01[016789][0-9]{7,8}$/.test(form.marketingPhone.replace(/[- ]/g, ''))) && (!form.marketingEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.marketingEmailAddress)) && agreed && form.tuitionConfirmed && (Number(form.birthYear) < 2012 || (Number(form.birthYear) === 2012 && ageConfirmed)) && status !== 'sending'

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
                setAgeConfirmed(false)
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
                {
                  value: 'consult',
                  label: '수업 등록 상담',
                  desc: '무료 · 수업 일정과 시작점을 함께 정합니다',
                },
                {
                  value: 'diagnostic',
                  label: '진단 결과 상담',
                  desc: '무료 · 진단 테스트를 푼 뒤 결과를 함께 봅니다',
                },
                {
                  value: 'detail',
                  label: '정밀 상담',
                  desc: `${consulting.price || '유료'} · 화상으로 문항별로 짚어드립니다`,
                },
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

        <label className="field"><span className="field-label">이름 <em>필수</em></span>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="학생 이름 혹은 별명을 적어주세요." maxLength={40}  required />
        </label>
        <label className="field"><span className="field-label">상태 <em>필수</em></span><select value={form.grade} onChange={(e) => set('grade', e.target.value)} required><option value="">선택해주세요</option>{GRADES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">출생 연도 <em>필수</em></span><select value={form.birthYear} onChange={(e) => set('birthYear', e.target.value)} required><option value="">선택해주세요</option>{Array.from({ length: 77 }, (_, i) => String(2026 - i)).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">성별 (선택)</span><select value={form.gender} onChange={(e) => set('gender', e.target.value)} ><option value="">선택해주세요</option>{['여성', '남성', '공개하지 않음'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">희망 과목 <em>필수</em></span><select value={form.course} onChange={(e) => set('course', e.target.value)} required><option value="">선택해주세요</option>{COURSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">최근 모의고사 등급 (선택)</span><select value={form.recentGrade} onChange={(e) => set('recentGrade', e.target.value)} ><option value="">선택해주세요</option>{RECENT_GRADES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">최근 응시한 모의고사명/원점수 (선택)</span>
          <input type="text" value={form.recentExam} onChange={(e) => set('recentExam', e.target.value)} placeholder="예) 2026학년도 고2 9월 모의고사 / 30점대" maxLength={200}   />
        </label>
        <label className="field"><span className="field-label">현재 수학 상황 및 요청 사항 <em>필수</em></span>
          <textarea value={form.level} onChange={(e) => set('level', e.target.value)} placeholder="예) 중학교 때부터 놓았다가 두 달 전부터 동네 학원에서 OO 교재로 대수 지수로그 진도 나가고 있습니다." maxLength={500} rows={4} required />
        </label>
        <label className="field"><span className="field-label">학생 연락처 <em>필수</em></span>
          <input type="text" value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="전화번호, 카카오 ID, 인스타 아이디 등" maxLength={120}  required />
        </label>
        <label className="field"><span className="field-label">학부모 연락처 (중/고등학교 재학생 필수)</span><input type="text" value={form.guardianContact} onChange={(e) => set('guardianContact', e.target.value)} placeholder="학부모님 연락처를 남겨주세요" maxLength={120} required={['고1', '고2', '고3', '중등'].includes(form.grade)} /></label>
        <label className="field"><span className="field-label">어떻게 알고 오셨나요? <em>필수</em></span><select value={form.source} onChange={(e) => set('source', e.target.value)} required><option value="">선택해주세요</option>{SOURCES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="field"><span className="field-label">남기고 싶은 말 (선택)</span>
          <textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="추가로 전하실 내용이 있다면 적어주세요" maxLength={2000} rows={4}  />
        </label>
        {Number(form.birthYear) >= 2012 && <div className="agree"><span>만 14세 미만 학생은 법정대리인 동의 확인이 필요합니다. 보호자께서 <a href={site.instagram} target="_blank" rel="noreferrer">인스타그램 DM</a>으로 먼저 문의해주세요.</span></div>}
        {form.birthYear === '2012' && <label className="agree"><input type="checkbox" checked={ageConfirmed} onChange={e => setAgeConfirmed(e.target.checked)} required /><span>생일이 지나 만 14세 이상입니다.</span></label>}
        <label className="agree"><input type="checkbox" checked={form.tuitionConfirmed} onChange={(e) => set('tuitionConfirmed', e.target.checked)} required /><span>수업료 정보를 확인하셨습니까? (필수)</span></label>
        <label className="agree"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required /><span>개인정보 수집·이용에 동의합니다. (필수)</span></label>
        <div className="agree"><span>수집·이용자: 팀레슨. 목적: 상담 연락, 수업 안내 및 LMS에서의 신청 관리. 필수 항목: 이름 또는 별명, 상태, 출생 연도, 희망 과목, 현재 수학 상황 및 요청 사항, 학생 연락처, 유입 경로, 중·고등학교 재학생의 학부모 연락처. 선택 항목: 성별, 최근 모의고사 등급·시험명·원점수, 그 외 제공한 학부모 연락처와 남긴 말. 보유기간: 상담 종료 후 90일 이내 파기하며, 수업 등록 시 수강에 필요한 정보는 별도 안내 후 관리합니다. 동의를 거부할 수 있으나 신청서 접수는 제한됩니다. 선택 항목은 입력하지 않아도 신청할 수 있습니다.</span></div>

        <fieldset className="field"><legend className="field-label">광고성 정보 수신 및 이를 위한 개인정보 수집·이용 동의 (선택)</legend>
          <div className="agree"><span>팀레슨의 수업·강좌·이벤트 광고를 아래에서 선택한 연락처로 보내는 데 동의합니다. 수집 항목은 선택한 채널의 휴대전화번호 또는 이메일 주소이며, 상담 종료 후 90일 이내 또는 동의 철회 시까지 이용 후 파기합니다. 동의하지 않아도 상담·수업 신청에 불이익이 없습니다. 학부모 연락처는 광고에 사용하지 않습니다. 수신 거부는 수신 메시지의 안내 또는 <a href="mailto:soismoi12@snu.ac.kr">이메일</a>로 요청할 수 있습니다.</span></div>
          <label className="agree"><input type="checkbox" checked={form.marketingSms} onChange={e => { set('marketingSms', e.target.checked); if (!e.target.checked) set('marketingPhone', ''); }} /><span>SMS 광고성 정보 수신 및 휴대전화번호 수집·이용에 동의합니다. (선택)</span></label>
          {form.marketingSms && <label className="field"><span className="field-label">광고 수신용 본인 휴대전화번호</span><input type="text" inputMode="tel" autoComplete="tel" value={form.marketingPhone} onChange={e=>set('marketingPhone',e.target.value)} placeholder="본인 명의 휴대전화번호 (예: 01012345678)" maxLength={20} required /></label>}
          <label className="agree"><input type="checkbox" checked={form.marketingEmail} onChange={e => { set('marketingEmail', e.target.checked); if (!e.target.checked) set('marketingEmailAddress', ''); }} /><span>이메일 광고성 정보 수신 및 이메일 주소 수집·이용에 동의합니다. (선택)</span></label>
          {form.marketingEmail && <label className="field"><span className="field-label">광고 수신용 본인 이메일</span><input type="text" inputMode="email" autoComplete="email" value={form.marketingEmailAddress} onChange={e=>set('marketingEmailAddress',e.target.value)} placeholder="name@example.com" maxLength={254} required /></label>}
        </fieldset>

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
