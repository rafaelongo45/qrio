import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { qrRoutes } from './routes/qr.js'
import { runMigrations } from './db/index.js'
import { authRoutes } from './routes/auth.js'
import { dynamicRoutes, handleRedirect } from './routes/dynamic.js'
import { paymentRoutes, adminRoutes } from './routes/payments.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true, // required for cookies cross-origin
})

await app.register(cookie)

await app.register(jwt, {
  secret: process.env.JWT_ACCESS_SECRET ?? (() => { throw new Error('JWT_ACCESS_SECRET is not set') })(),
})

// Global rate limit — fallback for any route not explicitly configured
await app.register(rateLimit, {
  global: true,
  max: 120,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'Muitas requisições. Tente novamente em instantes.',
  }),
})

// Routes
await app.register(qrRoutes,      { prefix: '/api/qr' })
await app.register(dynamicRoutes, { prefix: '/api/qr/dynamic' })
await app.register(authRoutes,    { prefix: '/api/auth' })
await app.register(paymentRoutes, { prefix: '/api/payments' })
await app.register(adminRoutes,   { prefix: '/api/admin' })

// Dynamic QR redirect — /r/:code → looks up shortCode and redirects
app.get('/r/:code', async (request, reply) => {
  const { code } = request.params as { code: string }
  const userAgent = request.headers['user-agent']
  return handleRedirect(app, code, userAgent, reply)
})

app.get('/health', async () => ({ status: 'ok', service: 'qrio-api' }))

const PORT = parseInt(process.env.PORT ?? '3001', 10)
try {
  await runMigrations()
  await app.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
