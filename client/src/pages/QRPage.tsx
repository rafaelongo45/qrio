import { useEffect } from 'react'
import type { QRType } from '../../../shared/types'
import QRGenerator from '../components/QRGenerator'

const META: Record<string, { title: string; description: string; h1: string }> = {
  url: {
    title: 'Gerador de QR Code para URL | QRio',
    description: 'Crie QR Codes para links e sites grátis. Redirecione clientes para seu site, cardápio digital ou loja online com um simples escaneamento.',
    h1: 'Gerador de QR Code para URL',
  },
  pix: {
    title: 'Gerador de QR Code Pix | QRio',
    description: 'Gere QR Code Pix grátis para receber pagamentos instantâneos. Ideal para MEIs, restaurantes e comércios.',
    h1: 'Gerador de QR Code Pix',
  },
  whatsapp: {
    title: 'Gerador de QR Code WhatsApp | QRio',
    description: 'Crie QR Code para abrir conversa no WhatsApp com mensagem pré-definida. Atenda clientes mais rápido.',
    h1: 'Gerador de QR Code WhatsApp',
  },
  wifi: {
    title: 'Gerador de QR Code Wi-Fi | QRio',
    description: 'Gere QR Code para compartilhar a senha do Wi-Fi. Clientes conectam automaticamente sem digitar a senha.',
    h1: 'Gerador de QR Code Wi-Fi',
  },
  email: {
    title: 'Gerador de QR Code E-mail | QRio',
    description: 'Crie QR Code para e-mail com assunto e mensagem pré-definidos. Facilite o contato com seus clientes.',
    h1: 'Gerador de QR Code E-mail',
  },
  texto: {
    title: 'Gerador de QR Code Texto | QRio',
    description: 'Gere QR Code com texto livre. Compartilhe informações, endereços e mensagens de forma simples.',
    h1: 'Gerador de QR Code Texto',
  },
  telefone: {
    title: 'Gerador de QR Code Telefone | QRio',
    description: 'Crie QR Code com número de telefone. Clientes ligam direto ao escanear.',
    h1: 'Gerador de QR Code Telefone',
  },
  default: {
    title: 'Gerador de QR Code Grátis | QRio',
    description: 'Crie QR Codes profissionais grátis: URL, Pix, WhatsApp, Wi-Fi, E-mail e mais. Não precisa fazer cadastro.',
    h1: 'Gerador de QR Code Grátis',
  },
}

interface Props {
  defaultType?: string
}

export default function QRPage({ defaultType }: Props) {
  const meta = META[defaultType ?? 'default'] ?? META.default

  useEffect(() => {
    document.title = meta.title
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', meta.description)
  }, [meta])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {meta.h1}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {meta.description}
        </p>
      </div>

      <QRGenerator defaultType={defaultType as QRType | undefined} />

      {/* SEO content */}
      <div className="mt-16 prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Como usar o QRio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Preencha o formulário', desc: 'Escolha o tipo de QR Code e preencha as informações necessárias.' },
            { step: '2', title: 'Gere com um clique', desc: 'Clique em "Gerar QR Code" e o resultado aparece na hora.' },
            { step: '3', title: 'Baixe e use', desc: 'Faça o download em PNG ou SVG e use onde quiser.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
