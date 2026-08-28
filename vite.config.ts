import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages의 하위 경로(예: user.github.io/Teamlesson/)에 배포한다면
// 아래 base를 '/저장소이름/'으로 바꾸세요. Vercel·Netlify·커스텀 도메인은 '/' 그대로 둡니다.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
