import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'

function readRequestBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=')

    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join('='))
    }

    return cookies
  }, {})
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminUsername = env.ADMIN_USERNAME ?? 'admin'
  const adminPassword = env.ADMIN_PASSWORD ?? 'admin'
  const adminCookieName = 'eugenia_admin_session'

  return {
  plugins: [
    react(),
    {
      name: 'local-contact-api',
      configureServer(server) {
        server.middlewares.use('/api/contact', async (request, response) => {
          if (request.method !== 'POST') {
            response.statusCode = 405
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const body = await readRequestBody(request)
          const payload = JSON.parse(body || '{}') as { name?: string; email?: string; message?: string }

          if (!payload.name || !payload.email || !payload.message) {
            response.statusCode = 400
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Missing required fields' }))
            return
          }

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              ok: true,
              delivered: false,
              mode: 'local-dev',
              message:
                'Mensaje recibido en Vite local. Para enviar email real, ejecuta la función en Vercel con RESEND_API_KEY o CONTACT_WEBHOOK_URL.',
            }),
          )
        })

        server.middlewares.use('/api/admin/login', async (request, response) => {
          if (request.method !== 'POST') {
            response.statusCode = 405
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const body = await readRequestBody(request)
          const payload = JSON.parse(body || '{}') as { username?: string; password?: string }

          if (payload.username !== adminUsername || payload.password !== adminPassword) {
            response.statusCode = 401
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Invalid credentials' }))
            return
          }

          response.statusCode = 200
          response.setHeader('Set-Cookie', `${adminCookieName}=local-dev-session; Path=/; SameSite=Lax; Max-Age=604800`)
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true, username: adminUsername }))
        })

        server.middlewares.use('/api/admin/session', (request, response) => {
          if (request.method !== 'GET') {
            response.statusCode = 405
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const cookies = parseCookies(request.headers.cookie)
          const authenticated = cookies[adminCookieName] === 'local-dev-session'

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ authenticated, username: authenticated ? adminUsername : null }))
        })

        server.middlewares.use('/api/admin/logout', (request, response) => {
          if (request.method !== 'POST') {
            response.statusCode = 405
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          response.statusCode = 200
          response.setHeader('Set-Cookie', `${adminCookieName}=; Path=/; SameSite=Lax; Max-Age=0`)
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true }))
        })
      },
    },
  ],
  }
})
