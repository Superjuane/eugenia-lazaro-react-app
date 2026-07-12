import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'
import {
  createGalleryGroup,
  createGalleryItem,
  deleteGalleryGroup,
  deleteGalleryItem,
  getGalleryPayload,
  updateGalleryGroup,
  updateGalleryItem,
} from './api/_supabaseGallery'
import type { GalleryCreateInput } from './src/shared/types/gallery'

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

function writeJson(response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, statusCode: number, body: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

function parseRequestPath(request: IncomingMessage, mountPath: string) {
  const originalUrl = (request as IncomingMessage & { originalUrl?: string }).originalUrl
  const rawUrl = originalUrl?.startsWith(mountPath) ? originalUrl.slice(mountPath.length) || '/' : request.url || '/'
  return new URL(rawUrl, 'http://local').pathname
}

function hydrateProcessEnv(env: Record<string, string>) {
  const keys = [
    'SUPABASE_URL',
    'SUPABASE_REST_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_STORAGE_BUCKET',
  ]

  keys.forEach((key) => {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key]
    }
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  hydrateProcessEnv(env)
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

        server.middlewares.use('/api/gallery/groups', async (request, response) => {
          const pathName = parseRequestPath(request, '/api/gallery/groups')
          const cookies = parseCookies(request.headers.cookie)
          const authenticated = cookies[adminCookieName] === 'local-dev-session'

          try {
            if (request.method === 'POST' && pathName === '/') {
              if (!authenticated) {
                writeJson(response, 401, { error: 'Unauthorized' })
                return
              }

              const payload = JSON.parse((await readRequestBody(request)) || '{}') as { label?: string }
              writeJson(response, 201, await createGalleryGroup(payload.label ?? ''))
              return
            }

            const id = decodeURIComponent(pathName.replace(/^\//, ''))

            if (!id) {
              writeJson(response, 404, { error: 'Not found' })
              return
            }

            if (!authenticated) {
              writeJson(response, 401, { error: 'Unauthorized' })
              return
            }

            if (request.method === 'PATCH') {
              const payload = JSON.parse((await readRequestBody(request)) || '{}') as { label?: string }
              writeJson(response, 200, await updateGalleryGroup(id, payload.label ?? ''))
              return
            }

            if (request.method === 'DELETE') {
              await deleteGalleryGroup(id)
              writeJson(response, 200, { ok: true })
              return
            }

            writeJson(response, 405, { error: 'Method not allowed' })
          } catch (error) {
            writeJson(response, 500, { error: error instanceof Error ? error.message : 'Gallery group request failed' })
          }
        })

        server.middlewares.use('/api/gallery', async (request, response) => {
          const pathName = parseRequestPath(request, '/api/gallery')
          const cookies = parseCookies(request.headers.cookie)
          const authenticated = cookies[adminCookieName] === 'local-dev-session'

          try {
            if (request.method === 'GET' && pathName === '/') {
              writeJson(response, 200, await getGalleryPayload(authenticated))
              return
            }

            if (request.method === 'POST' && pathName === '/') {
              if (!authenticated) {
                writeJson(response, 401, { error: 'Unauthorized' })
                return
              }

              const payload = JSON.parse((await readRequestBody(request)) || '{}') as GalleryCreateInput
              writeJson(response, 201, await createGalleryItem(payload))
              return
            }

            const id = decodeURIComponent(pathName.replace(/^\//, ''))

            if (!id) {
              writeJson(response, 404, { error: 'Not found' })
              return
            }

            if (!authenticated) {
              writeJson(response, 401, { error: 'Unauthorized' })
              return
            }

            if (request.method === 'PATCH') {
              const payload = JSON.parse((await readRequestBody(request)) || '{}') as Record<string, unknown>
              writeJson(response, 200, await updateGalleryItem(id, payload))
              return
            }

            if (request.method === 'DELETE') {
              await deleteGalleryItem(id)
              writeJson(response, 200, { ok: true })
              return
            }

            writeJson(response, 405, { error: 'Method not allowed' })
          } catch (error) {
            writeJson(response, 500, { error: error instanceof Error ? error.message : 'Gallery request failed' })
          }
        })
      },
    },
  ],
  }
})
