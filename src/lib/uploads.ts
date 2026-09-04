import { getClient, isBackendReady } from './supabase'

/**
 * 관리자 화면에서 고른 사진을 Supabase 저장소에 올리고,
 * 사이트에서 바로 쓸 수 있는 주소를 돌려줍니다.
 *
 * 저장소 이름과 권한은 supabase/schema.sql 에 만들어 둡니다.
 * (누구나 볼 수는 있고, 올리고 지우는 건 관리자만)
 */
export const BUCKET = 'site-media'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

/** 파일명을 주소로 써도 안전한 형태로 바꿉니다. (한글 파일명 대비) */
function safeName(name: string): string {
  const dot = name.lastIndexOf('.')
  const ext = (dot > -1 ? name.slice(dot + 1) : 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8)
  return `${stamp}-${random}.${ext || 'jpg'}`
}

export async function uploadImage(file: File): Promise<string> {
  if (!isBackendReady) {
    throw new Error('사진 올리기는 Supabase 연결이 필요합니다.')
  }
  if (!ALLOWED.includes(file.type)) {
    throw new Error('JPG · PNG · WEBP · GIF 사진만 올릴 수 있습니다.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('사진 한 장은 5MB까지 올릴 수 있습니다. 캡처를 줄여서 다시 올려주세요.')
  }

  const path = safeName(file.name)
  const client = getClient()

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw new Error(`사진을 올리지 못했습니다. (${error.message})`)

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
