import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['wifi']
  onChange: (data: FormDataMap['wifi']) => void
  errors?: FormErrors
}

export default function WifiForm({ data, onChange, errors }: Props) {
  const [showSenha, setShowSenha] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome da rede (SSID)
        </label>
        <input
          type="text"
          placeholder="MinhaRede"
          value={data.ssid}
          onChange={e => onChange({ ...data, ssid: e.target.value })}
          className={`input-field ${errors?.ssid ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors?.ssid && <p className="mt-1 text-xs text-red-500">{errors.ssid}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de segurança
        </label>
        <select
          value={data.seguranca}
          onChange={e => onChange({ ...data, seguranca: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
          className="input-field"
        >
          <option value="WPA">WPA/WPA2 (recomendado)</option>
          <option value="WEP">WEP</option>
          <option value="nopass">Sem senha</option>
        </select>
      </div>
      {data.seguranca !== 'nopass' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha da rede
          </label>
          <div className="relative">
            <input
              type={showSenha ? 'text' : 'password'}
              placeholder="SuaSenha123"
              value={data.senha}
              onChange={e => onChange({ ...data, senha: e.target.value })}
              className={`input-field pr-10 ${errors?.senha ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowSenha(v => !v)}
              aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors?.senha && <p className="mt-1 text-xs text-red-500">{errors.senha}</p>}
        </div>
      )}
    </div>
  )
}
