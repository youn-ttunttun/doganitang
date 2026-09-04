import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ContentProvider } from './lib/siteContent'
import Landing from './pages/Landing'

/**
 * 첫 화면(홍보 페이지)만 바로 불러오고, 진단 테스트와 관리자 화면은
 * 눌렀을 때 따로 불러옵니다. 수식 표시(KaTeX)처럼 무거운 것이
 * 홍보 페이지 속도를 잡아먹지 않게 하기 위해서입니다.
 */
const Diagnostic = lazy(() => import('./pages/Diagnostic'))
const Login = lazy(() => import('./pages/app/Login'))
const AppShell = lazy(() => import('./pages/app/AppShell'))
const AdminContent = lazy(() => import('./pages/app/AdminContent'))
const AdminQuestions = lazy(() => import('./pages/app/AdminQuestions'))
const AdminApplications = lazy(() => import('./pages/app/AdminApplications'))

function Loading() {
  return (
    <p className="app-note app-note--page">
      <Loader2 size={16} className="spin" /> 불러오는 중…
    </p>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* 공개 영역 */}
            <Route path="/" element={<Landing />} />
            <Route path="/diagnostic" element={<Diagnostic />} />

            {/* 로그인 영역 — 홍보 요소가 없는 별도 레이아웃 */}
            <Route path="/app/login" element={<Login />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/content" replace />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="applications" element={<AdminApplications />} />
            </Route>

            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ContentProvider>
  )
}
