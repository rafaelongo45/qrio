import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['url']
  onChange: (data: FormDataMap['url']) => void
  errors?: FormErrors
}

export default function UrlForm({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL do site
        </label>
        <input
          type="url"
          placeholder="https://seusite.com.br"
          value={data.url}
          onChange={e => onChange({ url: e.target.value })}
          className={`input-field ${errors?.url ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors?.url
          ? <p className="mt-1 text-xs text-red-500">{errors.url}</p>
          : <p className="mt-1 text-xs text-gray-400">Ex: https://instagram.com/seuperfil</p>
        }
      </div>
    </div>
  )
}
