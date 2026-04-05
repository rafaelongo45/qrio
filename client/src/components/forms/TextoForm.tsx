import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['texto']
  onChange: (data: FormDataMap['texto']) => void
  errors?: FormErrors
}

export default function TextoForm({ data, onChange, errors }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Texto livre
      </label>
      <textarea
        rows={4}
        placeholder="Digite qualquer texto que desejar..."
        value={data.texto}
        onChange={e => onChange({ texto: e.target.value })}
        className={`input-field resize-none ${errors?.texto ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
      />
      {errors?.texto
        ? <p className="mt-1 text-xs text-red-500">{errors.texto}</p>
        : <p className="mt-1 text-xs text-gray-400">{data.texto.length} caracteres</p>
      }
    </div>
  )
}
