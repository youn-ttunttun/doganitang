import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, FileText, RotateCcw } from 'lucide-react'
import { site } from '../content'
import {
  gradeDiagnostic,
  isCorrect,
  questions,
  stageLabel,
  type Answer,
} from '../diagnostic'

type Phase = 'intro' | 'quiz' | 'result'

export default function Diagnostic() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => null))

  const question = questions[index]
  const answered = answers.filter((a) => a !== null && a !== '').length
  const result = useMemo(() => gradeDiagnostic(answers), [answers])

  function setAnswer(value: Answer) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function finish() {
    const graded = gradeDiagnostic(answers)
    // 상담 신청 폼에서 결과를 자동으로 채워 넣기 위해 잠시 저장해둡니다.
    try {
      sessionStorage.setItem(
        'teamlesson:diagnostic',
        `진단 결과 ${graded.correct}/${graded.total} · 추천 시작점: ${graded.verdict.course}`,
      )
    } catch {
      // 시크릿 모드 등에서 저장이 막힐 수 있습니다. 결과 화면은 그대로 보입니다.
    }
    setPhase('result')
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

      {phase === 'intro' && (
        <main className="quiz-inner quiz-intro">
          <p className="eyebrow">Free Diagnostic</p>
          <h1 className="quiz-title">지금 어디서 막혔는지, 3분이면 알 수 있습니다</h1>
          <p className="quiz-lead">
            중등 기초부터 수능 과목까지 {questions.length}문항을 풀면, Pre과정부터 시작할지 대수부터
            시작할지 알려드립니다. 점수를 매겨 자르는 시험이 아니라 시작점을 정하기 위한
            테스트입니다.
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
          <p className="quiz-note">모르는 문항은 건너뛰어도 됩니다. 찍지 말고 넘어가야 정확합니다.</p>
        </main>
      )}

      {phase === 'quiz' && (
        <main className="quiz-inner">
          <div className="quiz-progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}>
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
                    key={choice}
                    className={`quiz-choice ${answers[index] === i ? 'is-picked' : ''}`}
                    onClick={() => setAnswer(i)}
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
                inputMode="text"
                value={typeof answers[index] === 'string' ? (answers[index] as string) : ''}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={question.placeholder ?? '답을 입력하세요'}
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
              <button className="btn btn-primary" onClick={finish}>
                결과 보기
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <button className="quiz-skip" onClick={finish}>
            여기서 그만 풀고 결과 보기 ({answered}문항 응답)
          </button>
        </main>
      )}

      {phase === 'result' && (
        <main className="quiz-inner quiz-result">
          <p className="eyebrow">Result</p>
          <div className={`quiz-score quiz-score--${result.verdict.tone}`}>
            <strong>
              {result.correct}
              <small>/ {result.total}</small>
            </strong>
            <span>{result.verdict.course}부터 시작</span>
          </div>

          <h1 className="quiz-title">{result.verdict.title}</h1>
          <p className="quiz-lead">{result.verdict.body}</p>

          {result.weakConcepts.length > 0 && (
            <div className="quiz-weak">
              <h2>맞히지 못한 개념</h2>
              <ul>
                {result.weakConcepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="quiz-review">
            <h2>문항별 결과</h2>
            <ol>
              {questions.map((q, i) => {
                const given = answers[i] ?? null
                // 안 푼 문항과 틀린 문항을 구분해서 보여줍니다.
                const skipped = given === null || given === ''
                const ok = isCorrect(q, given)
                return (
                  <li key={q.prompt} className={ok ? 'is-ok' : skipped ? 'is-skip' : 'is-no'}>
                    <span className="quiz-review-num">{i + 1}</span>
                    <span className="quiz-review-concept">{q.concept}</span>
                    <span className="quiz-review-mark">
                      {ok ? '정답' : skipped ? '미응답' : '오답'}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="quiz-cta">
            <h2>이 결과로 상담받고 싶다면</h2>
            <p>
              결과를 바탕으로 어떤 단원부터, 어떤 속도로 채워야 하는지 자세히 알려드립니다. 신청
              폼에 진단 결과가 자동으로 담깁니다.
            </p>
            <div className="quiz-cta-actions">
              <Link className="btn btn-primary btn-lg" to="/#apply">
                진단 결과로 상담 신청
                <ArrowRight size={18} />
              </Link>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setAnswers(questions.map(() => null))
                  setIndex(0)
                  setPhase('intro')
                  window.scrollTo(0, 0)
                }}
              >
                <RotateCcw size={16} />
                다시 풀기
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
