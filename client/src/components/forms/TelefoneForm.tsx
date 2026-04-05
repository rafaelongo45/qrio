import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['telefone']
  onChange: (data: FormDataMap['telefone']) => void
  errors?: FormErrors
}

export default function TelefoneForm({ data, onChange, errors }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Número de telefone
      </label>
      <input
        type="tel"
        placeholder="55 11 99999-9999"
        value={data.numero}
        onChange={e => onChange({ numero: e.target.value })}
        className={`input-field ${errors?.numero ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
      />
      {errors?.numero
        ? <p className="mt-1 text-xs text-red-500">{errors.numero}</p>
        : <p className="mt-1 text-xs text-gray-400">Inclua o código do país. Ex: 55 11 99999-9999 (Brasil)</p>
      }
    </div>
  )
}
