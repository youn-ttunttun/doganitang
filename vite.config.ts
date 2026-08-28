import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages의 하위 경로(youn-ttunttun.github.io/doganitang/)에 올릴 때는
// base가 '/doganitang/' 여야 합니다. 배포 워크플로에서 VITE_BASE로 넘겨줍니다.
// 커스텀 도메인이나 Vercel에 올릴 때는 기본값 '/' 그대로 두면 됩니다.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
