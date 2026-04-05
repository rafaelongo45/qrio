import type { QRType } from '../../../shared/types'

interface UrlData { url: string }
interface TextoData { texto: string }
interface WhatsAppData { numero: string; mensagem?: string }
interface WifiData { ssid: string; senha: string; seguranca: 'WPA' | 'WEP' | 'nopass' }
interface PixData { chave: string; nome: string; cidade: string; valor?: string }
interface EmailData { para: string; assunto?: string; corpo?: string }
interface TelefoneData { numero: string }

export type FormDataMap = {
  url: UrlData
  texto: TextoData
  whatsapp: WhatsAppData
  wifi: WifiData
  pix: PixData
  email: EmailData
  telefone: TelefoneData
}

export function buildQRString(type: QRType, data: FormDataMap[QRType]): string {
  switch (type) {
    case 'url': {
      const d = data as UrlData
      if (!d.url) return ''
      const url = d.url.startsWith('http') ? d.url : `https://${d.url}`
      return url
    }
    case 'texto': {
      const d = data as TextoData
      return d.texto
    }
    case 'whatsapp': {
      const d = data as WhatsAppData
      if (!d.numero) return ''
      const num = d.numero.replace(/\D/g, '')
      const msg = d.mensagem ? encodeURIComponent(d.mensagem) : ''
      return `https://wa.me/${num}${msg ? `?text=${msg}` : ''}`
    }
    case 'wifi': {
      const d = data as WifiData
      if (!d.ssid) return ''
      const pwd = d.seguranca === 'nopass' ? '' : d.senha
      return `WIFI:T:${d.seguranca};S:${d.ssid};P:${pwd};;`
    }
    case 'pix': {
      const d = data as PixData
      if (!d.chave) return ''
      return buildPixPayload(d)
    }
    case 'email': {
      const d = data as EmailData
      if (!d.para) return ''
      const parts = [`mailto:${d.para}`]
      const params: string[] = []
      if (d.assunto) params.push(`subject=${encodeURIComponent(d.assunto)}`)
      if (d.corpo) params.push(`body=${encodeURIComponent(d.corpo)}`)
      if (params.length) parts.push(`?${params.join('&')}`)
      return parts.join('')
    }
    case 'telefone': {
      const d = data as TelefoneData
      if (!d.numero) return ''
      const num = d.numero.replace(/\D/g, '')
      return `tel:+${num}`
    }
  }
}

// EMV Pix QR Code payload builder
function buildPixPayload({ chave, nome, cidade, valor }: PixData): string {
  const merchantName = nome.substring(0, 25).padEnd(0, ' ').trim()
  const merchantCity = cidade.substring(0, 15).trim()

  const pixKey = tlv('01', chave)
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + pixKey
  const merchantAccount = tlv('26', merchantAccountInfo)

  let payload =
    tlv('00', '01') +          // Payload Format Indicator
    merchantAccount +           // Merchant Account Information
    tlv('52', '0000') +        // Merchant Category Code
    tlv('53', '986') +         // Transaction Currency (BRL)
    (valor && parseFloat(valor) > 0 ? tlv('54', parseFloat(valor).toFixed(2)) : '') +
    tlv('58', 'BR') +           // Country Code
    tlv('59', merchantName) +   // Merchant Name
    tlv('60', merchantCity) +   // Merchant City
    tlv('62', tlv('05', '***')) // Additional Data Field (referência)

  payload += tlv('63', crc16(payload + '6304'))

  return payload
}

function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${tag}${len}${value}`
}

function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}
