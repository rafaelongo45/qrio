import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Página não encontrada</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Essa página não existe, mas você pode gerar um QR Code.
      </p>
      <Link
        to="/gerador-qr-code"
        className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
      >
        Ir para o gerador
      </Link>
    </div>
  )
}
