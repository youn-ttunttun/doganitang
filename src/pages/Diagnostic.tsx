import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, FileText, Loader2, RotateCcw } from 'lucide-react'
import { consulting, diagnosticInfo, site } from '../content'
import { stageLabel, verdictFor } from '../diagnostic'
import { gradeAnswers, loadQuestions, type GradeResult, type LoadedQuestions } from '../lib/diagnosticStore'

type Phase = 'intro' | 'quiz' | 'result'

export default function Diagnostic() {
  const [loaded, setLoaded] = useState<LoadedQuestions | null>(null)
  const [loading, setLoading] = useState(true)

  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GradeResult | null>(null)
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    loadQuestions()
      .then(setLoaded)
      .finally(() => setLoading(false))
  }, [])

  const questions = loaded?.questions ?? []

  const question = questions[index]
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '') !== '').length
  const verdict = useMemo(() => (result ? verdictFor(result.ratio) : null), [result])
  const weakConcepts = useMemo(
    () => (result ? result.details.filter((d) => d.state !== 'correct').map((d) => d.concept) : []),
    [result],
  )

  function setAnswer(value: string) {
    if (!question) return
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  async function finish() {
    setGrading(true)
    try {
      const graded = await gradeAnswers(loaded!, answers)
      setResult(graded)

      // 상담 신청 폼에 결과를 자동으로 채워 넣기 위해 잠시 저장해둡니다.
      try {
        sessionStorage.setItem(
          'teamlesson:diagnostic',
          `진단 결과 ${graded.correct}/${graded.total} · 추천 시작점: ${verdictFor(graded.ratio).course}`,
        )
      } catch {
        // 시크릿 모드 등에서 저장이 막힐 수 있습니다. 결과 화면은 그대로 보입니다.
      }

      setPhase('result')
      window.scrollTo(0, 0)
    } finally {
      setGrading(false)
    }
  }

  function restart() {
    setAnswers({})
    setResult(null)
    setIndex(0)
    setPhase('intro')
    window.scrollTo(0, 0)
  }

  return (
    <div className="quiz-page">
      <header className="quiz-top">
        <Link className="quiz-back" to="/">
          <ArrowLeft size={16} />
          {site.name}
        </Link>
        {phase === 'quiz' && (
          <span className="quiz-count">
            {index + 1} / {questions.length}
          </span>
        )}
      </header>

      {loading ? (
        <main className="quiz-inner">
          <p className="app-note">
            <Loader2 size={16} className="spin" /> 문항을 불러오는 중…
          </p>
        </main>
      ) : questions.length === 0 ? (
        <main className="quiz-inner">
          <h1 className="quiz-title">아직 준비된 문항이 없습니다</h1>
          <p className="quiz-lead">
            진단 테스트를 준비 중입니다. 그동안은 인스타그램 DM으로 문의해주세요.
          </p>
          <a className="btn btn-primary" href={site.instagram} target="_blank" rel="noreferrer">
            {site.instagramHandle} 로 문의하기
          </a>
        </main>
      ) : (
        <>
          {phase === 'intro' && (
            <main className="quiz-inner quiz-intro">
              <p className="eyebrow">Free Diagnostic</p>
              <h1 className="quiz-title">{diagnosticInfo.title}</h1>
              <p className="quiz-lead">{diagnosticInfo.lead}</p>

              <ul className="quiz-facts">
                <li>
                  <FileText size={16} aria-hidden="true" />
                  객관식 · 단답형 {questions.length}문항
                </li>
                <li>
                  <Clock size={16} aria-hidden="true" />
                  {diagnosticInfo.duration} 소요
                </li>
                {diagnosticInfo.facts.map((fact) => (
                  <li key={fact}>
                    <Check size={16} aria-hidden="true" />
                    {fact}
                  </li>
                ))}
              </ul>

              <button className="btn btn-primary btn-lg" onClick={() => setPhase('quiz')}>
                진단 시작하기
                <ArrowRight size={18} />
              </button>
              <p className="quiz-note">{diagnosticInfo.note}</p>
            </main>
          )}

          {phase === 'quiz' && question && (
            <main className="quiz-inner">
              <div
                className="quiz-progress"
                role="progressbar"
                aria-valuenow={index + 1}
                aria-valuemin={1}
                aria-valuemax={questions.length}
              >
                <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="quiz-card">
                <div className="quiz-meta">
                  <span className="quiz-stage">{stageLabel[question.stage]}</span>
                  <span className="quiz-concept">{question.concept}</span>
                </div>

                <p className="quiz-prompt">{question.prompt}</p>

                {question.type === 'choice' ? (
                  <div className="quiz-choices">
                    {question.choices.map((choice, i) => (
                      <button
                        key={`${question.id}-${i}`}
                        className={`quiz-choice ${answers[question.id] === String(i) ? 'is-picked' : ''}`}
                        onClick={() => setAnswer(String(i))}
                      >
                        <span className="quiz-choice-num">{i + 1}</span>
                        {choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    className="quiz-short"
                    type="text"
                    value={answers[question.id] ?? ''}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={question.placeholder || '답을 입력하세요'}
                    autoFocus
                  />
                )}
              </div>

              <div className="quiz-nav">
                <button
                  className="btn btn-ghost"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  <ArrowLeft size={16} />
                  이전
                </button>

                {index < questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setIndex((i) => i + 1)}>
                    다음
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={finish} disabled={grading}>
                    {grading ? <Loader2 size={16} className="spin" /> : null}
                    결과 보기
                    {!grading && <ArrowRight size={16} />}
                  </button>
                )}
              </div>

              <button className="quiz-skip" onClick={finish} disabled={grading}>
                여기서 그만 풀고 결과 보기 ({answeredCount}문항 응답)
              </button>
            </main>
          )}

          {phase === 'result' && result && verdict && (
            <main className="quiz-inner quiz-result">
              <p className="eyebrow">Result</p>
              <div className={`quiz-score quiz-score--${verdict.tone}`}>
                <strong>
                  {result.correct}
                  <small>/ {result.total}</small>
                </strong>
                <span>{verdict.course}부터 시작</span>
              </div>

              <h1 className="quiz-title">{verdict.title}</h1>
              <p className="quiz-lead">{verdict.body}</p>

              {weakConcepts.length > 0 && (
                <div className="quiz-weak">
                  <h2>맞히지 못한 개념</h2>
                  <ul>
                    {weakConcepts.map((concept, i) => (
                      <li key={`${concept}-${i}`}>{concept}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="quiz-review">
                <h2>문항별 결과</h2>
                <ol>
                  {result.details.map((detail, i) => (
                    <li
                      key={detail.id}
                      className={
                        detail.state === 'correct'
                          ? 'is-ok'
                          : detail.state === 'skipped'
                            ? 'is-skip'
                            : 'is-no'
                      }
                    >
                      <span className="quiz-review-num">{i + 1}</span>
                      <span className="quiz-review-concept">{detail.concept}</span>
                      <span className="quiz-review-mark">
                        {detail.state === 'correct'
                          ? '정답'
                          : detail.state === 'skipped'
                            ? '미응답'
                            : '오답'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {verdict.eligible ? (
                <p className="quiz-scope">
                  여기까지가 무료로 확인할 수 있는 결과입니다. 지금 어느 수준인지는 알 수
                  있지만, 무엇이 왜 무너졌고 어디부터 손대야 하는지는 답안을 하나씩 들여다봐야
                  알 수 있습니다.
                </p>
              ) : (
                <p className="quiz-scope">
                  Pre과정은 수학을 처음부터 다시 세워야 하는 학생을 위한 과정이라, 지금
                  상태에서는 권해드리지 않습니다. 대수나 미적분1부터 시작하는 쪽이 맞고, 그
                  부분은 상담으로 함께 정하면 됩니다.
                </p>
              )}

              {verdict.eligible && consulting.title && (
                <div className="quiz-upsell">
                  <span className="quiz-upsell-badge">{consulting.badge}</span>
                  <h2>{consulting.title}</h2>
                  <p>{consulting.desc}</p>

                  {consulting.features.length > 0 && (
                    <ul className="quiz-upsell-list">
                      {consulting.features.map((feature) => (
                        <li key={feature}>
                          <Check size={15} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="quiz-upsell-price">
                    {consulting.price ? (
                      <>
                        <strong>{consulting.price}</strong>
                        {consulting.unit && <span>{consulting.unit}</span>}
                      </>
                    ) : (
                      <span>금액은 신청 후 안내드립니다</span>
                    )}
                  </p>

                  <Link
                    className="btn btn-primary btn-lg btn-block"
                    to="/#apply"
                    onClick={() => {
                      try {
                        sessionStorage.setItem('teamlesson:applyKind', 'detail')
                      } catch {
                        // 저장이 막혀도 신청 폼에서 직접 고를 수 있습니다.
                      }
                    }}
                  >
                    {consulting.cta}
                    <ArrowRight size={18} />
                  </Link>

                  {consulting.note && <p className="quiz-upsell-note">{consulting.note}</p>}
                </div>
              )}

              <div className="quiz-cta-actions quiz-cta-actions--plain">
                <Link
                  className={`btn ${verdict.eligible ? 'btn-ghost' : 'btn-primary btn-lg'}`}
                  to="/#apply"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('teamlesson:applyKind', 'consult')
                    } catch {
                      // 무시해도 됩니다.
                    }
                  }}
                >
                  {verdict.eligible ? '수업 등록만 상담하기' : '대수·미적분1 수업 상담받기'}
                </Link>
                <button className="btn btn-ghost" onClick={restart}>
                  <RotateCcw size={16} />
                  다시 풀기
                </button>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  )
}
