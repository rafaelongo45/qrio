import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['whatsapp']
  onChange: (data: FormDataMap['whatsapp']) => void
  errors?: FormErrors
}

export default function WhatsAppForm({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Número do WhatsApp
        </label>
        <input
          type="tel"
          placeholder="55 11 99999-9999"
          value={data.numero}
          onChange={e => onChange({ ...data, numero: e.target.value })}
          className={`input-field ${errors?.numero ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors?.numero
          ? <p className="mt-1 text-xs text-red-500">{errors.numero}</p>
          : <p className="mt-1 text-xs text-gray-400">Inclua o código do país (55 para Brasil)</p>
        }
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mensagem pré-definida <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Olá! Vim pelo QR Code e gostaria de..."
          value={data.mensagem ?? ''}
          onChange={e => onChange({ ...data, mensagem: e.target.value })}
          className="input-field resize-none"
        />
      </div>
    </div>
  )
}
