import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readRequestBody(req: any): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk: Buffer) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

function parseQuery(searchParams: URLSearchParams): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {}
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key)
    query[key] = values.length > 1 ? values : values[0]
  }
  return query
}

// vite dev 서버에서 api/*.js (Vercel 스타일 서버리스 함수)를 그대로 실행해주는 미들웨어.
// 배포(Vercel)에서는 이 플러그인 없이도 같은 파일이 그대로 서버리스 함수로 동작합니다.
// 이 플러그인은 로컬 개발 환경에서만 req/res를 Vercel 핸들러가 기대하는 모양으로 흉내내 줍니다.
function localApiPlugin(): Plugin {
  return {
    name: 'local-vercel-style-api',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next()
        }

        const url = new URL(req.url, 'http://localhost')
        const routeName = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '')

        // _lib 같은 내부 모듈이나 비정상 경로는 라우트로 취급하지 않음
        if (!routeName || routeName.split('/').some((seg) => seg.startsWith('_') || seg === '..')) {
          return next()
        }

        const fsPath = path.join(__dirname, 'api', `${routeName}.js`)
        if (!existsSync(fsPath)) {
          return next()
        }

        try {
          const mod = await server.ssrLoadModule(`/api/${routeName}.js`)
          const handler = mod.default

          if (typeof handler !== 'function') {
            throw new Error(`api/${routeName}.js 에 export default handler가 없습니다.`)
          }

          req.query = parseQuery(url.searchParams)

          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            req.body = await readRequestBody(req)
          }

          res.status = (code: number) => {
            res.statusCode = code
            return res
          }
          res.json = (payload: unknown) => {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            res.end(JSON.stringify(payload))
            return res
          }

          await handler(req, res)
        } catch (error) {
          console.error(`[api] /${routeName} 처리 중 오류:`, error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: '로컬 API 처리 중 오류가 발생했습니다.' }))
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // .env / .env.local 등에 있는 모든 변수를 읽어 Node 프로세스(process.env)에 채워 넣습니다.
  // Vite는 기본적으로 VITE_ 접두사가 없는 변수를 import.meta.env에 노출하지 않으므로,
  // api/*.js가 사용하는 process.env.FINNHUB_API_KEY / GROQ_API_KEY는 여기서 직접 주입해줘야 합니다.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), localApiPlugin()],
  }
})
