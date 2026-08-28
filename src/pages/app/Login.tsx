import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { site } from '../../content'
import { signIn, signUp, useAuth } from '../../lib/auth'
import { isBackendReady } from '../../lib/supabase'

export default function Login() {
  const { loading, session } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isBackendReady) {
    return (
      <div className="app-shell app-center">
        <div className="app-card">
          <h1>아직 로그인을 쓸 수 없습니다</h1>
          <p>
            Supabase 프로젝트를 연결하면 로그인이 켜집니다. README의 «신청서 접수» 항목을
            따라 설정해주세요.
          </p>
          <Link className="btn btn-ghost" to="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!loading && session) return <Navigate to="/app" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'in') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, name.trim())
        setSent(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '문제가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell app-center">
      <form className="app-card" onSubmit={submit}>
        <Link className="app-brand" to="/">
          {site.name}
        </Link>
        <h1>{mode === 'in' ? '로그인' : '계정 만들기'}</h1>

        {sent ? (
          <p className="app-note">
            확인 메일을 보냈습니다. 메일의 링크를 눌러 인증한 뒤 로그인해주세요.
          </p>
        ) : (
          <>
            {mode === 'up' && (
              <label className="field">
                <span className="field-label">이름</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
            )}

            <label className="field">
              <span className="field-label">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </label>

            {error && <p className="app-error">{error}</p>}

            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
              {mode === 'in' ? '로그인' : '가입하기'}
            </button>
          </>
        )}

        <button
          type="button"
          className="app-switch"
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setSent(false)
            setError('')
          }}
        >
          {mode === 'in' ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </form>
    </div>
  )
}
