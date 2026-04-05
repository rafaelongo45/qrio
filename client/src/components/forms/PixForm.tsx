import type { FormDataMap } from '../../utils/qrBuilder'
import type { FormErrors } from '../../utils/validators'

type Props = {
  data: FormDataMap['pix']
  onChange: (data: FormDataMap['pix']) => void
  errors?: FormErrors
}

export default function PixForm({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chave Pix
        </label>
        <input
          type="text"
          placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
          value={data.chave}
          onChange={e => onChange({ ...data, chave: e.target.value })}
          className={`input-field ${errors?.chave ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
        />
        {errors?.chave
          ? <p className="mt-1 text-xs text-red-500">{errors.chave}</p>
          : <p className="mt-1 text-xs text-gray-400">Qualquer tipo de chave Pix cadastrada no seu banco</p>
        }
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome do recebedor
        </label>
        <input
          type="text"
          placeholder="João Silva"
          value={data.nome}
          onChange={e => onChange({ ...data, nome: e.target.value })}
          className={`input-field ${errors?.nome ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
          maxLength={25}
        />
        {errors?.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cidade
          </label>
          <input
            type="text"
            placeholder="São Paulo"
            value={data.cidade}
            onChange={e => onChange({ ...data, cidade: e.target.value })}
            className={`input-field ${errors?.cidade ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
            maxLength={15}
          />
          {errors?.cidade && <p className="mt-1 text-xs text-red-500">{errors.cidade}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            placeholder="0,00"
            min="0.01"
            step="0.01"
            value={data.valor ?? ''}
            onChange={e => onChange({ ...data, valor: e.target.value })}
            className={`input-field ${errors?.valor ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
          />
          {errors?.valor && <p className="mt-1 text-xs text-red-500">{errors.valor}</p>}
        </div>
      </div>
    </div>
  )
}
