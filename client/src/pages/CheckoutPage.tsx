import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { Zap, Copy, Check, Loader2, CheckCircle, Lock, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const POLL_INTERVAL_MS = 5000
const PLAN_PRICE = 'R$ 14,99'

export default function CheckoutPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  // If already Pro, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user?.plan === 'pro') navigate('/dashboard', { replace: true })
  }, [user, authLoading, navigate])

  // Init checkout
  useEffect(() => {
    if (!user || user.plan === 'pro') return

    api.payments.checkout()
      .then(async data => {
        setPaymentId(data.id)
        setPixPayload(data.pixPayload)
        const url = await QRCode.toDataURL(data.pixPayload, {
          width: 260,
          margin: 2,
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(url)
      })
      .catch(e => setError(e.message ?? 'Erro ao gerar pagamento'))
      .finally(() => setIsLoading(false))
  }, [user])

  // Poll for payment confirmation
  useEffect(() => {
    if (!paymentId || confirmed) return

    pollRef.current = setInterval(async () => {
      try {
        const data = await api.payments.status(paymentId)
        if (data.status === 'confirmed') {
          clearInterval(pollRef.current!)
          setConfirmed(true)
          await refreshUser()
        }
      } catch {
        // silent — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [paymentId, confirmed, refreshUser])

  async function handleCopy() {
    if (!pixPayload) return
    await navigator.clipboard.writeText(pixPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo ao Pro!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Pagamento confirmado. Suas funcionalidades Pro já estão ativas.
        </p>
        <button
          onClick={() => navigate('/qr-dinamico')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors"
        >
          <Zap className="w-4 h-4" />
          Criar QR Dinâmico
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-sm font-medium mb-4">
          <Zap className="w-3.5 h-3.5" />
          Plano Pro
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Assinar via Pix</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Pagamento único · {PLAN_PRICE} · Acesso Pro imediato após confirmação
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          {/* QR Code */}
          <div className="flex justify-center mb-5">
            {qrDataUrl ? (
              <div className="p-3 rounded-xl border-2 border-brand-200 dark:border-brand-800 bg-white">
                <img src={qrDataUrl} alt="PIX QR Code" className="w-52 h-52 object-contain" />
              </div>
            ) : (
              <div className="w-[220px] h-[220px] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Instructions */}
          <ol className="space-y-2 mb-5 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">1</span>
              Abra seu app do banco e escolha <strong className="text-gray-900 dark:text-white">Pix</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">2</span>
              Escaneie o QR Code acima ou use <strong className="text-gray-900 dark:text-white">Pix Copia e Cola</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">3</span>
              Confirme o pagamento de <strong className="text-gray-900 dark:text-white">{PLAN_PRICE}</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">4</span>
              Aguarde — sua conta será atualizada automaticamente
            </li>
          </ol>

          {/* Copia e cola */}
          <button
            onClick={handleCopy}
            disabled={!pixPayload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 hover:border-brand-500 dark:hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-brand-700 dark:text-brand-400 font-medium text-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Pix Copia e Cola
              </>
            )}
          </button>

          {/* Polling indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Aguardando confirmação do pagamento...
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Lock className="w-3 h-3" />
        Pagamento processado com segurança via Pix (BACEN)
      </div>

      {/* Pending payment note */}
      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        Após o pagamento, a ativação ocorre em até alguns minutos.
        Em caso de dúvida, entre em contato pelo e-mail do suporte.
      </p>
    </div>
  )
}
