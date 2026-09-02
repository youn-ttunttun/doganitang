// ─────────────────────────────────────────────────────────────
// 무료 온라인 진단 테스트 · 문항 파일
//
// ⚠️ 아래 문항은 형식을 보여주기 위한 "초안"입니다.
//    실제 진단에 쓸 문항으로 바꿔주세요. 문항을 더하거나 빼도
//    채점·결과 판정은 자동으로 맞춰집니다.
//
// ── 객관식 문항 추가하는 법 ─────────────────────────────────
//   {
//     type: 'choice',
//     concept: '무엇을 보는 문항인지',   // 결과 화면에 '약한 개념'으로 표시됩니다
//     stage: 'middle',                   // 'middle' | 'high1' | 'high2'
//     prompt: '문제 지문을 여기에',
//     choices: ['보기1', '보기2', '보기3', '보기4'],
//     answer: 1,                         // 정답 위치 (첫 번째가 0)
//   },
//
// ── 단답형 문항 추가하는 법 ─────────────────────────────────
//   {
//     type: 'short',
//     concept: '무엇을 보는 문항인지',
//     stage: 'high1',
//     prompt: '문제 지문을 여기에',
//     placeholder: '숫자만 입력',        // 입력칸 안내문 (생략 가능)
//     accept: ['5/6', '5÷6'],            // 정답으로 인정할 표기를 모두 적습니다
//   }
//
//   단답형 채점은 공백·대소문자를 무시하고 비교합니다.
//   ('5 / 6' 이라고 써도 '5/6' 과 같은 것으로 봅니다)
//   학생마다 표기가 갈릴 만한 답은 accept 에 여러 개 적어두세요.
// ─────────────────────────────────────────────────────────────

export type Stage = 'middle' | 'high1' | 'high2'

type Base = {
  concept: string
  stage: Stage
  prompt: string
}

export type ChoiceQuestion = Base & {
  type: 'choice'
  choices: string[]
  answer: number
}

export type ShortQuestion = Base & {
  type: 'short'
  placeholder?: string
  accept: string[]
}

export type Question = ChoiceQuestion | ShortQuestion

/** 학생이 제출한 답. 객관식은 보기 번호, 단답형은 입력한 문자열. */
export type Answer = number | string | null

export const stageLabel: Record<Stage, string> = {
  middle: '중등 기초',
  high1: '고1 개념',
  high2: '수능 과목',
}

export const questions: Question[] = [
  {
    type: 'choice',
    concept: '분수의 덧셈',
    stage: 'middle',
    prompt: '1/2 + 1/3 의 값은?',
    choices: ['2/5', '5/6', '1/6', '2/6'],
    answer: 1,
  },
  {
    type: 'choice',
    concept: '지수법칙',
    stage: 'middle',
    prompt: '2³ × 2⁴ 을 간단히 하면?',
    choices: ['2⁷', '2¹²', '4⁷', '2¹'],
    answer: 0,
  },
  {
    type: 'short',
    concept: '일차방정식',
    stage: 'middle',
    prompt: '3x − 7 = 8 을 만족하는 x 의 값을 구하시오.',
    placeholder: '숫자만 입력',
    accept: ['5'],
  },
  {
    type: 'choice',
    concept: '인수분해',
    stage: 'middle',
    prompt: 'x² − 5x + 6 을 인수분해하면?',
    choices: ['(x−1)(x−6)', '(x+2)(x+3)', '(x−2)(x−3)', '(x−5)(x+6)'],
    answer: 2,
  },
  {
    type: 'short',
    concept: '연립방정식',
    stage: 'middle',
    prompt: 'x + y = 5, x − y = 1 일 때 x 의 값을 구하시오.',
    placeholder: '숫자만 입력',
    accept: ['3'],
  },
  {
    type: 'short',
    concept: '함수의 값',
    stage: 'high1',
    prompt: 'f(x) = 2x + 1 일 때 f(3) 의 값을 구하시오.',
    placeholder: '숫자만 입력',
    accept: ['7'],
  },
  {
    type: 'choice',
    concept: '일차함수의 기울기',
    stage: 'high1',
    prompt: '두 점 (1, 3) 과 (3, 7) 을 지나는 직선의 기울기는?',
    choices: ['1', '2', '3', '4'],
    answer: 1,
  },
  {
    type: 'choice',
    concept: '이차함수의 꼭짓점',
    stage: 'high1',
    prompt: 'y = (x − 2)² + 3 의 꼭짓점의 좌표는?',
    choices: ['(−2, 3)', '(2, 3)', '(2, −3)', '(3, 2)'],
    answer: 1,
  },
  {
    type: 'choice',
    concept: '절댓값 부등식',
    stage: 'high1',
    prompt: '|x − 1| < 3 의 해는?',
    choices: ['−2 < x < 4', 'x < 4', '−3 < x < 3', 'x > −2'],
    answer: 0,
  },
  {
    type: 'short',
    concept: '로그의 뜻',
    stage: 'high2',
    prompt: '2ˣ = 8 을 만족하는 x 의 값을 구하시오.',
    placeholder: '숫자만 입력',
    accept: ['3'],
  },
  {
    type: 'choice',
    concept: '삼각비',
    stage: 'high2',
    prompt: 'sin 30° 의 값은?',
    choices: ['1/2', '√2/2', '√3/2', '1'],
    answer: 0,
  },
  {
    type: 'short',
    concept: '등차수열',
    stage: 'high2',
    prompt: '첫째항이 3, 공차가 4인 등차수열의 제5항을 구하시오.',
    placeholder: '숫자만 입력',
    accept: ['19'],
  },
]

