// GET /api/search?q=삼성전자   또는   /api/search?q=AAPL
//
// 한국 종목은 _lib/koreanStocks.js 로컬 목록에서, 미국 종목은 Finnhub 검색 API에서 찾아
// 하나의 결과 배열로 합쳐 반환합니다.
//
// Vercel 배포 시 프로젝트 설정 > Environment Variables 에 FINNHUB_API_KEY를 등록해야 합니다.

import { KOREAN_STOCKS } from './_lib/koreanStocks.js'

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

function searchKoreanStocks(query) {
  const q = query.trim().toLowerCase()

  return KOREAN_STOCKS.filter(
    (s) =>
      s.code.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(q)),
  ).map((s) => ({
    symbol: s.code,
    name: s.name,
    nameEn: s.nameEn || null,
    market: s.market, // 'KOSPI' | 'KOSDAQ'
    country: 'KR',
    type: 'Common Stock',
  }))
}

async function searchUsStocks(query) {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    console.error('[api/search] FINNHUB_API_KEY 환경변수가 설정되어 있지 않습니다.')
    return []
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`,
      { headers: FETCH_HEADERS },
    )

    if (!response.ok) {
      throw new Error(`Finnhub 검색 실패 (status ${response.status})`)
    }

    const data = await response.json()

    return (data?.result || [])
      .filter((item) => item.symbol && !item.symbol.includes('.')) // 해외거래소 중복 표기 제외
      .slice(0, 15)
      .map((item) => ({
        symbol: item.symbol,
        name: item.description,
        nameEn: null,
        market: 'US',
        country: 'US',
        type: item.type || 'Common Stock',
      }))
  } catch (error) {
    console.error('[api/search] Finnhub 검색 실패:', error)
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'GET 메서드만 지원합니다.' })
  }

  const qParam = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q

  if (!qParam || !qParam.trim()) {
    return res.status(400).json({
      error: 'q 쿼리 파라미터가 필요합니다. 예) /api/search?q=삼성전자 또는 /api/search?q=AAPL',
    })
  }

  const query = qParam.trim()
  const koreanResults = searchKoreanStocks(query)
  const usResults = await searchUsStocks(query)

  return res.status(200).json({
    query,
    count: koreanResults.length + usResults.length,
    results: [...koreanResults, ...usResults],
  })
}
