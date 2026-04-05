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

  // POST /api/admin/payments/:id/confirm  (curl / webhook / fetch da página de confirmação)
  app.post<{ Params: { id: string } }>('/payments/:id/confirm', async (request, reply) => {
    if (!checkSecret(request, reply)) return
    return confirmPayment(request.params.id, reply)
  })

  // GET /api/admin/payments/:id/confirm?secret=...  (link do Telegram — exibe página de confirmação)
  app.get<{ Params: { id: string } }>('/payments/:id/confirm', async (request, reply) => {
    if (!checkSecret(request, reply)) return
    const { id } = request.params
    const secret = encodeURIComponent((request.query as any).secret ?? '')
    return reply.type('text/html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirmar pagamento — QRio</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f5f3ff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .card{background:white;border-radius:16px;padding:32px;max-width:380px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  h1{font-size:1.25rem;color:#1f2937;margin:12px 0 6px}
  p{color:#6b7280;font-size:.9rem;margin:0 0 24px}
  button{background:#6d28d9;color:white;border:none;border-radius:10px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;width:100%}
  button:hover{background:#5b21b6}
  .icon{font-size:2.5rem}
</style>
</head>
<body>
<div class="card">
  <div class="icon">💰</div>
  <h1>Confirmar pagamento Pro</h1>
  <p>Clique no botão para ativar o plano Pro do usuário.</p>
  <button id="btn" onclick="confirm()">✅ Confirmar e ativar Pro</button>
</div>
<script>
async function confirm() {
  const btn = document.getElementById('btn')
  btn.disabled = true
  btn.textContent = 'Aguarde...'
  try {
    const res = await fetch('/api/admin/payments/${id}/confirm?secret=${secret}', { method: 'POST' })
    if (res.ok) {
      document.querySelector('.icon').textContent = '✅'
      document.querySelector('h1').textContent = 'Pro ativado!'
      document.querySelector('p').textContent = 'Usuário atualizado com sucesso.'
      btn.remove()
    } else {
      btn.textContent = 'Erro — tente novamente'
      btn.disabled = false
    }
  } catch {
    btn.textContent = 'Erro — tente novamente'
    btn.disabled = false
  }
}
</script>
</body>
</html>`)
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
