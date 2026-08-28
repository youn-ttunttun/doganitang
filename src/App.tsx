import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Diagnostic from './pages/Diagnostic'
import Landing from './pages/Landing'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
        {/* 2단계에서 /app 아래에 수강생·튜터·관리자 화면이 들어갑니다. */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
