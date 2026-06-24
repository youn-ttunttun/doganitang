// GET /api/quote?symbol=AAPL        -> 미국 주식 (Finnhub)
// GET /api/quote?symbol=005930      -> 한국 주식 (네이버 우선, 실패 시 Yahoo Finance .KS/.KQ 대체)
//
// Vercel 배포 시 프로젝트 설정 > Environment Variables 에 FINNHUB_API_KEY를 등록해야 합니다.
// (.env 파일은 git에 커밋되지 않으므로 Vercel에는 자동으로 전달되지 않습니다.)

import { getQuote } from './_lib/getQuote.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'GET 메서드만 지원합니다.' })
  }

  const symbolParam = Array.isArray(req.query.symbol) ? req.query.symbol[0] : req.query.symbol

  if (!symbolParam || !symbolParam.trim()) {
    return res.status(400).json({
      error: 'symbol 쿼리 파라미터가 필요합니다. 예) /api/quote?symbol=AAPL 또는 /api/quote?symbol=005930',
    })
  }

  try {
    const quote = await getQuote(symbolParam)
    return res.status(200).json(quote)
  } catch (error) {
    console.error('[api/quote] 조회 실패:', error)
    return res.status(502).json({ error: error.message || '시세를 가져오지 못했습니다.' })
  }
}