// ── 채점 ─────────────────────────────────────────────────────

/** 단답형 비교용 정리: 공백 제거, 소문자화, 전각문자·유니코드 기호를 보통 기호로 */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/[，,]/g, ',')
    .replace(/[（(]/g, '(')
    .replace(/[）)]/g, ')')
}

export function isCorrect(question: Question, answer: Answer): boolean {
  if (answer === null || answer === '') return false

  if (question.type === 'choice') {
    return answer === question.answer
  }

  if (typeof answer !== 'string') return false
  const given = normalize(answer)
  return question.accept.some((candidate) => normalize(candidate) === given)
}

// ── 결과 판정 ────────────────────────────────────────────────
// min 은 맞힌 비율(0~1)의 하한입니다. 문항 수를 바꿔도 그대로 동작합니다.
// 구간이나 문구를 조정하고 싶으면 아래 VERDICTS 를 고치면 됩니다.

export type Verdict = {
  code: string
  title: string
  body: string
  course: string
  tone: 'start' | 'mid' | 'ready'
  /**
   * Pre과정 대상인지.
   * false 면 Pre를 들을 필요가 없을 만큼 기초가 잡힌 경우로,
   * 결과 화면에서 정밀 상담 대신 다른 안내를 보여줍니다.
   */
  eligible: boolean
}

const VERDICTS: { min: number; verdict: Verdict }[] = [
  {
    min: 0.75,
    verdict: {
      code: 'READY',
      title: 'Pre과정을 듣기에는 이미 기초가 잡혀 있습니다',
      body: '중등수학과 고1 개념이 대체로 자리 잡혀 있습니다. Pre과정은 수학을 처음부터 다시 세워야 하는 학생을 위한 과정이라, 지금 상태에서는 시간이 아깝습니다. 대수나 미적분1부터 바로 들어가는 편이 맞습니다.',
      course: '대수 · 미적분1',
      tone: 'ready',
      eligible: false,
    },
  },
  {
    min: 0.45,
    verdict: {
      code: 'MID',
      title: 'Pre과정 일부를 채우고 대수로 넘어가면 됩니다',
      body: '기초가 아주 없지는 않지만, 고1 개념에서 빈틈이 보입니다. 이 상태로 대수에 들어가면 중간부터 다시 막힙니다. 중등수학 전체를 다시 볼 필요는 없고, 무너진 단원만 Pre과정으로 짧게 채운 뒤 넘어가는 편이 결과적으로 빠릅니다.',
      course: 'Pre (일부) → 대수',
      tone: 'mid',
      eligible: true,
    },
  },
  {
    min: 0,
    verdict: {
      code: 'START',
      title: 'Pre과정부터 시작하는 것을 권합니다',
      body: '지금 대수나 미적분1을 바로 들어가면 첫 주부터 막힙니다. 중등수학의 핵심 개념을 먼저 채우는 Pre과정부터 시작하는 편이 결과적으로 훨씬 빠릅니다. 여기서 시작한 학생이 가장 많고, 그러라고 만든 과정입니다.',
      course: 'Pre과정',
      tone: 'start',
      eligible: true,
    },
  },
]

/** 맞힌 비율(0~1)로 결과 문구를 고릅니다. */
export function verdictFor(ratio: number): Verdict {
  return (VERDICTS.find((v) => ratio >= v.min) ?? VERDICTS[VERDICTS.length - 1]).verdict
}

export function gradeDiagnostic(answers: Answer[]): {
  correct: number
  total: number
  ratio: number
  verdict: Verdict
  weakConcepts: string[]
} {
  const total = questions.length
  let correct = 0
  const weakConcepts: string[] = []

  questions.forEach((question, index) => {
    if (isCorrect(question, answers[index] ?? null)) correct += 1
    else weakConcepts.push(question.concept)
  })

  const ratio = total === 0 ? 0 : correct / total

  return { correct, total, ratio, verdict: verdictFor(ratio), weakConcepts }
}
