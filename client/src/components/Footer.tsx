import { Link } from 'react-router-dom'
import { QrCode } from 'lucide-react'

const generators = [
  { label: 'QR Code URL', to: '/gerador-qr-code-url' },
  { label: 'QR Code Pix', to: '/gerador-qr-code-pix' },
  { label: 'QR Code WhatsApp', to: '/gerador-qr-code-whatsapp' },
  { label: 'QR Code Wi-Fi', to: '/gerador-qr-code-wifi' },
  { label: 'QR Code E-mail', to: '/gerador-qr-code-email' },
  { label: 'QR Code Texto', to: '/gerador-qr-code-texto' },
  { label: 'QR Code Telefone', to: '/gerador-qr-code-telefone' },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                QR<span className="text-brand-600 dark:text-brand-400">io</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Gere QR Codes profissionais de graça. Feito para pequenos empresários, MEIs e freelancers brasileiros.
            </p>
          </div>

          {/* Generators */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
              Geradores
            </h3>
            <ul className="space-y-2">
              {generators.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
              Produto
            </h3>
            <ul className="space-y-2">
              <li><Link to="/#planos" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Planos e Preços</Link></li>
              <li><Link to="/#como-funciona" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Como Funciona</Link></li>
              <li><Link to="/politica-de-privacidade" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} QRio. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Feito com ❤️ para o mercado brasileiro
          </p>
        </div>
      </div>
    </footer>
  )
}
