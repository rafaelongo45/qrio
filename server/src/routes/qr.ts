import type { FastifyInstance } from 'fastify'
import QRCode from 'qrcode'
import { eq, desc, count } from 'drizzle-orm'
import { db } from '../db/index.js'
import { qrCodes } from '../db/schema.js'

interface GenerateBody {
  text: string
  fgColor?: string
  bgColor?: string
  width?: number
}

interface SaveBody {
  type: string
  data: Record<string, unknown>
  label?: string
  fgColor?: string
  bgColor?: string
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

export async function qrRoutes(app: FastifyInstance) {
  // POST /api/qr/generate — public, server-side QR generation
  app.post<{ Body: GenerateBody }>('/generate', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { text, fgColor = '#000000', bgColor = '#ffffff', width = 300 } = request.body

    if (!text?.trim()) {
      return reply.code(400).send({ error: 'text is required' })
    }
    if (fgColor && !HEX_COLOR_RE.test(fgColor)) {
      return reply.code(400).send({ error: 'fgColor deve ser um hex válido (#rrggbb)' })
    }
    if (bgColor && !HEX_COLOR_RE.test(bgColor)) {
      return reply.code(400).send({ error: 'bgColor deve ser um hex válido (#rrggbb)' })
    }
    if (width < 100 || width > 2048) {
      return reply.code(400).send({ error: 'width deve estar entre 100 e 2048' })
    }

    try {
      const opts: QRCode.QRCodeToDataURLOptions = {
        width,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: 'M',
      }

      const svgOpts: QRCode.QRCodeToStringOptions = {
        type: 'svg',
        margin: opts.margin,
        width: opts.width,
        color: opts.color,
        errorCorrectionLevel: opts.errorCorrectionLevel,
      }

      const [dataUrl, svgString] = await Promise.all([
        QRCode.toDataURL(text, opts),
        QRCode.toString(text, svgOpts),
      ])

      return { dataUrl, svgString }
    } catch {
      return reply.code(500).send({ error: 'Failed to generate QR code' })
    }
  })

  // POST /api/qr/save — requires auth
  app.post<{ Body: SaveBody }>('/save', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.send(err)
      }
    },
  }, async (request, reply) => {
    const { type, data, label, fgColor, bgColor } = request.body

    const ALLOWED_TYPES = ['url', 'texto', 'whatsapp', 'wifi', 'pix', 'email', 'telefone']
    if (!ALLOWED_TYPES.includes(type)) {
      return reply.code(400).send({ error: 'Tipo de QR inválido' })
    }

    const jwtPayload = request.user as { userId: string; plan: string }
    if (jwtPayload.plan !== 'pro') {
      const FREE_LIMIT = 5
      const [{ total }] = await db
        .select({ total: count() })
        .from(qrCodes)
        .where(eq(qrCodes.userId, jwtPayload.userId))
      if (Number(total) >= FREE_LIMIT) {
        return reply.code(403).send({ error: 'LIMIT_REACHED' })
      }
    }
    if (fgColor && !HEX_COLOR_RE.test(fgColor)) {
      return reply.code(400).send({ error: 'fgColor deve ser um hex válido (#rrggbb)' })
    }
    if (bgColor && !HEX_COLOR_RE.test(bgColor)) {
      return reply.code(400).send({ error: 'bgColor deve ser um hex válido (#rrggbb)' })
    }
    if (JSON.stringify(data).length > 4096) {
      return reply.code(400).send({ error: 'Dados do QR excedem o tamanho permitido' })
    }

    const [saved] = await db.insert(qrCodes).values({
      userId: jwtPayload.userId,
      type,
      label: label ?? null,
      data,
      fgColor: fgColor ?? null,
      bgColor: bgColor ?? null,
    }).returning()

    return reply.code(201).send(saved)
  })

  // GET /api/qr/my-codes — requires auth
  app.get('/my-codes', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.send(err)
      }
    },
  }, async (request, reply) => {
    const payload = request.user as { userId: string }

    const codes = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.userId, payload.userId))
      .orderBy(desc(qrCodes.createdAt))
      .limit(50)

    return codes
  })

}
