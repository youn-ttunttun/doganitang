// GitHub Pages는 /diagnostic 같은 주소를 직접 열면 404를 냅니다.
// 404.html을 index.html과 같게 만들어 두면, 주소를 그대로 유지한 채
// 앱이 뜨고 라우터가 알아서 화면을 찾아갑니다.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html 생성 완료 (SPA 새로고침 대응)')
