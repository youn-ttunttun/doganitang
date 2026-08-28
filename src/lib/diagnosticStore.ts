import {
  gradeDiagnostic as gradeLocally,
  questions as localQuestions,
  isCorrect,
  type Stage,
} from '../diagnostic'
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

/** 관리자 화면에서 다루는 문항 (정답 포함) */
export type AdminQuestion = PublicQuestion & {
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

/** DB에 문항이 없을 때 쓰는 기본 문항 (src/diagnostic.ts) */
function localAsPublic(): PublicQuestion[] {
  return localQuestions.map((q, i) => ({
    id: `local-${i}`,
    type: q.type,
    concept: q.concept,
    stage: q.stage,
    prompt: q.prompt,
    choices: q.type === 'choice' ? q.choices : [],
    placeholder: q.type === 'short' ? (q.placeholder ?? '') : '',
  }))
}

/**
 * 출제할 문항을 가져옵니다.
 * Supabase가 연결돼 있고 등록된 문항이 있으면 그걸 쓰고,
 * 아니면 코드에 들어 있는 기본 문항으로 진행합니다.
 */
export async function loadQuestions(): Promise<{ questions: PublicQuestion[]; source: 'db' | 'local' }> {
  if (!isBackendReady) return { questions: localAsPublic(), source: 'local' }

  const { data, error } = await getClient()
    .from('diagnostic_public')
    .select('id, type, concept, stage, prompt, choices, placeholder')

  if (error || !data || data.length === 0) {
    if (error) console.warn('[diagnostic] 문항을 불러오지 못해 기본 문항으로 진행합니다:', error.message)
    return { questions: localAsPublic(), source: 'local' }
  }

  return {
    questions: data.map((row) => ({
      id: String(row.id),
      type: row.type as PublicQuestion['type'],
      concept: row.concept ?? '',
      stage: (row.stage ?? 'middle') as Stage,
      prompt: row.prompt,
      choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
      placeholder: row.placeholder ?? '',
    })),
    source: 'db',
  }
}

/**
 * 채점합니다.
 * DB 문항이면 정답을 브라우저로 내려받지 않고 DB 안에서 채점합니다.
 * 기본 문항이면 브라우저에서 채점합니다.
 */
export async function gradeAnswers(
  questions: PublicQuestion[],
  answers: Record<string, string>,
  source: 'db' | 'local',
): Promise<GradeResult> {
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
    console.warn('[diagnostic] 서버 채점에 실패해 기본 채점으로 넘어갑니다:', error?.message)
  }

  // 기본 문항 채점 — id가 'local-N' 이므로 순서를 그대로 복원할 수 있습니다.
  const ordered = questions.map((q) => {
    const index = Number(q.id.replace('local-', ''))
    const question = localQuestions[index]
    const given = answers[q.id] ?? ''
    if (!question) return { question: null, given }
    return { question, given }
  })

  const local = gradeLocally(
    ordered.map(({ question, given }) => {
      if (!question) return null
      return question.type === 'choice' ? (given === '' ? null : Number(given)) : given
    }),
  )

  return {
    total: local.total,
    correct: local.correct,
    ratio: local.ratio,
    details: ordered.map(({ question, given }, i) => {
      const publicQuestion = questions[i]
      if (!question) return { id: publicQuestion.id, concept: publicQuestion.concept, state: 'skipped' as const }
      const value = question.type === 'choice' ? (given === '' ? null : Number(given)) : given
      const state: GradeState =
        given === '' ? 'skipped' : isCorrect(question, value) ? 'correct' : 'wrong'
      return { id: publicQuestion.id, concept: question.concept, state }
    }),
  }
}

// ── 관리자용 ─────────────────────────────────────────────────

export async function listQuestionsForAdmin(): Promise<AdminQuestion[]> {
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

export type QuestionDraft = Omit<AdminQuestion, 'id'> & { id?: string }

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
  const rows = localQuestions.map((q, i) => ({
    position: i,
    active: true,
    type: q.type,
    concept: q.concept,
    stage: q.stage,
    prompt: q.prompt,
    choices: q.type === 'choice' ? q.choices : [],
    answer: q.type === 'choice' ? q.answer : null,
    placeholder: q.type === 'short' ? (q.placeholder ?? '') : '',
    accept: q.type === 'short' ? q.accept : [],
  }))

  const { error } = await getClient().from('diagnostic_questions').insert(rows)
  if (error) throw new Error(error.message)
  return rows.length
}
