interface TimeInputProps {
  label: string
  id: string
  required?: boolean
  errorMessage?: string[]
  defaultValue?: string
}

export default function TimeInput(props: TimeInputProps) {
  const { label, id, required, errorMessage, defaultValue } = props

  return <div className="relative">
    <label
      htmlFor={id}
      className="block mb-2 text-sm font-medium text-gray-900"
    >
      {label}
    </label>
    <input
      id={id}
      type="time"
      name={id}
      className="bg-gray-100 border-none leading-none  text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-4"
      required={required}
      defaultValue={defaultValue}
    />
    {errorMessage && <p className='text-red-600'>{errorMessage}</p>}
  </div>
}