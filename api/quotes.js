// 복수 종목 일괄 조회
// GET  /api/quotes?symbols=AAPL,GOOGL,005930
// POST /api/quotes   body: { "symbols": ["AAPL", "GOOGL", "005930"] }
//
// 내부적으로 api/quote.js와 동일한 _lib/getQuote 로직을 종목마다 병렬로 호출합니다.
// 일부 종목 조회가 실패해도 나머지 결과는 그대로 반환되고, 실패한 종목은 error 필드로 표시됩니다.

import { getQuote } from './_lib/getQuote.js'

function parseSymbols(req) {
  if (req.method === 'POST') {
    const body = req.body || {}
    if (Array.isArray(body.symbols)) return body.symbols
    if (typeof body.symbols === 'string') return body.symbols.split(',')
  }

  const { symbols } = req.query
  if (Array.isArray(symbols)) return symbols.flatMap((s) => String(s).split(','))
  if (typeof symbols === 'string') return symbols.split(',')
  return []
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'GET 또는 POST 메서드만 지원합니다.' })
  }

  const symbols = [...new Set(parseSymbols(req).map((s) => String(s).trim()).filter(Boolean))]

  if (symbols.length === 0) {
    return res.status(400).json({
      error:
        'symbols 파라미터가 필요합니다. 예) /api/quotes?symbols=AAPL,GOOGL,005930 또는 POST { "symbols": [...] }',
    })
  }

  if (symbols.length > 30) {
    return res.status(400).json({ error: '한 번에 최대 30개 종목까지 조회할 수 있습니다.' })
  }

  const settled = await Promise.allSettled(symbols.map((symbol) => getQuote(symbol)))

  const quotes = settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    return { symbol: symbols[index], error: result.reason?.message || '시세 조회 실패' }
  })

  return res.status(200).json({ count: quotes.length, quotes })
}
