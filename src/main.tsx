import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// 404.html에서 넘어온 경우 원래 주소로 되돌려 놓습니다. (GitHub Pages 대응)
try {
  const redirect = sessionStorage.getItem('teamlesson:redirect')
  if (redirect) {
    sessionStorage.removeItem('teamlesson:redirect')
    if (redirect !== window.location.pathname) history.replaceState(null, '', redirect)
  }
} catch {
  // 저장소 접근이 막혀 있으면 그냥 첫 화면으로 둡니다.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
