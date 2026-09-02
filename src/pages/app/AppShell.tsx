import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { FileText, ListChecks, LogOut, Type } from 'lucide-react'
import { site } from '../../content'
import { signOut, useAuth } from '../../lib/auth'

/**
 * 로그인 후 화면의 껍데기.
 * 홍보 페이지와 완전히 분리된 레이아웃입니다 — 학생이 들어와도 광고를 보지 않습니다.
 */
export default function AppShell() {
  const { loading, session, profile } = useAuth()

  if (loading) {
    return (
      <div className="app-shell app-center">
        <p className="app-note">불러오는 중…</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/app/login" replace />

  const role = profile?.role ?? 'student'

  return (
    <div className="app-shell">
      <header className="app-top">
        <div className="app-top-inner">
          <span className="app-brand">
            {site.name}
            <em>{role === 'admin' ? '관리자' : role === 'tutor' ? '튜터' : '수강생'}</em>
          </span>

          <nav className="app-nav">
            {role === 'admin' && (
              <>
                <NavLink to="/app/content">
                  <Type size={15} />
                  사이트 문구
                </NavLink>
                <NavLink to="/app/questions">
                  <ListChecks size={15} />
                  진단 문항
                </NavLink>
                <NavLink to="/app/applications">
                  <FileText size={15} />
                  신청서
                </NavLink>
              </>
            )}
          </nav>

          <button className="app-signout" onClick={() => signOut()}>
            <LogOut size={15} />
            로그아웃
          </button>
        </div>
      </header>

      <main className="app-main">
        {role === 'admin' ? (
          <Outlet />
        ) : (
          <div className="app-card">
            <h1>{profile?.name || '수강생'}님, 환영합니다</h1>
            <p>
              수강생·튜터 화면은 준비 중입니다. 공지·숙제·자료·질문 게시판이 곧 여기에
              들어옵니다.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
