import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Zap, Shield, Download, ArrowRight, Star } from 'lucide-react'
import QRGenerator from '../components/QRGenerator'

const PLANS = [
  {
    name: 'Free',
    price: 'R$0',
    period: 'para sempre',
    description: 'Perfeito para testar e uso ocasional',
    features: [
      'QR Codes estáticos ilimitados',
      'Download em PNG e SVG',
      '7 tipos de QR Code',
      'Até 5 QR Codes salvos na conta',
      'Marca d\'água no download',
    ],
    cta: 'Começar grátis',
    href: '/gerador-qr-code',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$14,99',
    period: 'por mês',
    description: 'Para profissionais e pequenas empresas',
    features: [
      'Tudo do Free',
      'QR Codes dinâmicos (edite sem reimprimir)',
      'Análise de escaneamentos',
      'Sem marca d\'água no download',
      'Suporte por email (resposta em 24h)',
    ],
    cta: 'Assinar via Pix',
    href: '/assinar-pro',
    highlight: true,
  },
]

const USE_CASES = [
  { emoji: '🍕', title: 'Restaurantes', desc: 'QR Code no cardápio digital. Clientes acessam o menu pelo celular.' },
  { emoji: '💇', title: 'Barbearias', desc: 'Receba via Pix com QR Code. Sem maquininha, sem taxa.' },
  { emoji: '🛍️', title: 'Lojas', desc: 'QR Code para promoções, catálogo e WhatsApp de vendas.' },
  { emoji: '📡', title: 'Eventos', desc: 'Compartilhe Wi-Fi com QR Code. Sem digitar senha.' },
  { emoji: '💼', title: 'Freelancers', desc: 'QR Code no cartão de visita com seus contatos e portfólio.' },
  { emoji: '🏪', title: 'MEIs', desc: 'QR Code Pix no ponto de venda. Receba na hora.' },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'QRio — Gerador de QR Code Grátis para Brasileiros'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute('content', 'Crie QR Codes profissionais grátis: URL, Pix, WhatsApp, Wi-Fi e mais. Feito para MEIs, restaurantes, barbearias e freelancers brasileiros.')
    }
  }, [])

  return (
    <>
      {/* Hero + Generator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Geração com um clique · 100% grátis
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Crie QR Codes{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
              profissionais
            </span>{' '}
            de graça
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Gere QR Codes para Pix, WhatsApp, Wi-Fi, URL e muito mais. Sem cadastro, sem marca d'água, sem complicação.
          </p>
        </div>

        <QRGenerator />
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Download, value: 'Grátis', label: 'PNG e SVG' },
              { icon: Zap, value: 'Um clique', label: 'Geração instantânea' },
              { icon: Shield, value: 'Seguro', label: 'Dados protegidos' },
              { icon: Star, value: '7 tipos', label: 'De QR Code' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5 text-brand-500 mb-1" />
                <span className="font-bold text-gray-900 dark:text-white">{value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Feito para o Brasil real
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Do dono de restaurante ao freelancer — o QRio funciona pra todo mundo
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QR Type Links for SEO */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Todos os geradores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Gerador QR Code URL', to: '/gerador-qr-code-url' },
              { label: 'Gerador QR Code Pix', to: '/gerador-qr-code-pix' },
              { label: 'Gerador QR Code WhatsApp', to: '/gerador-qr-code-whatsapp' },
              { label: 'Gerador QR Code Wi-Fi', to: '/gerador-qr-code-wifi' },
              { label: 'Gerador QR Code E-mail', to: '/gerador-qr-code-email' },
              { label: 'Gerador QR Code Texto', to: '/gerador-qr-code-texto' },
              { label: 'Gerador QR Code Telefone', to: '/gerador-qr-code-telefone' },
              { label: 'Todos os tipos', to: '/gerador-qr-code' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 transition-all group"
              >
                {label}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Planos simples e transparentes
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Comece de graça. Evolua quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-brand-500 dark:border-brand-500 bg-brand-50 dark:bg-gray-800 shadow-lg'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-wide">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-colors ${
                  plan.highlight
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
