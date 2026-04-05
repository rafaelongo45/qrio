// EMV QR Code PIX payload builder (BACEN specification)

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

export interface PixPayloadOptions {
  key: string       // Chave PIX
  name: string      // Nome do recebedor (max 25 chars)
  city: string      // Cidade do recebedor (max 15 chars)
  amount: string    // Valor no formato "15.00"
  txid?: string     // Referência (max 25 chars, alphanumeric)
}

export function buildPixPayload({ key, name, city, amount, txid }: PixPayloadOptions): string {
  const merchantName = name.substring(0, 25).trim()
  const merchantCity = city.substring(0, 15).trim()
  const reference = (txid ?? '***').substring(0, 25).replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || '***'

  const pixKey = tlv('01', key)
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + pixKey
  const merchantAccount = tlv('26', merchantAccountInfo)

  let payload =
    tlv('00', '01') +
    merchantAccount +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', parseFloat(amount).toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', merchantName) +
    tlv('60', merchantCity) +
    tlv('62', tlv('05', reference))

  payload += tlv('63', crc16(payload + '6304'))

  return payload
}
