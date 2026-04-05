import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'

const QR_SIZE = 300
const WATERMARK_HEIGHT = 28
const WATERMARK_LABEL = 'qrio.app'

interface QRStyle {
  fgColor: string
  bgColor: string
}

interface UseQRCodeResult {
  dataUrl: string | null
  svgString: string | null
  isGenerating: boolean
  downloadPNG: () => void
  downloadSVG: () => void
}

interface UseQRCodeOptions {
  isPro?: boolean
}

function addPNGWatermark(dataUrl: string, bgColor: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = QR_SIZE
      canvas.height = QR_SIZE + WATERMARK_HEIGHT
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(img, 0, 0)

      ctx.fillStyle = bgColor
      ctx.fillRect(0, QR_SIZE, QR_SIZE, WATERMARK_HEIGHT)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '11px Inter, ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(WATERMARK_LABEL, QR_SIZE / 2, QR_SIZE + WATERMARK_HEIGHT / 2)

      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
}

function addSVGWatermark(svgString: string, bgColor: string): string {
  // Wrap the original SVG as an embedded image to avoid coordinate system conflicts.
  // The qrcode lib uses module-count units in viewBox (e.g. "0 0 37 37"), not pixels.
  const encoded = `data:image/svg+xml,${encodeURIComponent(svgString)}`
  const total = QR_SIZE + WATERMARK_HEIGHT
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${QR_SIZE}" height="${total}" viewBox="0 0 ${QR_SIZE} ${total}">
  <image href="${encoded}" x="0" y="0" width="${QR_SIZE}" height="${QR_SIZE}"/>
  <rect x="0" y="${QR_SIZE}" width="${QR_SIZE}" height="${WATERMARK_HEIGHT}" fill="${bgColor}"/>
  <text x="${QR_SIZE / 2}" y="${QR_SIZE + WATERMARK_HEIGHT / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#9ca3af">${WATERMARK_LABEL}</text>
</svg>`
}

export function useQRCode(text: string, style: QRStyle, { isPro = false }: UseQRCodeOptions = {}): UseQRCodeResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [svgString, setSvgString] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl(null)
      setSvgString(null)
      return
    }

    setIsGenerating(true)

    const opts: QRCode.QRCodeToDataURLOptions = {
      width: QR_SIZE,
      margin: 2,
      color: { dark: style.fgColor, light: style.bgColor },
      errorCorrectionLevel: 'M',
    }

    const svgOpts: QRCode.QRCodeToStringOptions = {
      type: 'svg',
      margin: opts.margin,
      width: opts.width,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel,
    }

    Promise.all([
      QRCode.toDataURL(text, opts),
      QRCode.toString(text, svgOpts),
    ])
      .then(([url, svg]) => {
        setDataUrl(url)
        setSvgString(svg)
      })
      .catch(() => {
        setDataUrl(null)
        setSvgString(null)
      })
      .finally(() => setIsGenerating(false))
  }, [text, style.fgColor, style.bgColor])

  const downloadPNG = useCallback(async () => {
    if (!dataUrl) return
    const finalUrl = isPro ? dataUrl : await addPNGWatermark(dataUrl, style.bgColor)
    const a = document.createElement('a')
    a.href = finalUrl
    a.download = 'qrcode-qrio.png'
    a.click()
  }, [dataUrl, style.bgColor, isPro])

  const downloadSVG = useCallback(() => {
    if (!svgString) return
    const content = isPro ? svgString : addSVGWatermark(svgString, style.bgColor)
    const blob = new Blob([content], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode-qrio.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [svgString, style.bgColor, isPro])

  return { dataUrl, svgString, isGenerating, downloadPNG, downloadSVG }
}
