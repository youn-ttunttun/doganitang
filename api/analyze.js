// POST /api/analyze                       -> 보유 종목 1개 분석
//   body: { name, symbol?, market?("US"|"KR"), currentPrice, avgCost, shares, currency? }
//   response: { recommendation, summary, reasons, risks }
//
// GET  /api/analyze?mode=recommendations  -> 오늘의 추천 종목 (미국 10개 + 한국 10개)
//   response: { us: [{symbol,name,reason,market}] , kr: [{symbol,name,reason,market}] }
//
// Groq(OpenAI 호환) Chat Completions API 사용 — 모델: llama-3.3-70b-versatile
// Vercel 배포 시 프로젝트 설정 > Environment Variables 에 GROQ_API_KEY를 등록해야 합니다.
//
// 주의: 이 엔드포인트가 반환하는 내용은 AI가 생성한 참고용 분석이며 투자 권유가 아닙니다.

const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const VALID_RECOMMENDATIONS = ['추가매수', '유지', '일부매도', '전량매도']

// ---------- Groq 호출 공용 헬퍼 ----------

// 모델 응답에서 JSON 객체만 뽑아냅니다. 모델이 코드블록(```json ... ```)이나
// 앞뒤 설명을 덧붙이는 경우에도 최대한 복구해서 파싱을 시도합니다.
function extractJson(text) {
  if (!text || typeof text !== 'string') return null

  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

async function requestGroq(messages, { temperature, maxTokens, jsonMode }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY 환경변수가 설정되어 있지 않습니다.')
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Groq API 요청 실패 (status ${response.status}): ${errText.slice(0, 300)}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

// JSON 모드로 먼저 시도하고, 모델/요청 조합이 JSON 모드를 지원하지 않아 실패하면
// 일반 모드로 한 번 더 시도합니다(시스템 프롬프트의 JSON-only 지시 + extractJson이 안전망 역할).
async function callGroqJson(messages, { temperature = 0.4, maxTokens = 800 } = {}) {
  let content
  try {
    content = await requestGroq(messages, { temperature, maxTokens, jsonMode: true })
  } catch (jsonModeError) {
    console.warn('[api/analyze] JSON 모드 요청 실패, 일반 모드로 재시도:', jsonModeError.message)
    content = await requestGroq(messages, { temperature, maxTokens, jsonMode: false })
  }

  const parsed = extractJson(content)
  if (!parsed) {
    throw new Error('Groq 응답을 JSON으로 해석하지 못했습니다.')
  }
  return parsed
}

// ---------- 기능 1: 종목 분석 ----------

function buildAnalysisPrompt({ name, symbol, market, currentPrice, avgCost, shares, currency }) {
  const resolvedCurrency = currency || (market === 'KR' ? 'KRW' : 'USD')
  const profitPct = avgCost > 0 ? (((currentPrice - avgCost) / avgCost) * 100).toFixed(2) : '0.00'
  const totalValue = (currentPrice * shares).toFixed(2)
  const totalProfit = ((currentPrice - avgCost) * shares).toFixed(2)

  const systemPrompt =
    '당신은 신중하고 균형 잡힌 주식 포트폴리오 분석 도우미입니다. ' +
    '아래 JSON 스키마와 정확히 일치하는 JSON 객체 하나만 출력하세요. 설명, 코드블록, 마크다운은 절대 포함하지 마세요.\n' +
    '{"recommendation":"추가매수|유지|일부매도|전량매도","summary":"한 줄 요약(한국어, 60자 이내)","reasons":["이유1","이유2","이유3"],"risks":["리스크1","리스크2"]}\n' +
    'recommendation 값은 반드시 "추가매수", "유지", "일부매도", "전량매도" 중 하나여야 합니다. ' +
    'reasons는 정확히 3개, risks는 정확히 2개의 한국어 문장으로 작성하세요. ' +
    '이 분석은 참고용일 뿐 투자 권유가 아니라는 점을 인지하고 과도하게 단정적인 표현은 피하세요.'

  const userPrompt =
    `종목명: ${name}${symbol ? ` (${symbol})` : ''}\n` +
    `시장: ${market === 'KR' ? '한국' : '미국'}\n` +
    `현재가: ${currentPrice} ${resolvedCurrency}\n` +
    `평균매수가: ${avgCost} ${resolvedCurrency}\n` +
    `보유수량: ${shares}\n` +
    `현재 수익률: ${profitPct}%\n` +
    `평가금액: ${totalValue} ${resolvedCurrency}, 평가손익: ${totalProfit} ${resolvedCurrency}\n\n` +
    '위 보유 정보를 바탕으로 분석해주세요.'

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

function normalizeAnalysis(raw) {
  const recommendation = VALID_RECOMMENDATIONS.includes(raw?.recommendation) ? raw.recommendation : '유지'

  const reasons = Array.isArray(raw?.reasons)
    ? raw.reasons.filter((r) => typeof r === 'string' && r.trim()).slice(0, 3)
    : []
  while (reasons.length < 3) reasons.push('추가 분석 근거를 가져오지 못했습니다.')

  const risks = Array.isArray(raw?.risks)
    ? raw.risks.filter((r) => typeof r === 'string' && r.trim()).slice(0, 2)
    : []
  while (risks.length < 2) risks.push('추가 리스크 정보를 가져오지 못했습니다.')

  const summary =
    typeof raw?.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : '분석 요약을 생성하지 못했습니다.'

  return { recommendation, summary, reasons, risks }
}

async function analyzeHolding(payload) {
  const messages = buildAnalysisPrompt(payload)
  const raw = await callGroqJson(messages, { temperature: 0.4, maxTokens: 500 })
  return normalizeAnalysis(raw)
}

// ---------- 기능 2: 오늘의 추천 종목 ----------

function buildRecommendationsPrompt() {
  const today = new Date().toISOString().slice(0, 10)

  const systemPrompt =
    '당신은 신중한 주식 리서치 도우미입니다. ' +
    '아래 JSON 스키마와 정확히 일치하는 JSON 객체 하나만 출력하세요. 설명이나 마크다운은 포함하지 마세요.\n' +
    '{"us":[{"symbol":"AAPL","name":"애플","reason":"추천 이유(한국어, 50자 이내)"}],"kr":[{"symbol":"005930","name":"삼성전자","reason":"추천 이유(한국어, 50자 이내)"}]}\n' +
    'us 배열에는 실제 존재하는 미국 상장 종목(티커) 정확히 10개, ' +
    'kr 배열에는 실제 존재하는 한국 상장 종목(6자리 종목코드) 정확히 10개를 담으세요. ' +
    '같은 산업군에 몰리지 않도록 다양하게 고르고 중복은 피하세요. ' +
    '이는 참고용 정보이며 투자 권유가 아니라는 점을 인지하고 신중하게 작성하세요.'

  const userPrompt = `오늘(${today}) 기준으로 관심 가질 만한 미국 주식 10개와 한국 주식 10개를 추천해주세요.`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

function normalizeRecommendationList(list, market) {
  if (!Array.isArray(list)) return []

  return list
    .filter((item) => item && typeof item.symbol === 'string' && item.symbol.trim())
    .slice(0, 10)
    .map((item) => ({
      symbol: item.symbol.trim(),
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : item.symbol.trim(),
      reason:
        typeof item.reason === 'string' && item.reason.trim()
          ? item.reason.trim()
          : '추천 이유를 가져오지 못했습니다.',
      market,
    }))
}

async function getRecommendations() {
  const raw = await callGroqJson(buildRecommendationsPrompt(), { temperature: 0.7, maxTokens: 1200 })
  return {
    us: normalizeRecommendationList(raw?.us, 'US'),
    kr: normalizeRecommendationList(raw?.kr, 'KR'),
  }
}

// ---------- 핸들러 ----------

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const modeParam = Array.isArray(req.query.mode) ? req.query.mode[0] : req.query.mode

    if (modeParam !== 'recommendations') {
      return res.status(400).json({
        error: 'GET 요청에는 ?mode=recommendations 파라미터가 필요합니다. 종목 분석은 POST로 요청하세요.',
      })
    }

    try {
      const recommendations = await getRecommendations()
      return res.status(200).json(recommendations)
    } catch (error) {
      console.error('[api/analyze] 추천 종목 생성 실패:', error)
      return res.status(502).json({ error: error.message || '추천 종목을 가져오지 못했습니다.' })
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { name, symbol, market, currentPrice, avgCost, shares, currency } = body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name(종목명)이 필요합니다.' })
    }
    if (typeof currentPrice !== 'number' || !Number.isFinite(currentPrice) || currentPrice <= 0) {
      return res.status(400).json({ error: 'currentPrice(현재가)가 올바르지 않습니다.' })
    }
    if (typeof avgCost !== 'number' || !Number.isFinite(avgCost) || avgCost <= 0) {
      return res.status(400).json({ error: 'avgCost(평균매수가)가 올바르지 않습니다.' })
    }
    if (typeof shares !== 'number' || !Number.isFinite(shares) || shares <= 0) {
      return res.status(400).json({ error: 'shares(수량)가 올바르지 않습니다.' })
    }

    try {
      const analysis = await analyzeHolding({ name, symbol, market, currentPrice, avgCost, shares, currency })
      return res.status(200).json(analysis)
    } catch (error) {
      console.error('[api/analyze] 종목 분석 실패:', error)
      return res.status(502).json({ error: error.message || '종목을 분석하지 못했습니다.' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'GET 또는 POST 메서드만 지원합니다.' })
}
