/**
 * public/ 폴더의 파일 주소를 만들어 줍니다.
 *
 * GitHub Pages처럼 하위 경로(/doganitang/)에 올릴 때도 이미지가 깨지지
 * 않도록, 배포 위치를 앞에 붙여줍니다. content.ts 에는 파일명만
 * 적으면 됩니다. 예) 'story-1.webp'
 */
export function asset(file: string): string {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`
}
