import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 링크를 공유했을 때 뜨는 미리보기 이미지는 절대 주소여야 합니다.
// 도메인을 사서 연결하면 이 값만 바꾸면 됩니다.
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://teamlesson.vercel.app/'

/** index.html 의 %VITE_SITE_URL% 자리를 실제 주소로 채웁니다. */
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
  plugins: [react(), siteUrlPlugin()],
})
