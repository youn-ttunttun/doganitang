import { StrictMode, useState, useEffect, useMemo, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Settings,
  LayoutGrid,
  RefreshCw,
  Search,
  Loader2,
  X,
  Download,
} from 'lucide-react'
import './styles.css'

// ---------- 타입 ----------

type Market = 'US' | 'KR'
type Currency = 'USD' | 'KRW'
type Tab = 'portfolio' | 'add' | 'settings'

type Holding = {
  symbol: string
  name: string
  market: Market
  shares: number
  avgCost: number
}

type LiveQuote = {
  symbol: string
  name?: string | null
  market?: string
  currency?: Currency
  price?: number
  change?: number | null
  changePercent?: number | null
  open?: number | null
  high?: number | null
  low?: number | null
  previousClose?: number | null
  updatedAt?: string
  source?: string
  error?: string
}

type SearchResult = {
  symbol: string
  name: string
  nameEn: string | null
  market: string // 'US' | 'KOSPI' | 'KOSDAQ'
  country: Market
  type: string
}

type Recommendation = '추가매수' | '유지' | '일부매도' | '전량매도'

type AnalysisResult = {
  recommendation: Recommendation
  summary: string
  reasons: string[]
  risks: string[]
}

// ---------- 보유 종목 로컬 저장 ----------

const STORAGE_KEY = 'mystocklab:holdings'

// 테스트용 초기 포트폴리오 — 로컬 저장값이 없을 때만 사용됩니다.
const DEFAULT_HOLDINGS: Holding[] = [
  { symbol: 'SOXL', name: 'SOXL', market: 'US', shares: 50, avgCost: 24.1 },
  { symbol: 'ASTS', name: 'AST 스페이스모바일', market: 'US', shares: 20, avgCost: 35.4 },
  { symbol: 'GOOGL', name: '구글', market: 'US', shares: 10, avgCost: 152.0 },
  { symbol: 'AAPL', name: '애플', market: 'US', shares: 15, avgCost: 190.25 },
]

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_HOLDINGS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HOLDINGS
  } catch {
    return DEFAULT_HOLDINGS
  }
}

// ---------- 포맷 헬퍼 ----------

function formatCurrency(value: number, currency: Currency = 'USD') {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  })
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatTime(iso?: string) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

// 추천 결과 → 배지 색상 클래스 (추가매수=초록, 유지=파랑, 일부매도=주황, 전량매도=빨강)
function recommendationClass(recommendation: Recommendation) {
  switch (recommendation) {
    case '추가매수':
      return 'rec-buy'
    case '유지':
      return 'rec-hold'
    case '일부매도':
      return 'rec-trim'
    case '전량매도':
      return 'rec-sell'
    default:
      return 'rec-hold'
  }
}

// 고정 환율 — 총 평가금액/손익을 달러·원화 두 가지로 함께 보여줄 때 사용합니다.
const USD_TO_KRW = 1350

function toUsd(value: number, currency: Currency) {
  return currency === 'KRW' ? value / USD_TO_KRW : value
}

function computeTotals(holdings: Holding[], quotes: Record<string, LiveQuote>) {
  let totalValueUsd = 0
  let totalCostUsd = 0

  for (const h of holdings) {
    const q = quotes[h.symbol]
    const currency: Currency = q?.currency ?? (h.market === 'KR' ? 'KRW' : 'USD')
    const price = q?.price ?? h.avgCost // 시세 로딩 전에는 평단가로 임시 표시
    totalValueUsd += toUsd(price * h.shares, currency)
    totalCostUsd += toUsd(h.avgCost * h.shares, currency)
  }

  const totalProfitUsd = totalValueUsd - totalCostUsd
  const totalReturnPct = totalCostUsd === 0 ? 0 : (totalProfitUsd / totalCostUsd) * 100

  return { totalValueUsd, totalCostUsd, totalProfitUsd, totalReturnPct }
}

// ---------- 카드 안의 막대 모양 미니 차트 ----------
// 별도 차트 라이브러리 없이, 이미 받아온 시세 값(전일종가/시가/저가/고가/현재가)만으로
// 오늘 가격이 어디쯔 움직였는지 보여주는 작은 막대 그래프입니다.

