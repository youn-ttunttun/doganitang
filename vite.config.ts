import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 배포 위치
//  - Vercel·커스텀 도메인: 루트에 올라가므로 기본값 '/' 그대로
//  - GitHub Pages 하위 경로: 워크플로에서 VITE_BASE=/저장소이름/ 을 넘겨줍니다
const BASE = process.env.VITE_BASE ?? '/'

// 링크를 공유했을 때 뜨는 미리보기 이미지는 절대 주소여야 합니다.
// 값이 없으면 아래 기본값을 씁니다. (도메인을 사면 여기만 바꾸면 됩니다)
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://teamlesson.vercel.app/'

/**
 * index.html 의 %VITE_SITE_URL% 을 실제 주소로 바꿉니다.
 * Vite는 환경 변수가 없으면 이 자리를 그대로 두기 때문에, 값이 없을 때도
 * 미리보기가 깨지지 않도록 여기서 직접 채웁니다.
 */
function siteUrlPlugin(): Plugin {
  return {
    name: 'site-url',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replaceAll('%VITE_SITE_URL%', SITE_URL)
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), siteUrlPlugin()],
})
