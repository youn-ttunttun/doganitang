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
        <div className="app-card app-setup">
          <h1>관리자 화면을 켜려면</h1>
          <p>
            문항을 저장할 데이터베이스가 아직 연결되지 않았습니다. 아래 네 단계를 마치면
            바로 쓸 수 있습니다. 10분이면 됩니다.
          </p>

          <ol className="app-steps">
            <li>
              <a href="https://supabase.com" target="_blank" rel="noreferrer">
                supabase.com
              </a>
              에서 프로젝트를 만듭니다 <em>(무료 · 리전은 Seoul)</em>
            </li>
            <li>
              <b>SQL Editor</b>에 저장소의 <code>supabase/schema.sql</code> 내용을 붙여넣고 실행
            </li>
            <li>
              <b>Project Settings → API</b>에서 <code>Project URL</code>과{' '}
              <code>anon public</code> 키를 복사
            </li>
            <li>
              배포 설정(GitHub Secrets 또는 <code>.env.local</code>)에{' '}
              <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code> 로 넣기
            </li>
          </ol>

          <p className="app-hint">
            <code>service_role</code> 키는 모든 권한을 무시하고 통과하는 마스터 키입니다. 절대
            사이트나 저장소에 넣지 마세요.
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
