interface DateInputProps {
  label: string
  id: string
  required?: boolean
  errorMessage?: string[]
  defaultValue?: string
}

export default function DateInput(props: DateInputProps) {
  const { label, id, required, errorMessage, defaultValue } = props

  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="date"
          name={id}
          className="bg-gray-100 border-none leading-none text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-4"
          required={required}
          defaultValue={defaultValue}
        />
      </div>
      {errorMessage && <p className='text-red-600'>{errorMessage}</p>}
    </div>
  )
}