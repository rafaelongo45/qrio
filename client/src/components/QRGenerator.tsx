import { useState, useMemo } from 'react'
import { Download, Loader2, Palette, Link, MessageCircle, Wifi, CreditCard, Mail, Phone, Type, QrCode, Lock } from 'lucide-react'
import clsx from 'clsx'
import type { QRType } from '../../../shared/types'
import { buildQRString, type FormDataMap } from '../utils/qrBuilder'
import { validateForm, type FormErrors } from '../utils/validators'
import { useQRCode } from '../hooks/useQRCode'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import UrlForm from './forms/UrlForm'
import TextoForm from './forms/TextoForm'
import WhatsAppForm from './forms/WhatsAppForm'
import WifiForm from './forms/WifiForm'
import PixForm from './forms/PixForm'
import EmailForm from './forms/EmailForm'
import TelefoneForm from './forms/TelefoneForm'

const TABS: { type: QRType; label: string; icon: React.ElementType }[] = [
  { type: 'url', label: 'URL', icon: Link },
  { type: 'texto', label: 'Texto', icon: Type },
  { type: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { type: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { type: 'pix', label: 'Pix', icon: CreditCard },
  { type: 'email', label: 'E-mail', icon: Mail },
  { type: 'telefone', label: 'Telefone', icon: Phone },
]

const DEFAULT_FORM_DATA: FormDataMap = {
  url: { url: '' },
  texto: { texto: '' },
  whatsapp: { numero: '', mensagem: '' },
  wifi: { ssid: '', senha: '', seguranca: 'WPA' },
  pix: { chave: '', nome: '', cidade: '', valor: '' },
  email: { para: '', assunto: '', corpo: '' },
  telefone: { numero: '' },
}

interface Props {
  defaultType?: QRType
}

export default function QRGenerator({ defaultType = 'url' }: Props) {
  const { user } = useAuth()
  const isPro = user?.plan === 'pro'

  const [activeType, setActiveType] = useState<QRType>(defaultType)
  const [formData, setFormData] = useState<FormDataMap>({ ...DEFAULT_FORM_DATA })
  const [errors, setErrors] = useState<FormErrors>({})
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [limitReached, setLimitReached] = useState(false)

  // Only updated when user clicks "Gerar QR Code"
  const [committedText, setCommittedText] = useState('')
  const [committedStyle, setCommittedStyle] = useState({ fgColor: '#000000', bgColor: '#ffffff' })

  const { dataUrl, isGenerating, downloadPNG, downloadSVG } = useQRCode(committedText, committedStyle, { isPro })

  const currentText = useMemo(
    () => buildQRString(activeType, formData[activeType] as FormDataMap[QRType]),
    [activeType, formData]
  )

  function updateForm<T extends QRType>(type: T, data: FormDataMap[T]) {
    setFormData(prev => ({ ...prev, [type]: data }))
    setErrors({})
  }

  function handleTabChange(type: QRType) {
    setActiveType(type)
    setErrors({})
  }

  function handleGenerate() {
    const validationErrors = validateForm(activeType, formData[activeType] as FormDataMap[QRType])
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setCommittedText(currentText)
    if (isPro) setCommittedStyle({ fgColor, bgColor })

    // Save silently in background if logged in
    if (user) {
      const colors = isPro ? { fgColor, bgColor } : {}
      api.qr.save(activeType, formData[activeType], undefined, colors.fgColor, colors.bgColor)
        .then(() => setLimitReached(false))
        .catch((err: Error) => {
          if (err.message === 'LIMIT_REACHED') setLimitReached(true)
        })
    }
  }

  const canGenerate = currentText.trim().length > 0

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Form */}
      <div className="flex-1 min-w-0">
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {TABS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => handleTabChange(type)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center min-w-fit cursor-pointer',
                activeType === type
                  ? 'bg-white dark:bg-gray-900 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {TABS.find(t => t.type === activeType)?.label}
          </h2>

          {activeType === 'url' && (
            <UrlForm data={formData.url} onChange={d => updateForm('url', d)} errors={errors} />
          )}
          {activeType === 'texto' && (
            <TextoForm data={formData.texto} onChange={d => updateForm('texto', d)} errors={errors} />
          )}
          {activeType === 'whatsapp' && (
            <WhatsAppForm data={formData.whatsapp} onChange={d => updateForm('whatsapp', d)} errors={errors} />
          )}
          {activeType === 'wifi' && (
            <WifiForm data={formData.wifi} onChange={d => updateForm('wifi', d)} errors={errors} />
          )}
          {activeType === 'pix' && (
            <PixForm data={formData.pix} onChange={d => updateForm('pix', d)} errors={errors} />
          )}
          {activeType === 'email' && (
            <EmailForm data={formData.email} onChange={d => updateForm('email', d)} errors={errors} />
          )}
          {activeType === 'telefone' && (
            <TelefoneForm data={formData.telefone} onChange={d => updateForm('telefone', d)} errors={errors} />
          )}

          {/* Colors */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Palette className="w-4 h-4" />
                Personalizar cores
              </div>
              {isPro ? (
                <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold">
                  PRO ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold">
                  <Lock className="w-3 h-3" />
                  PRO
                </span>
              )}
            </div>

            {isPro ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cor do QR</span>
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={e => setFgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fgColor}</span>
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cor de fundo</span>
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{bgColor}</span>
                  </div>
                </label>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Cores personalizadas disponíveis no plano Pro
              </p>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                Gerar QR Code
              </>
            )}
          </button>

          {limitReached && (
            <a
              href="/#planos"
              className="mt-3 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 hover:border-amber-400 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Limite de 5 QR Codes atingido</span>
                <span className="text-xs text-amber-700 dark:text-amber-400">O QR foi gerado, mas não foi salvo. Assine o Pro para salvar ilimitado.</span>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-md bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-bold transition-colors">
                Ver Pro →
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div className="lg:w-72 xl:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm sticky top-24">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Preview
          </h3>

          {/* QR Preview Area */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 mb-4 overflow-hidden">
            {isGenerating && (
              <div className="aspect-square w-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Gerando...</span>
              </div>
            )}
            {!isGenerating && dataUrl && (
              <div className="w-full flex flex-col items-center">
                <img
                  src={dataUrl}
                  alt="QR Code gerado"
                  className="w-full object-contain p-2"
                />
                {!isPro && (
                  <div className="w-full py-1.5 text-center bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">qrio.app</span>
                  </div>
                )}
              </div>
            )}
            {!isGenerating && !dataUrl && (
              <div className="aspect-square w-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600 px-4 text-center">
                <div className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-xs">Preencha e clique em "Gerar QR Code"</p>
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="space-y-2">
            <button
              onClick={downloadPNG}
              disabled={!dataUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar PNG
            </button>
            <button
              onClick={downloadSVG}
              disabled={!dataUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar SVG
            </button>
          </div>

          {dataUrl && !isPro && (
            <a
              href="/#planos"
              className="mt-3 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-brand-50 dark:bg-gray-800 border border-brand-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">Remover marca d'água</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Desbloqueie cores e mais no Pro</span>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-md bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-bold transition-colors">
                Ver Pro →
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
