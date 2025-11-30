export default function FormField({ 
  label, 
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children ? (
        children
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register}
          {...props}
        />
      )}
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