function MiniBarChart({
  open,
  high,
  low,
  previousClose,
  price,
}: {
  open?: number | null
  high?: number | null
  low?: number | null
  previousClose?: number | null
  price?: number | null
}) {
  const bars = [
    { key: 'pc', value: previousClose, isCurrent: false },
    { key: 'o', value: open, isCurrent: false },
    { key: 'l', value: low, isCurrent: false },
    { key: 'h', value: high, isCurrent: false },
    { key: 'p', value: price, isCurrent: true },
  ].filter((b): b is { key: string; value: number; isCurrent: boolean } => typeof b.value === 'number')

  if (bars.length < 2) return null

  const values = bars.map((b) => b.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const isUp = typeof price === 'number' && typeof previousClose === 'number' ? price >= previousClose : true

  return (
    <div className="mini-chart" aria-hidden="true">
      {bars.map((b) => (
        <span
          key={b.key}
          className={`mini-bar ${b.isCurrent ? (isUp ? 'up' : 'down') : ''}`}
          style={{ height: `${Math.max(10, ((b.value - min) / range) * 100)}%` }}
        />
      ))}
    </div>
  )
}

// ---------- 종목 추가 탭 ----------

function AddStockPanel({ onAdd }: { onAdd: (holding: Holding) => void }) {
  const [market, setMarket] = useState<Market>('US')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [preview, setPreview] = useState<LiveQuote | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [shares, setShares] = useState('')
  const [avgCost, setAvgCost] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  // 검색어 입력 → 디바운스 후 /api/search 호출
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || '검색에 실패했습니다.')
        setResults(data.results ?? [])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSearchError((error as Error).message)
          setResults([])
        }
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const filteredResults = useMemo(
    () => results.filter((r) => r.country === market),
    [results, market],
  )

  async function handleSelectResult(result: SearchResult) {
    setSelected(result)
    setPreview(null)
    setPreviewError(null)
    setFeedback(null)
    setShares('')
    setAvgCost('')
    setIsPreviewLoading(true)
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(result.symbol)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '현재가를 불러오지 못했습니다.')
      setPreview(data)
      if (typeof data.price === 'number') {
        setAvgCost(String(data.price))
      }
    } catch (error) {
      setPreviewError((error as Error).message)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  function handleAdd() {
    if (!selected) return
    const sharesNum = parseFloat(shares)
    const avgCostNum = parseFloat(avgCost)

    if (!Number.isFinite(sharesNum) || sharesNum <= 0) {
      setFeedback('수량을 올바르게 입력해주세요.')
      return
    }
    if (!Number.isFinite(avgCostNum) || avgCostNum <= 0) {
      setFeedback('평균매수가를 올바르게 입력해주세요.')
      return
    }

    onAdd({
      symbol: selected.symbol,
      name: selected.name,
      market: selected.country,
      shares: sharesNum,
      avgCost: avgCostNum,
    })

    setFeedback(`${selected.name}(${selected.symbol})을 포트폴리오에 추가했습니다.`)
    setSelected(null)
    setPreview(null)
    setShares('')
    setAvgCost('')
    setQuery('')
    setResults([])
  }

  return (
    <section className="add-panel">
      <div className="market-toggle">
        <button
          type="button"
          className={market === 'US' ? 'active' : ''}
          onClick={() => {
            setMarket('US')
            setSelected(null)
            setPreview(null)
          }}
        >
          미국
        </button>
        <button
          type="button"
          className={market === 'KR' ? 'active' : ''}
          onClick={() => {
            setMarket('KR')
            setSelected(null)
            setPreview(null)
          }}
        >
          국내
        </button>
      </div>

      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={query}
          placeholder={market === 'US' ? '종목명 또는 티커 (예: AAPL)' : '종목명 또는 코드 (예: 삼성전자)'}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && <Loader2 size={16} className="spin" />}
      </div>

      {searchError && <p className="error-text">{searchError}</p>}

      {filteredResults.length > 0 && (
        <ul className="result-list">
          {filteredResults.map((r) => (
            <li key={r.symbol}>
              <button
                type="button"
                className={selected?.symbol === r.symbol ? 'result-item active' : 'result-item'}
                onClick={() => handleSelectResult(r)}
              >
                <span className="result-name">{r.name}</span>
                <span className="result-meta">
                  {r.symbol} · {r.market}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="preview-card">
          {isPreviewLoading && <p className="muted">현재가를 불러오는 중...</p>}
          {previewError && <p className="error-text">{previewError}</p>}

          {!isPreviewLoading && preview && typeof preview.price === 'number' && (
            <>
              <div className="preview-top">
                <span className="preview-name">{selected.name}</span>
                <span className="preview-symbol">{selected.symbol}</span>
              </div>
              <div className="preview-price">{formatCurrency(preview.price, preview.currency ?? 'USD')}</div>
              {typeof preview.changePercent === 'number' && (
                <div className={`stock-change ${preview.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {preview.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatPercent(preview.changePercent)}
                </div>
              )}
              <span className="preview-source">
                기준: {preview.source ?? '-'} · {formatTime(preview.updatedAt)}
              </span>
            </>
          )}

          <div className="add-form">
            <label>
              수량
              <input
                type="number"
                min="0"
                step="any"
                value={shares}
                placeholder="예: 10"
                onChange={(e) => setShares(e.target.value)}
              />
            </label>
            <label>
              평균매수가
              <input
                type="number"
                min="0"
                step="any"
                value={avgCost}
                placeholder="예: 150.00"
                onChange={(e) => setAvgCost(e.target.value)}
              />
            </label>
            <button type="button" className="add-btn" onClick={handleAdd}>
              <PlusCircle size={16} />
              추가
            </button>
          </div>
        </div>
      )}

      {feedback && <p className="feedback-text">{feedback}</p>}
    </section>
  )
}

// ---------- 포트폴리오 탭 ----------

function PortfolioPanel({
  holdings,
  quotes,
  isRefreshing,
  lastRefreshedAt,
  onRefresh,
  onRemove,
  expandedAnalysis,
  analysisCache,
  analysisLoading,
  analysisError,
  onToggleAnalysis,
}: {
  holdings: Holding[]
  quotes: Record<string, LiveQuote>
  isRefreshing: boolean
  lastRefreshedAt: string | null
  onRefresh: () => void
  onRemove: (symbol: string) => void
  expandedAnalysis: Record<string, boolean>
  analysisCache: Record<string, AnalysisResult>
  analysisLoading: Record<string, boolean>
  analysisError: Record<string, string>
  onToggleAnalysis: (holding: Holding) => void
}) {
  const totals = useMemo(() => computeTotals(holdings, quotes), [holdings, quotes])

  return (
    <>
      <div className="refresh-row">
        <span className="muted">
          {lastRefreshedAt ? `마지막 업데이트 ${formatTime(lastRefreshedAt)}` : '시세 불러오는 중...'}
        </span>
        <button type="button" className="refresh-btn" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          새로고침
        </button>
      </div>

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">
            <Wallet size={16} />총 평가금액
          </span>
          <span className="summary-value">{formatCurrency(totals.totalValueUsd, 'USD')}</span>
          <span className="summary-value-sub">
            {formatCurrency(totals.totalValueUsd * USD_TO_KRW, 'KRW')}
          </span>
        </div>
        <div className={`summary-card ${totals.totalProfitUsd >= 0 ? 'positive' : 'negative'}`}>
          <span className="summary-label">
            {totals.totalProfitUsd >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}총 손익
          </span>
          <span className="summary-value">
            {totals.totalProfitUsd >= 0 ? '+' : ''}
            {formatCurrency(totals.totalProfitUsd, 'USD')}
          </span>
          <span className="summary-value-sub">
            {totals.totalProfitUsd >= 0 ? '+' : ''}
            {formatCurrency(totals.totalProfitUsd * USD_TO_KRW, 'KRW')}
          </span>
        </div>
        <div className={`summary-card ${totals.totalReturnPct >= 0 ? 'positive' : 'negative'}`}>
          <span className="summary-label">총 수익률</span>
          <span className="summary-value">{formatPercent(totals.totalReturnPct)}</span>
        </div>
      </section>

      <section className="stock-grid">
        {holdings.map((h) => {
          const q = quotes[h.symbol]
          const currency: Currency = q?.currency ?? (h.market === 'KR' ? 'KRW' : 'USD')
          const price = q?.price
          const changePercent = q?.changePercent
          const isLoading = !q?.error && price == null

          return (
            <div className="stock-card" key={h.symbol}>
              <button
                type="button"
                className="stock-remove-btn"
                onClick={() => onRemove(h.symbol)}
                aria-label={`${h.name} 삭제`}
              >
                <X size={13} />
              </button>

              <div className="stock-card-top">
                <span className="stock-name">{h.name}</span>
                <span className="stock-ticker">{h.symbol}</span>
              </div>

              {q?.error ? (
                <div className="error-text small">시세 조회 실패</div>
              ) : isLoading ? (
                <div className="stock-skeleton">
                  <span className="skeleton-bar w-70" />
                  <span className="skeleton-bar w-40" />
                  <span className="skeleton-bar w-50" />
                </div>
              ) : (
                <>
                  <div className="stock-price">{formatCurrency(price as number, currency)}</div>
                  <MiniBarChart
                    open={q?.open}
                    high={q?.high}
                    low={q?.low}
                    previousClose={q?.previousClose}
                    price={price}
                  />
                  <div
                    className={`stock-change ${(changePercent ?? 0) >= 0 ? 'positive' : 'negative'}`}
                  >
                    {(changePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {changePercent != null ? formatPercent(changePercent) : '-'}
                  </div>
                  <div className="stock-updated">업데이트 {formatTime(q?.updatedAt)}</div>
                </>
              )}

              <button
                type="button"
                className="ai-analyze-btn"
                onClick={() => onToggleAnalysis(h)}
              >
                🤖 AI 분석
              </button>

              {expandedAnalysis[h.symbol] && (
                <div className="ai-analysis-panel">
                  {analysisLoading[h.symbol] ? (
                    <div className="ai-loading">
                      <Loader2 size={14} className="spin" />
                      AI가 분석하는 중...
                    </div>
                  ) : analysisError[h.symbol] ? (
                    <p className="error-text small">{analysisError[h.symbol]}</p>
                  ) : analysisCache[h.symbol] ? (
                    <>
                      <span className={`ai-badge ${recommendationClass(analysisCache[h.symbol].recommendation)}`}>
                        {analysisCache[h.symbol].recommendation}
                      </span>
                      <p className="ai-summary">{analysisCache[h.symbol].summary}</p>
                      <div className="ai-section">
                        <span className="ai-section-title">추천 이유</span>
                        <ul>
                          {analysisCache[h.symbol].reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="ai-section">
                        <span className="ai-section-title">리스크</span>
                        <ul>
                          {analysisCache[h.symbol].risks.map((risk, i) => (
                            <li key={i}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="ai-disclaimer">
                        이 분석은 AI가 생성한 참고용 정보이며 투자 권유가 아닙니다. 투자 결정은 본인의 판단과
                        책임 하에 신중하게 하시기 바랍니다.
                      </p>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </>
  )
}

// ---------- 앱 ----------

function App() {
  const [tab, setTab] = useState<Tab>('portfolio')
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings())
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null)

  // AI 분석 결과는 종목(symbol)별로 캐시해서, 같은 종목을 다시 펼칠 때 재요청하지 않습니다.
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({})
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisResult>>({})
  const [analysisLoading, setAnalysisLoading] = useState<Record<string, boolean>>({})
  const [analysisError, setAnalysisError] = useState<Record<string, string>>({})

  // 홈 화면 설치(PWA) 버튼 관련 상태
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIosTip, setShowIosTip] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
  }, [holdings])

  // 설치 가능 여부 감지: Chrome/Edge/Android는 beforeinstallprompt 이벤트로,
  // 이미 설치되어 실행 중인지는 display-mode: standalone 으로 판단합니다.
  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const checkStandalone = () =>
      setIsStandalone(standaloneQuery.matches || (navigator as any).standalone === true)
    checkStandalone()

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    function handleAppInstalled() {
      setInstallPrompt(null)
      setShowIosTip(false)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    standaloneQuery.addEventListener('change', checkStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      standaloneQuery.removeEventListener('change', checkStandalone)
    }
  }, [])

  // 설치 버튼 클릭: 브라우저가 설치 프롬프트를 지원하면 그걸 띄우고,
  // 그렇지 않으면(iOS Safari 등) 수동 설치 방법을 안내하는 작은 안내문을 보여줍니다.
  async function handleInstallClick() {
    if (installPrompt) {
      setShowIosTip(false)
      installPrompt.prompt()
      try {
        await installPrompt.userChoice
      } finally {
        setInstallPrompt(null)
      }
      return
    }
    setShowIosTip((prev) => !prev)
  }

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings])

  const refreshQuotes = useCallback(async () => {
    if (symbols.length === 0) return
    setIsRefreshing(true)
    try {
      const res = await fetch(`/api/quotes?symbols=${symbols.map(encodeURIComponent).join(',')}`)
      const data = await res.json()
      const next: Record<string, LiveQuote> = {}
      for (const q of data.quotes ?? []) {
        next[q.symbol] = q
      }
      setQuotes((prev) => ({ ...prev, ...next }))
      setLastRefreshedAt(new Date().toISOString())
    } catch (error) {
      console.error('시세 갱신 실패:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [symbols])

  useEffect(() => {
    refreshQuotes()
    const interval = setInterval(refreshQuotes, 60_000) // 1분마다 자동 업데이트
    return () => clearInterval(interval)
  }, [refreshQuotes])

  function handleAddHolding(newHolding: Holding) {
    setHoldings((prev) => {
      const idx = prev.findIndex((h) => h.symbol === newHolding.symbol)
      if (idx === -1) return [...prev, newHolding]

      // 이미 보유 중인 종목이면 수량/평균매수가를 가중평균으로 합산
      const existing = prev[idx]
      const totalShares = existing.shares + newHolding.shares
      const weightedAvgCost =
        (existing.avgCost * existing.shares + newHolding.avgCost * newHolding.shares) / totalShares

      const next = [...prev]
      next[idx] = { ...existing, shares: totalShares, avgCost: weightedAvgCost }
      return next
    })
    setTab('portfolio')
  }

  function handleRemoveHolding(symbol: string) {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol))
    setQuotes((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })
    setExpandedAnalysis((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })
    setAnalysisCache((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })
    setAnalysisError((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })
  }

  // AI 분석 버튼 토글: 펼쳐져 있으면 닫기만 하고, 닫혀 있으면 펼치면서
  // 캐시된 결과가 없을 때만 /api/analyze를 호출합니다.
  async function handleToggleAnalysis(holding: Holding) {
    const symbol = holding.symbol

    if (expandedAnalysis[symbol]) {
      setExpandedAnalysis((prev) => ({ ...prev, [symbol]: false }))
      return
    }

    setExpandedAnalysis((prev) => ({ ...prev, [symbol]: true }))

    if (analysisCache[symbol]) return // 이미 분석한 종목이면 캐시 재사용

    const q = quotes[symbol]
    const currency: Currency = q?.currency ?? (holding.market === 'KR' ? 'KRW' : 'USD')
    const currentPrice = q?.price ?? holding.avgCost

    setAnalysisLoading((prev) => ({ ...prev, [symbol]: true }))
    setAnalysisError((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: holding.name,
          symbol: holding.symbol,
          market: holding.market,
          currentPrice,
          avgCost: holding.avgCost,
          shares: holding.shares,
          currency,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'AI 분석에 실패했습니다.')
      setAnalysisCache((prev) => ({ ...prev, [symbol]: data }))
    } catch (error) {
      setAnalysisError((prev) => ({ ...prev, [symbol]: (error as Error).message }))
    } finally {
      setAnalysisLoading((prev) => ({ ...prev, [symbol]: false }))
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Stock Lab</h1>

        {!isStandalone && (
          <button type="button" className="install-btn" onClick={handleInstallClick}>
            <Download size={14} />
            설치
          </button>
        )}

        {showIosTip && (
          <div className="install-tip">
            Safari 하단(또는 상단)의 공유 버튼을 누른 뒤 "홈 화면에 추가"를 선택하면 앱처럼 설치할 수
            있어요.
          </div>
        )}
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${tab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setTab('portfolio')}
        >
          <LayoutGrid size={18} />
          포트폴리오
        </button>
        <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
          <PlusCircle size={18} />
          종목 추가
        </button>
        <button
          className={`tab-btn ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          <Settings size={18} />
          설정
        </button>
      </nav>

      <main className="app-main">
        {tab === 'portfolio' && (
          <PortfolioPanel
            holdings={holdings}
            quotes={quotes}
            isRefreshing={isRefreshing}
            lastRefreshedAt={lastRefreshedAt}
            onRefresh={refreshQuotes}
            onRemove={handleRemoveHolding}
            expandedAnalysis={expandedAnalysis}
            analysisCache={analysisCache}
            analysisLoading={analysisLoading}
            analysisError={analysisError}
            onToggleAnalysis={handleToggleAnalysis}
          />
        )}

        {tab === 'add' && <AddStockPanel onAdd={handleAddHolding} />}

        {tab === 'settings' && (
          <section className="placeholder-panel">
            <Settings size={32} />
            <p>설정 화면은 준비 중입니다.</p>
          </section>
        )}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
