import { eq, and, desc } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { payments, users } from '../db/schema.js'
import { buildPixPayload } from '../utils/pix.js'
import { sendTelegram } from '../utils/telegram.js'

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001'

const PIX_KEY  = process.env.PIX_KEY  ?? ''
const PIX_NAME = process.env.PIX_NAME ?? 'QRio'
const PIX_CITY = process.env.PIX_CITY ?? 'Sao Paulo'
const PLAN_PRICE = '14.99'

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

function makePixPayload(paymentId: string): string {
  const txid = paymentId.replace(/-/g, '').substring(0, 25)
  return buildPixPayload({
    key: PIX_KEY,
    name: PIX_NAME,
    city: PIX_CITY,
    amount: PLAN_PRICE,
    txid,
  })
}

export async function paymentRoutes(app: FastifyInstance) {
  // POST /api/payments/checkout — creates or returns existing pending payment
  app.post('/checkout', {
    preHandler: requireAuth,
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const payload = request.user as JWTPayload

    // Block if already Pro
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    if (user?.plan === 'pro') {
      return reply.code(409).send({ error: 'Você já possui o plano Pro' })
    }

    // Reuse existing pending payment if any
    const [existing] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.userId, payload.userId), eq(payments.status, 'pending')))
      .orderBy(desc(payments.createdAt))
      .limit(1)

    const payment = existing ?? (await db
      .insert(payments)
      .values({ userId: payload.userId, amount: PLAN_PRICE })
      .returning()
      .then(rows => rows[0]))

    const confirmUrl = `${SERVER_URL}/api/admin/payments/${payment.id}/confirm?secret=${process.env.ADMIN_SECRET}`
    sendTelegram(
      `💰 Pagamento Pix QRio\nUsuário: ${user.email}\nValor: R$ ${PLAN_PRICE}`,
      confirmUrl
    )

    const status = existing ? 200 : 201
    return reply.code(status).send({
      id: payment.id,
      pixPayload: makePixPayload(payment.id),
      amount: payment.amount,
      status: payment.status,
    })
  })

  // GET /api/payments/status/:id — poll a specific payment by ID
  app.get<{ Params: { id: string } }>('/status/:id', { preHandler: requireAuth }, async (request, reply) => {
    const payload = request.user as JWTPayload
    const { id } = request.params

    const [payment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.userId, payload.userId)))
      .limit(1)

    if (!payment) return reply.code(404).send({ error: 'Pagamento não encontrado' })

    return { id: payment.id, status: payment.status, amount: payment.amount }
  })
}

// Admin route registered separately (no /api/payments prefix confusion)
export async function adminRoutes(app: FastifyInstance) {
  // Shared confirm logic
  async function confirmPayment(id: string, reply: any) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1)
    if (!payment) return reply.code(404).send({ error: 'Pagamento não encontrado' })
    if (payment.status === 'confirmed') return reply.code(409).send({ error: 'Pagamento já confirmado' })

    const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await db.update(payments).set({ status: 'confirmed' }).where(eq(payments.id, id))
    await db.update(users).set({ plan: 'pro', planExpiresAt }).where(eq(users.id, payment.userId))

    return { ok: true, userId: payment.userId, paymentId: id }
  }

  function checkSecret(request: any, reply: any): boolean {
    const fromHeader = request.headers['x-admin-secret']
    const fromQuery  = (request.query as any).secret
    if (fromHeader === process.env.ADMIN_SECRET || fromQuery === process.env.ADMIN_SECRET) return true
    reply.code(403).send({ error: 'Acesso negado' })
    return false
  }

  // POST /api/admin/payments/:id/confirm  (curl / webhook)
  app.post<{ Params: { id: string } }>('/payments/:id/confirm', async (request, reply) => {
    if (!checkSecret(request, reply)) return
    return confirmPayment(request.params.id, reply)
  })

  // GET /api/admin/payments/:id/confirm?secret=...  (link do WhatsApp)
  app.get<{ Params: { id: string } }>('/payments/:id/confirm', async (request, reply) => {
    if (!checkSecret(request, reply)) return
    const result = await confirmPayment(request.params.id, reply)
    if (result && 'ok' in result) {
      return reply.type('text/html').send(
        `<h2>✅ Pagamento confirmado!</h2><p>Usuário ativado no plano Pro.</p>`
      )
    }
  })

  // GET /api/admin/payments — list all payments
  app.get('/payments', async (request, reply) => {
    const adminSecret = request.headers['x-admin-secret']
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return reply.code(403).send({ error: 'Acesso negado' })
    }

    const all = await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(100)

    return all
  })
}
