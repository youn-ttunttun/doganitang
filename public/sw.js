// My Stock Lab 서비스워커
// - 홈 화면 설치(PWA)를 위해 필요한 최소한의 서비스워커입니다.
// - 시세/분석 데이터(/api/*)는 항상 최신값이 중요하므로 캐시하지 않고 네트워크로 직접 보냅니다.
// - 그 외 정적 자원(HTML/JS/CSS/아이콘)은 "네트워크 우선, 실패 시 캐시" 전략을 사용합니다.

const CACHE_VERSION = 'mystocklab-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((error) => console.warn('[sw] 앱 셸 캐시 실패:', error)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return // POST 등은 그대로 네트워크로

  const url = new URL(request.url)

  // 같은 출처가 아니거나 API 요청이면 캐시 없이 그대로 네트워크 사용
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
  )
})
