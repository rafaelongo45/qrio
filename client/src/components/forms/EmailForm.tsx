import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['email']
  onChange: (data: FormDataMap['email']) => void
  errors?: FormErrors
}

export default function EmailForm({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          E-mail de destino
        </label>
        <input
          type="email"
          placeholder="contato@suaempresa.com.br"
          value={data.para}
          onChange={e => onChange({ ...data, para: e.target.value })}
          className={`input-field ${errors?.para ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors?.para && <p className="mt-1 text-xs text-red-500">{errors.para}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assunto <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          placeholder="Assunto do e-mail"
          value={data.assunto ?? ''}
          onChange={e => onChange({ ...data, assunto: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mensagem <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Corpo do e-mail..."
          value={data.corpo ?? ''}
          onChange={e => onChange({ ...data, corpo: e.target.value })}
          className="input-field resize-none"
        />
      </div>
    </div>
  )
}
