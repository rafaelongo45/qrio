import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { eq, and, gt } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { users, refreshTokens } from '../db/schema.js'

const ACCESS_TOKEN_TTL  = 15 * 60          // 15 minutes (seconds)
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days (seconds)
const COOKIE_NAME = 'qrio_refresh'

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge,
  }
}

async function generateRefreshToken(userId: string): Promise<string> {
  const raw = randomBytes(64).toString('hex')
  const hash = await bcrypt.hash(raw, 10)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)

  await db.insert(refreshTokens).values({ userId, tokenHash: hash, expiresAt })
  return raw
}

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register
  app.post<{ Body: { email: string; password: string } }>(
    '/register',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 hour' },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.code(400).send({ error: 'E-mail e senha são obrigatórios' })
      }
      if (password.length < 8) {
        return reply.code(400).send({ error: 'A senha deve ter no mínimo 8 caracteres' })
      }

      const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
      if (existing.length > 0) {
        return reply.code(409).send({ error: 'E-mail já cadastrado' })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const [user] = await db.insert(users).values({
        email: email.toLowerCase(),
        passwordHash,
      }).returning()

      const accessToken = app.jwt.sign(
        { userId: user.id, email: user.email, plan: user.plan },
        { expiresIn: ACCESS_TOKEN_TTL }
      )
      const refreshToken = await generateRefreshToken(user.id)

      reply.setCookie(COOKIE_NAME, refreshToken, cookieOpts(REFRESH_TOKEN_TTL))
      return { accessToken, user: { id: user.id, email: user.email, plan: user.plan } }
    }
  )

  // POST /api/auth/login
  app.post<{ Body: { email: string; password: string } }>(
    '/login',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '15 minutes' },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.code(400).send({ error: 'E-mail e senha são obrigatórios' })
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
      if (!user) {
        return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
      }

      const accessToken = app.jwt.sign(
        { userId: user.id, email: user.email, plan: user.plan },
        { expiresIn: ACCESS_TOKEN_TTL }
      )
      const refreshToken = await generateRefreshToken(user.id)

      reply.setCookie(COOKIE_NAME, refreshToken, cookieOpts(REFRESH_TOKEN_TTL))
      return { accessToken, user: { id: user.id, email: user.email, plan: user.plan } }
    }
  )

  // POST /api/auth/refresh
  app.post('/refresh', async (request, reply) => {
    const raw = request.cookies[COOKIE_NAME]
    if (!raw) {
      return reply.code(401).send({ error: 'Refresh token não encontrado' })
    }

    // Find candidate tokens (not expired) and verify hash
    const now = new Date()
    const candidates = await db
      .select()
      .from(refreshTokens)
      .where(gt(refreshTokens.expiresAt, now))

    let matched: typeof candidates[0] | null = null
    for (const candidate of candidates) {
      if (await bcrypt.compare(raw, candidate.tokenHash)) {
        matched = candidate
        break
      }
    }

    if (!matched) {
      reply.clearCookie(COOKIE_NAME, { path: '/api/auth' })
      return reply.code(401).send({ error: 'Refresh token inválido ou expirado' })
    }

    // Rotate: delete old token, issue new ones
    await db.delete(refreshTokens).where(eq(refreshTokens.id, matched.id))

    const [user] = await db.select().from(users).where(eq(users.id, matched.userId)).limit(1)
    if (!user) {
      return reply.code(401).send({ error: 'Usuário não encontrado' })
    }

    // Auto-downgrade if Pro plan has expired
    if (user.plan === 'pro' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      await db.update(users).set({ plan: 'free', planExpiresAt: null }).where(eq(users.id, user.id))
      user.plan = 'free'
    }

    const accessToken = app.jwt.sign(
      { userId: user.id, email: user.email, plan: user.plan },
      { expiresIn: ACCESS_TOKEN_TTL }
    )
    const newRefreshToken = await generateRefreshToken(user.id)

    reply.setCookie(COOKIE_NAME, newRefreshToken, cookieOpts(REFRESH_TOKEN_TTL))
    return { accessToken, user: { id: user.id, email: user.email, plan: user.plan } }
  })

  // POST /api/auth/logout
  app.post('/logout', async (request, reply) => {
    const raw = request.cookies[COOKIE_NAME]
    if (raw) {
      // Best-effort: remove from DB (don't fail if not found)
      const candidates = await db.select().from(refreshTokens)
      for (const candidate of candidates) {
        if (await bcrypt.compare(raw, candidate.tokenHash)) {
          await db.delete(refreshTokens).where(eq(refreshTokens.id, candidate.id))
          break
        }
      }
    }
    reply.clearCookie(COOKIE_NAME, { path: '/api/auth' })
    return { ok: true }
  })
}
