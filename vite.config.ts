import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
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
      },
    },
  ],
})
