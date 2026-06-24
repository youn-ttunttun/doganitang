// 공용 시세 조회 로직
// api/quote.js, api/quotes.js 가 함께 사용합니다.
// 파일 이름이 _lib 폴더 안에 있어서 Vercel이 별도 엔드포인트로 만들지 않습니다.

import { KOREAN_STOCKS } from './koreanStocks.js'

// "005930", "005930.KS", "005930.KQ" 형태를 한국 종목으로 인식
const KR_CODE_RE = /^(\d{6})(\.(KS|KQ))?$/i

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

function isKoreanSymbol(symbol) {
  return KR_CODE_RE.test(symbol)
}

function toNumber(value) {
  if (value === null || value === undefined) return null
  const n = parseFloat(String(value).replace(/,/g, ''))
  return Number.isNaN(n) ? null : n
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: FETCH_HEADERS })
  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status}): ${url}`)
  }
  return response.json()
}

// ---------- 미국 주식: Finnhub ----------

async function getUsQuote(symbolInput) {
  const symbol = symbolInput.toUpperCase()
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY 환경변수가 설정되어 있지 않습니다.')
  }

  const data = await fetchJson(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
  )

  // Finnhub는 존재하지 않는 심볼이어도 200과 함께 모든 값이 0인 객체를 돌려줍니다.
  if (!data || (data.c === 0 && data.pc === 0 && data.h === 0)) {
    throw new Error(`Finnhub에서 ${symbol} 시세를 찾을 수 없습니다.`)
  }

  return {
    symbol,
    market: 'US',
    currency: 'USD',
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    open: data.o,
    high: data.h,
    low: data.l,
    previousClose: data.pc,
    updatedAt: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    source: 'finnhub',
  }
}

// ---------- 한국 주식: 네이버 증권(우선) → Yahoo Finance(대체) ----------

async function getKoreanQuoteFromNaver(code, listed) {
  // 네이버 증권 비공식 API. 구조가 바뀔 수 있어 두 가지 응답 형태를 모두 시도합니다.
  const data = await fetchJson(
    `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`,
  )

  const item = data?.result?.areas?.[0]?.datas?.[0] ?? data?.datas?.[0] ?? null
  const price = toNumber(item?.nv)

  if (item === null || price === null) {
    throw new Error(`네이버 증권에서 ${code} 시세를 찾을 수 없습니다.`)
  }

  const previousClose = toNumber(item.pcv)
  const change = toNumber(item.cv)
  const changePercent = toNumber(item.cr)

  return {
    symbol: code,
    name: item.nm || listed?.name || null,
    market: listed?.market || 'KR',
    currency: 'KRW',
    price,
    change: change !== null && item.rf === '5' ? -change : change, // rf: 5면 하락
    changePercent: changePercent !== null && item.rf === '5' ? -changePercent : changePercent,
    open: toNumber(item.ov),
    high: toNumber(item.hv),
    low: toNumber(item.lv),
    previousClose,
    updatedAt: new Date().toISOString(),
    source: 'naver',
  }
}

async function getKoreanQuoteFromYahoo(code, listed) {
  const suffix = listed?.market === 'KOSDAQ' ? 'KQ' : 'KS'
  const symbol = `${code}.${suffix}`

  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
  const meta = data?.chart?.result?.[0]?.meta

  if (!meta || meta.regularMarketPrice == null) {
    throw new Error(`Yahoo Finance에서 ${symbol} 시세를 찾을 수 없습니다.`)
  }

  const price = meta.regularMarketPrice
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? null
  const change = previousClose != null ? price - previousClose : null
  const changePercent = previousClose ? (change / previousClose) * 100 : null

  return {
    symbol: code,
    name: listed?.name || null,
    market: listed?.market || 'KR',
    currency: 'KRW',
    price,
    change,
    changePercent,
    open: meta.regularMarketOpen ?? null,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    previousClose,
    updatedAt: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    source: 'yahoo',
  }
}

async function getKoreanQuote(rawSymbol) {
  const [, code] = rawSymbol.match(KR_CODE_RE)
  const listed = KOREAN_STOCKS.find((s) => s.code === code)

  try {
    return await getKoreanQuoteFromNaver(code, listed)
  } catch (naverError) {
    try {
      return await getKoreanQuoteFromYahoo(code, listed)
    } catch (yahooError) {
      throw new Error(
        `${code} 시세 조회 실패 — 네이버: ${naverError.message} / Yahoo: ${yahooError.message}`,
      )
    }
  }
}

// ---------- 공용 진입점 ----------

export async function getQuote(rawSymbolInput) {
  const rawSymbol = String(rawSymbolInput || '').trim()
  if (!rawSymbol) {
    throw new Error('symbol 값이 비어 있습니다.')
  }

  if (isKoreanSymbol(rawSymbol)) {
    return getKoreanQuote(rawSymbol)
  }

  return getUsQuote(rawSymbol)
}
