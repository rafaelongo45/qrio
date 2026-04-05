import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { QrCode, Link as LinkIcon, MessageCircle, Wifi, CreditCard, Mail, Phone, Type, Download, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, type SavedQR } from '../lib/api'
import { buildQRString } from '../utils/qrBuilder'
import type { QRType } from '../../../shared/types'
import type { FormDataMap } from '../utils/qrBuilder'

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  url:      { label: 'URL',      icon: LinkIcon },
  texto:    { label: 'Texto',    icon: Type },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  wifi:     { label: 'Wi-Fi',    icon: Wifi },
  pix:      { label: 'Pix',      icon: CreditCard },
  email:    { label: 'E-mail',   icon: Mail },
  telefone: { label: 'Telefone', icon: Phone },
}

function QRPreviewCard({ code }: { code: SavedQR }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [svgString, setSvgString] = useState<string | null>(null)
  const meta = TYPE_META[code.type] ?? { label: code.type, icon: QrCode }
  const Icon = meta.icon
  const date = new Date(code.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const fgColor = code.fgColor ?? '#000000'
  const bgColor = code.bgColor ?? '#ffffff'

  useEffect(() => {
    try {
      const text = buildQRString(
        code.type as QRType,
        code.data as FormDataMap[QRType]
      )
      if (!text.trim()) return

      const opts = {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M' as const,
        color: { dark: fgColor, light: bgColor },
      }

      Promise.all([
        QRCode.toDataURL(text, opts),
        QRCode.toString(text, { ...opts, type: 'svg' as const }),
      ])
        .then(([url, svg]) => {
          setDataUrl(url)
          setSvgString(svg)
        })
        .catch(() => {})
    } catch {
      // invalid saved data — skip
    }
  }, [code, fgColor, bgColor])

  function handleDownloadPNG() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qrcode-${code.type}-${code.id.slice(0, 8)}.png`
    a.click()
  }

  function handleDownloadSVG() {
    if (!svgString) return
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qrcode-${code.type}-${code.id.slice(0, 8)}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
      {/* QR Image */}
      <div
        className="flex items-center justify-center p-4 aspect-square"
        style={{ backgroundColor: bgColor }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" className="w-full h-full object-contain" />
        ) : (
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-brand-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {code.label || meta.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={handleDownloadPNG}
            disabled={!dataUrl}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            PNG
          </button>
          <button
            onClick={handleDownloadSVG}
            disabled={!svgString}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            SVG
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [codes, setCodes] = useState<SavedQR[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    api.qr.myCodes()
      .then(setCodes)
      .catch(() => setError('Não foi possível carregar seus QR Codes'))
      .finally(() => setIsLoading(false))
  }, [user])

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus QR Codes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.plan === 'pro' && (
            <Link
              to="/qr-dinamico"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Dinâmicos
            </Link>
          )}
          <Link
            to="/gerador-qr-code"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Novo QR Code
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && codes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Nenhum QR Code salvo ainda</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Gere seu primeiro QR Code e ele aparecerá aqui automaticamente
          </p>
          <Link
            to="/gerador-qr-code"
            className="mt-6 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Criar QR Code
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {codes.map(code => (
            <QRPreviewCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  )
}
