/**
 * 이미지 주소를 만들어 줍니다.
 *
 * 두 가지를 모두 받습니다.
 *  1) 관리자 화면에서 올린 사진 — 이미 전체 주소(https://…)라 그대로 씁니다.
 *  2) public/ 폴더에 직접 넣은 파일 — 파일명만 적으면 배포 위치를 앞에 붙입니다.
 */
export function asset(file: string): string {
  if (/^(https?:)?\/\//.test(file) || file.startsWith('data:') || file.startsWith('blob:')) {
    return file
  }
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`
}
