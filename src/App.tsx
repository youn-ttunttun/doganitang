import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Diagnostic from './pages/Diagnostic'
import Editor from './pages/Editor'
import Landing from './pages/Landing'
import AdminApplications from './pages/app/AdminApplications'
import AdminQuestions from './pages/app/AdminQuestions'
import AppShell from './pages/app/AppShell'
import Login from './pages/app/Login'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* 공개 영역 */}
        <Route path="/" element={<Landing />} />
        <Route path="/diagnostic" element={<Diagnostic />} />

        {/* 서버 없이 문항을 고치는 간이 편집기 (비밀번호로 잠금) */}
        <Route path="/edit" element={<Editor />} />

        {/* 로그인 영역 — 홍보 요소가 없는 별도 레이아웃 */}
        <Route path="/app/login" element={<Login />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/questions" replace />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="applications" element={<AdminApplications />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
