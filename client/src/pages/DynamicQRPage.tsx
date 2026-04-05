import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { Zap, Plus, Pencil, Trash2, Check, X, Download, BarChart2, Lock, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, type DynamicQR } from '../lib/api'

function QRMiniPreview({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    QRCode.toDataURL(url, { width: 160, margin: 1, errorCorrectionLevel: 'M' })
      .then(setDataUrl)
      .catch(() => {})
  }, [url])

  if (!dataUrl) {
    return (
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <img src={dataUrl} alt="QR Code" className="w-full aspect-square object-contain rounded-lg" />
}

function DynamicQRCard({
  qr,
  onUpdate,
  onDelete,
}: {
  qr: DynamicQR
  onUpdate: (id: string, data: { redirectUrl?: string; label?: string }) => Promise<void>
  onDelete: (id: string) => void
}) {
  const qrUrl = `${window.location.origin}/r/${qr.shortCode}`
  const [editing, setEditing] = useState(false)
  const [editUrl, setEditUrl] = useState(qr.redirectUrl)
  const [editLabel, setEditLabel] = useState(qr.label ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const date = new Date(qr.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  function startEdit() {
    setEditUrl(qr.redirectUrl)
    setEditLabel(qr.label ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function saveEdit() {
    if (!editUrl.trim()) {
      setError('URL é obrigatória')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onUpdate(qr.id, { redirectUrl: editUrl.trim(), label: editLabel.trim() })
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditing(false)
    setError('')
  }

  function downloadQR() {
    QRCode.toDataURL(qrUrl, { width: 300, margin: 2, errorCorrectionLevel: 'M' })
      .then(url => {
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-dinamico-${qr.shortCode}.png`
        a.click()
      })
      .catch(() => {})
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
      {/* QR Preview */}
      <div className="w-28 mx-auto">
        <QRMiniPreview url={qrUrl} />
      </div>

      {/* Label + date */}
      <div className="text-center">
        {editing ? (
          <input
            ref={inputRef}
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            placeholder="Nome (opcional)"
            className="w-full text-sm text-center bg-transparent border-b border-brand-400 outline-none text-gray-900 dark:text-white pb-0.5"
          />
        ) : (
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {qr.label || 'Sem nome'}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
      </div>

      {/* Scan count */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <BarChart2 className="w-3.5 h-3.5" />
        <span>{qr.totalScans} {qr.totalScans === 1 ? 'scan' : 'scans'}</span>
      </div>

      {/* Short URL */}
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 min-w-0">
        <span className="truncate flex-1">/r/{qr.shortCode}</span>
        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 hover:text-brand-600 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Redirect URL edit */}
      {editing ? (
        <div className="flex flex-col gap-1.5">
          <input
            value={editUrl}
            onChange={e => setEditUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-brand-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-1.5">
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Salvar
            </button>
            <button
              onClick={cancelEdit}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate text-center" title={qr.redirectUrl}>
          → {qr.redirectUrl}
        </p>
      )}

      {/* Actions */}
      {!editing && (
        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            PNG
          </button>
          <button
            onClick={startEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </button>
          <button
            onClick={() => onDelete(qr.id)}
            className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 text-gray-400 hover:text-red-500 text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function DynamicQRPage() {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isPro = user?.plan === 'pro'

  const [codes, setCodes] = useState<DynamicQR[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Create form
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || !isPro) {
      setIsLoading(false)
      return
    }
    api.dynamic.list()
      .then(setCodes)
      .catch(() => setError('Não foi possível carregar seus QR Codes dinâmicos'))
      .finally(() => setIsLoading(false))
  }, [user, isPro])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newUrl.trim()) {
      setCreateError('URL de destino é obrigatória')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const created = await api.dynamic.create(newUrl.trim(), newLabel.trim() || undefined)
      setCodes(prev => [{ ...created }, ...prev])
      setNewUrl('')
      setNewLabel('')
    } catch (e: any) {
      setCreateError(e.message ?? 'Erro ao criar QR Code')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdate(id: string, data: { redirectUrl?: string; label?: string }) {
    const updated = await api.dynamic.update(id, data)
    setCodes(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)))
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este QR Code dinâmico? Todos os scans anteriores serão perdidos.')) return
    await api.dynamic.delete(id).catch(() => {})
    setCodes(prev => prev.filter(c => c.id !== id))
  }

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Pro gate
  if (!isPro) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">QR Codes Dinâmicos</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Crie QR Codes que você pode redirecionar para qualquer URL a qualquer momento — sem reimprimir o QR.
          Acompanhe o número de scans em tempo real.
        </p>
        <a
          href="/#planos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors"
        >
          <Zap className="w-4 h-4" />
          Ver plano Pro
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            QR Codes Dinâmicos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Altere o destino a qualquer momento sem reimprimir o QR
          </p>
        </div>
      </div>

      {/* URL-only notice */}
      <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
        <span className="text-lg leading-none mt-0.5">⚠️</span>
        <div>
          <p className="font-semibold">Funciona apenas para sites (URLs)</p>
          <p className="mt-0.5 text-amber-700 dark:text-amber-400 font-normal">
            O QR dinâmico sempre redireciona para um endereço web — use para links como{' '}
            <span className="font-mono text-xs">https://seu-site.com</span>,{' '}
            cardápios, catálogos ou redes sociais. Não é compatível com PIX, Wi-Fi ou WhatsApp direto.
          </p>
        </div>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-8 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo QR Code Dinâmico
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Nome (opcional)"
            className="sm:w-44 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors"
          />
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 transition-colors"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Criar
          </button>
        </div>
        {createError && <p className="mt-2 text-xs text-red-500">{createError}</p>}
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {codes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-400">Nenhum QR dinâmico criado ainda</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Preencha o formulário acima para criar o primeiro
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {codes.map(qr => (
            <DynamicQRCard
              key={qr.id}
              qr={qr}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
