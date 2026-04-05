import type { QRType } from '../../../shared/types'
import type { FormDataMap } from './qrBuilder'

export type FormErrors = Record<string, string>

export function validateUrl(data: FormDataMap['url']): FormErrors {
  const errors: FormErrors = {}
  const url = data.url.trim()
  if (!url) {
    errors.url = 'Informe uma URL'
    return errors
  }
  try {
    const full = url.startsWith('http') ? url : `https://${url}`
    const parsed = new URL(full)
    if (!parsed.hostname.includes('.')) throw new Error()
  } catch {
    errors.url = 'URL inválida. Ex: https://seusite.com.br'
  }
  return errors
}

export function validateTexto(data: FormDataMap['texto']): FormErrors {
  const errors: FormErrors = {}
  if (!data.texto.trim()) errors.texto = 'Informe um texto'
  return errors
}

export function validateWhatsApp(data: FormDataMap['whatsapp']): FormErrors {
  const errors: FormErrors = {}
  const digits = data.numero.replace(/\D/g, '')
  if (!digits) {
    errors.numero = 'Informe o número do WhatsApp'
  } else if (digits.length < 10 || digits.length > 15) {
    errors.numero = 'Número inválido. Inclua o código do país. Ex: 5511999999999'
  }
  return errors
}

export function validateWifi(data: FormDataMap['wifi']): FormErrors {
  const errors: FormErrors = {}
  if (!data.ssid.trim()) {
    errors.ssid = 'Informe o nome da rede (SSID)'
  }
  if (data.seguranca !== 'nopass') {
    if (!data.senha) {
      errors.senha = 'Informe a senha da rede'
    } else if (data.seguranca === 'WPA' && data.senha.length < 8) {
      errors.senha = 'A senha WPA deve ter no mínimo 8 caracteres'
    } else if (data.seguranca === 'WEP' && ![5, 10, 13, 26].includes(data.senha.length)) {
      errors.senha = 'Senha WEP inválida. Deve ter 5, 10, 13 ou 26 caracteres'
    }
  }
  return errors
}

export function validatePix(data: FormDataMap['pix']): FormErrors {
  const errors: FormErrors = {}

  const chave = data.chave.trim()
  if (!chave) {
    errors.chave = 'Informe a chave Pix'
  } else if (chave.includes('@')) {
    // Email key
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) {
      errors.chave = 'Chave e-mail inválida'
    }
  } else if (/^\+?\d[\d\s\-()]*$/.test(chave)) {
    // Phone or CPF/CNPJ key
    const digits = chave.replace(/\D/g, '')
    if (digits.length !== 11 && digits.length !== 14 && (digits.length < 10 || digits.length > 13)) {
      errors.chave = 'Chave inválida. CPF (11 dígitos), CNPJ (14) ou telefone com código do país'
    }
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave)) {
    // UUID random key — valid
  } else if (chave.length < 3 || chave.length > 77) {
    errors.chave = 'Chave Pix inválida'
  }

  if (!data.nome.trim()) {
    errors.nome = 'Informe o nome do recebedor'
  }

  const cidade = data.cidade.trim()
  if (!cidade) {
    errors.cidade = 'Informe a cidade'
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/.test(cidade)) {
    errors.cidade = 'Use apenas letras no nome da cidade'
  } else if (cidade.length < 2) {
    errors.cidade = 'Nome de cidade muito curto'
  }

  if (data.valor !== undefined && data.valor !== '') {
    const v = parseFloat(data.valor)
    if (isNaN(v)) {
      errors.valor = 'Valor inválido'
    } else if (v <= 0) {
      errors.valor = 'O valor deve ser maior que zero'
    }
  }

  return errors
}

export function validateEmail(data: FormDataMap['email']): FormErrors {
  const errors: FormErrors = {}
  if (!data.para.trim()) {
    errors.para = 'Informe o e-mail de destino'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.para.trim())) {
    errors.para = 'E-mail inválido'
  }
  return errors
}

export function validateTelefone(data: FormDataMap['telefone']): FormErrors {
  const errors: FormErrors = {}
  const digits = data.numero.replace(/\D/g, '')
  if (!digits) {
    errors.numero = 'Informe o número de telefone'
  } else if (digits.length < 10 || digits.length > 15) {
    errors.numero = 'Número inválido. Inclua o código do país. Ex: 5511999999999'
  }
  return errors
}

export function validateForm(type: QRType, data: FormDataMap[QRType]): FormErrors {
  switch (type) {
    case 'url':       return validateUrl(data as FormDataMap['url'])
    case 'texto':     return validateTexto(data as FormDataMap['texto'])
    case 'whatsapp':  return validateWhatsApp(data as FormDataMap['whatsapp'])
    case 'wifi':      return validateWifi(data as FormDataMap['wifi'])
    case 'pix':       return validatePix(data as FormDataMap['pix'])
    case 'email':     return validateEmail(data as FormDataMap['email'])
    case 'telefone':  return validateTelefone(data as FormDataMap['telefone'])
  }
}
