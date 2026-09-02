import { questions as builtInQuestions, isCorrect, type Question, type Stage } from '../diagnostic'
import { getClient, isBackendReady } from './supabase'

/** 학생 화면에 내려가는 문항 (정답 없음) */
export type PublicQuestion = {
  id: string
  type: 'choice' | 'short'
  concept: string
  stage: Stage
  prompt: string
  choices: string[]
  placeholder: string
}

/** 편집 화면에서 다루는 문항 (정답 포함) */
export type EditableQuestion = PublicQuestion & {
  position: number
  active: boolean
  answer: number | null
  accept: string[]
}

export type GradeState = 'correct' | 'wrong' | 'skipped'

export type GradeResult = {
  total: number
  correct: number
  ratio: number
  details: { id: string; concept: string; state: GradeState }[]
}

/**
 * 문항을 어디서 가져왔는지.
 *  db   — Supabase. 정답이 브라우저로 내려오지 않고 서버에서 채점합니다.
 *  code — src/diagnostic.ts 의 기본 문항. DB에 문항이 없을 때만 쓰입니다.
 */
export type Source = 'db' | 'code'

/** code 출처일 때만 채워집니다. 이때는 브라우저에서 채점합니다. */
type Secrets = Map<string, { type: 'choice' | 'short'; answer: number | null; accept: string[] }>

export type LoadedQuestions = {
  questions: PublicQuestion[]
  source: Source
  secrets: Secrets | null
}

// ── 변환 ─────────────────────────────────────────────────────

export function toEditable(question: Question, index: number): EditableQuestion {
  return {
    id: `q-${index}`,
    position: index,
    active: true,
    type: question.type,
    concept: question.concept,
    stage: question.stage,
    prompt: question.prompt,
    choices: question.type === 'choice' ? question.choices : ['', '', '', ''],
    placeholder: question.type === 'short' ? (question.placeholder ?? '') : '',
    answer: question.type === 'choice' ? question.answer : null,
    accept: question.type === 'short' ? question.accept : [],
  }
}

export function builtInAsEditable(): EditableQuestion[] {
  return builtInQuestions.map(toEditable)
}

function splitEditable(rows: EditableQuestion[]): LoadedQuestions {
  const active = rows.filter((row) => row.active).sort((a, b) => a.position - b.position)
  const secrets: Secrets = new Map()

  active.forEach((row) => {
    secrets.set(row.id, { type: row.type, answer: row.answer, accept: row.accept })
  })

  return {
    source: 'code',
    secrets,
    questions: active.map((row) => ({
      id: row.id,
      type: row.type,
      concept: row.concept,
      stage: row.stage,
      prompt: row.prompt,
      choices: row.type === 'choice' ? row.choices : [],
      placeholder: row.type === 'short' ? row.placeholder : '',
    })),
  }
}

// ── 불러오기 ─────────────────────────────────────────────────

/**
 * 출제할 문항을 가져옵니다.
 * Supabase에 등록된 문항을 쓰고, 아직 없거나 연결이 안 되면
 * src/diagnostic.ts 의 기본 문항으로 진행합니다.
 */
export async function loadQuestions(): Promise<LoadedQuestions> {
  if (isBackendReady) {
    const { data, error } = await getClient()
      .from('diagnostic_public')
      .select('id, type, concept, stage, prompt, choices, placeholder')

    if (!error && data && data.length > 0) {
      return {
        source: 'db',
        secrets: null,
        questions: data.map((row) => ({
          id: String(row.id),
          type: row.type as PublicQuestion['type'],
          concept: row.concept ?? '',
          stage: (row.stage ?? 'middle') as Stage,
          prompt: row.prompt,
          choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
          placeholder: row.placeholder ?? '',
        })),
      }
    }
    if (error) {
      console.warn('[diagnostic] DB 문항을 불러오지 못했습니다:', error.message)
    }
  }

  return splitEditable(builtInAsEditable())
}

// ── 채점 ─────────────────────────────────────────────────────

export async function gradeAnswers(
  loaded: LoadedQuestions,
  answers: Record<string, string>,
): Promise<GradeResult> {
  const { questions, source, secrets } = loaded

  if (source === 'db') {
    const submission = questions.map((q) => ({ id: q.id, value: answers[q.id] ?? '' }))
    const { data, error } = await getClient().rpc('grade_diagnostic', { submission })

    if (!error && data) {
      const raw = data as GradeResult
      return {
        total: raw.total,
        correct: raw.correct,
        ratio: Number(raw.ratio),
        details: raw.details ?? [],
      }
    }
    console.warn('[diagnostic] 서버 채점에 실패했습니다:', error?.message)
  }

  // 브라우저 채점 — 정답이 이미 이 화면에 있는 경우에만 씁니다.
  const details = questions.map((question) => {
    const given = answers[question.id] ?? ''
    const secret = secrets?.get(question.id)

    if (given === '') {
      return { id: question.id, concept: question.concept, state: 'skipped' as const }
    }
    if (!secret) {
      return { id: question.id, concept: question.concept, state: 'wrong' as const }
    }

    const asQuestion = {
      ...question,
      ...(secret.type === 'choice'
        ? { type: 'choice' as const, choices: question.choices, answer: secret.answer ?? -1 }
        : { type: 'short' as const, accept: secret.accept }),
    }
    const value = secret.type === 'choice' ? Number(given) : given
    const ok = isCorrect(asQuestion as Question, value)
    return { id: question.id, concept: question.concept, state: ok ? ('correct' as const) : ('wrong' as const) }
  })

  const correct = details.filter((d) => d.state === 'correct').length
  const total = questions.length

  return { total, correct, ratio: total === 0 ? 0 : correct / total, details }
}

// ── 관리자(Supabase) 전용 ────────────────────────────────────

export async function listQuestionsForAdmin(): Promise<EditableQuestion[]> {
  const { data, error } = await getClient()
    .from('diagnostic_questions')
    .select('*')
    .order('position')
    .order('created_at')

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: String(row.id),
    position: row.position ?? 0,
    active: row.active ?? true,
    type: row.type,
    concept: row.concept ?? '',
    stage: row.stage ?? 'middle',
    prompt: row.prompt ?? '',
    choices: Array.isArray(row.choices) ? row.choices : [],
    placeholder: row.placeholder ?? '',
    answer: row.answer,
    accept: row.accept ?? [],
  }))
}

export type QuestionDraft = Omit<EditableQuestion, 'id'> & { id?: string }

export async function saveQuestion(draft: QuestionDraft): Promise<void> {
  const payload = {
    position: draft.position,
    active: draft.active,
    type: draft.type,
    concept: draft.concept,
    stage: draft.stage,
    prompt: draft.prompt,
    choices: draft.type === 'choice' ? draft.choices : [],
    answer: draft.type === 'choice' ? draft.answer : null,
    placeholder: draft.type === 'short' ? draft.placeholder : '',
    accept: draft.type === 'short' ? draft.accept : [],
  }

  const client = getClient()
  const { error } = draft.id
    ? await client.from('diagnostic_questions').update(payload).eq('id', draft.id)
    : await client.from('diagnostic_questions').insert(payload)

  if (error) throw new Error(error.message)
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await getClient().from('diagnostic_questions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** 코드에 들어 있는 기본 문항을 DB로 한 번에 복사합니다. */
export async function seedFromLocal(): Promise<number> {
  const rows = builtInAsEditable().map(({ id: _id, ...row }) => row)
  const { error } = await getClient().from('diagnostic_questions').insert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}
