import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Loader2 } from 'lucide-react'
import { site } from '../../content'
import { updatePassword } from '../../lib/auth'
import { getClient } from '../../lib/supabase'

/**
 * 재설정 메일의 링크로 들어오는 화면입니다.
 * 링크에 담긴 일회용 표를 Supabase 가 읽어 잠깐 로그인시켜 주고,
 * 그 상태에서 새 비밀번호를 저장합니다.
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState<'checking' | 'ok' | 'expired'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const client = getClient()
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady('ok')
    })
    // 링크를 읽는 데 잠깐 걸립니다. 그래도 로그인이 안 되면 링크가 만료된 것입니다.
    const timer = window.setTimeout(async () => {
      const { data } = await client.auth.getSession()
      setReady(data.session ? 'ok' : 'expired')
    }, 1500)
    return () => {
      sub.subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('두 비밀번호가 다릅니다.')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      navigate('/app', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했습니다.')
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
        <h1>새 비밀번호 정하기</h1>

        {ready === 'checking' && (
          <p className="app-note">
            <Loader2 size={16} className="spin" /> 링크를 확인하는 중…
          </p>
        )}

        {ready === 'expired' && (
          <>
            <p className="app-error">
              링크가 만료됐거나 이미 사용됐습니다. 로그인 화면에서 재설정 메일을 다시 받아주세요.
            </p>
            <Link className="btn btn-ghost btn-block" to="/app/login">
              로그인 화면으로
            </Link>
          </>
        )}

        {ready === 'ok' && (
          <>
            <label className="field">
              <span className="field-label">새 비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">한 번 더</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            {error && <p className="app-error">{error}</p>}

            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
              저장하고 들어가기
            </button>
          </>
        )}
      </form>
    </div>
  )
}
