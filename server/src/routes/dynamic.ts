import { randomBytes } from 'crypto'
import { eq, desc, count, and } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { dynamicQRs, scanLogs } from '../db/schema.js'

function generateShortCode(): string {
  return randomBytes(4).toString('hex') // 8 hex chars, ~4 billion combinations
}

function isValidHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const requireAuth = async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.send(err)
  }
}

interface JWTPayload {
  userId: string
  email: string
  plan: string
}

export async function dynamicRoutes(app: FastifyInstance) {
  // POST /api/qr/dynamic — create (Pro only)
  app.post<{ Body: { redirectUrl: string; label?: string } }>(
    '/',
    { preHandler: requireAuth },
    async (request, reply) => {
      const payload = request.user as JWTPayload
      if (payload.plan !== 'pro') {
        return reply.code(403).send({ error: 'QR Codes dinâmicos são exclusivos do plano Pro' })
      }

      const { redirectUrl, label } = request.body
      if (!redirectUrl?.trim()) {
        return reply.code(400).send({ error: 'redirectUrl é obrigatório' })
      }
      if (!isValidHttpUrl(redirectUrl)) {
        return reply.code(400).send({ error: 'redirectUrl deve ser uma URL válida com http:// ou https://' })
      }

      // Generate a unique short code (retry on collision, extremely rare)
      let shortCode = generateShortCode()
      for (let i = 0; i < 5; i++) {
        const existing = await db
          .select({ id: dynamicQRs.id })
          .from(dynamicQRs)
          .where(eq(dynamicQRs.shortCode, shortCode))
          .limit(1)
        if (existing.length === 0) break
        shortCode = generateShortCode()
      }

      const [created] = await db
        .insert(dynamicQRs)
        .values({ userId: payload.userId, shortCode, redirectUrl, label: label ?? null })
        .returning()

      return reply.code(201).send(created)
    }
  )

  // GET /api/qr/dynamic — list user's dynamic QRs with scan count
  app.get('/', { preHandler: requireAuth }, async (request, reply) => {
    const payload = request.user as JWTPayload

    const codes = await db
      .select()
      .from(dynamicQRs)
      .where(eq(dynamicQRs.userId, payload.userId))
      .orderBy(desc(dynamicQRs.createdAt))
      .limit(50)

    // Fetch scan counts for all codes in parallel
    const withStats = await Promise.all(
      codes.map(async code => {
        const [{ totalScans }] = await db
          .select({ totalScans: count() })
          .from(scanLogs)
          .where(eq(scanLogs.qrId, code.id))
        return { ...code, totalScans: Number(totalScans) }
      })
    )

    return withStats
  })

  // PATCH /api/qr/dynamic/:id — update redirect URL or label
  app.patch<{ Params: { id: string }; Body: { redirectUrl?: string; label?: string } }>(
    '/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const payload = request.user as JWTPayload
      if (payload.plan !== 'pro') {
        return reply.code(403).send({ error: 'QR Codes dinâmicos são exclusivos do plano Pro' })
      }

      const { id } = request.params
      const { redirectUrl, label } = request.body
      if (redirectUrl !== undefined && !isValidHttpUrl(redirectUrl)) {
        return reply.code(400).send({ error: 'redirectUrl deve ser uma URL válida com http:// ou https://' })
      }

      const [existing] = await db
        .select()
        .from(dynamicQRs)
        .where(and(eq(dynamicQRs.id, id), eq(dynamicQRs.userId, payload.userId)))
        .limit(1)

      if (!existing) return reply.code(404).send({ error: 'QR Code não encontrado' })

      const updates: { redirectUrl?: string; label?: string | null } = {}
      if (redirectUrl !== undefined) updates.redirectUrl = redirectUrl
      if (label !== undefined) updates.label = label || null

      const [updated] = await db
        .update(dynamicQRs)
        .set(updates)
        .where(eq(dynamicQRs.id, id))
        .returning()

      return updated
    }
  )

  // DELETE /api/qr/dynamic/:id
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: requireAuth },
    async (request, reply) => {
      const payload = request.user as JWTPayload
      const { id } = request.params

      const [existing] = await db
        .select({ id: dynamicQRs.id })
        .from(dynamicQRs)
        .where(and(eq(dynamicQRs.id, id), eq(dynamicQRs.userId, payload.userId)))
        .limit(1)

      if (!existing) return reply.code(404).send({ error: 'QR Code não encontrado' })

      await db.delete(dynamicQRs).where(eq(dynamicQRs.id, id))
      return reply.code(204).send()
    }
  )

  // GET /api/qr/dynamic/:id/stats — scan count for a specific QR
  app.get<{ Params: { id: string } }>(
    '/:id/stats',
    { preHandler: requireAuth },
    async (request, reply) => {
      const payload = request.user as JWTPayload
      const { id } = request.params

      const [existing] = await db
        .select({ id: dynamicQRs.id })
        .from(dynamicQRs)
        .where(and(eq(dynamicQRs.id, id), eq(dynamicQRs.userId, payload.userId)))
        .limit(1)

      if (!existing) return reply.code(404).send({ error: 'QR Code não encontrado' })

      const [{ totalScans }] = await db
        .select({ totalScans: count() })
        .from(scanLogs)
        .where(eq(scanLogs.qrId, id))

      return { totalScans: Number(totalScans) }
    }
  )
}

// Exported separately — called from index.ts for the /r/:code redirect
export async function handleRedirect(
  app: FastifyInstance,
  shortCode: string,
  userAgent: string | undefined,
  reply: any
) {
  const [qr] = await db
    .select()
    .from(dynamicQRs)
    .where(eq(dynamicQRs.shortCode, shortCode))
    .limit(1)

  if (!qr) {
    return reply.code(404).send({ error: 'QR Code não encontrado' })
  }

  // Log the scan (fire-and-forget)
  db.insert(scanLogs)
    .values({ qrId: qr.id, userAgent: userAgent?.slice(0, 512) ?? null })
    .catch(() => {})

  return reply.redirect(qr.redirectUrl, 302)
}
