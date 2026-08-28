import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, FileText, Loader2, RotateCcw } from 'lucide-react'
import { site } from '../content'
import { stageLabel, verdictFor } from '../diagnostic'
import {
  gradeAnswers,
  loadQuestions,
  type GradeResult,
  type PublicQuestion,
} from '../lib/diagnosticStore'

type Phase = 'intro' | 'quiz' | 'result'

export default function Diagnostic() {
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [source, setSource] = useState<'db' | 'local'>('local')
  const [loading, setLoading] = useState(true)

  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GradeResult | null>(null)
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    loadQuestions()
      .then(({ questions, source }) => {
        setQuestions(questions)
        setSource(source)
      })
      .finally(() => setLoading(false))
  }, [])

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
      const graded = await gradeAnswers(questions, answers, source)
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
              <h1 className="quiz-title">지금 어디서 막혔는지, 3분이면 알 수 있습니다</h1>
              <p className="quiz-lead">
                중등 기초부터 수능 과목까지 {questions.length}문항을 풀면, Pre과정부터 시작할지
                대수부터 시작할지 알려드립니다. 점수를 매겨 자르는 시험이 아니라 시작점을 정하기
                위한 테스트입니다.
              </p>

              <ul className="quiz-facts">
                <li>
                  <FileText size={16} aria-hidden="true" />
                  객관식 · 단답형 {questions.length}문항
                </li>
                <li>
                  <Clock size={16} aria-hidden="true" />약 3분 소요
                </li>
                <li>
                  <Check size={16} aria-hidden="true" />
                  가입도, 연락처도 없이 결과 확인
                </li>
              </ul>

              <button className="btn btn-primary btn-lg" onClick={() => setPhase('quiz')}>
                진단 시작하기
                <ArrowRight size={18} />
              </button>
              <p className="quiz-note">
                모르는 문항은 건너뛰어도 됩니다. 찍지 말고 넘어가야 정확합니다.
              </p>
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

              <div className="quiz-cta">
                <h2>이 결과로 상담받고 싶다면</h2>
                <p>
                  결과를 바탕으로 어떤 단원부터, 어떤 속도로 채워야 하는지 자세히 알려드립니다.
                  신청 폼에 진단 결과가 자동으로 담깁니다.
                </p>
                <div className="quiz-cta-actions">
                  <Link className="btn btn-primary btn-lg" to="/#apply">
                    진단 결과로 상담 신청
                    <ArrowRight size={18} />
                  </Link>
                  <button className="btn btn-ghost" onClick={restart}>
                    <RotateCcw size={16} />
                    다시 풀기
                  </button>
                </div>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  )
}
