export type QRType = 'url' | 'texto' | 'whatsapp' | 'wifi' | 'pix' | 'email' | 'telefone'

export interface QRStyleConfig {
  fgColor: string
  bgColor: string
  cornerRadius: number // 0 = square, 1 = rounded, 2 = dots
}

export interface QRCodeRecord {
  id: string
  userId: string
  type: QRType
  data: string
  styleConfig: QRStyleConfig
  isDynamic: boolean
  shortCode?: string
  redirectUrl?: string
  createdAt: string
}

export interface QRGenerateRequest {
  type: QRType
  data: string
  styleConfig?: Partial<QRStyleConfig>
}

export interface QRGenerateResponse {
  dataUrl: string
  svgString: string
}

// Per-type form data shapes
export interface UrlData { url: string }
export interface TextoData { texto: string }
export interface WhatsAppData { numero: string; mensagem?: string }
export interface WifiData { ssid: string; senha: string; seguranca: 'WPA' | 'WEP' | 'nopass' }
export interface PixData { chave: string; nome: string; cidade: string; valor?: string }
export interface EmailData { para: string; assunto?: string; corpo?: string }
export interface TelefoneData { numero: string }

export type QRFormData =
  | UrlData
  | TextoData
  | WhatsAppData
  | WifiData
  | PixData
  | EmailData
  | TelefoneData
