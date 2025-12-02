import React, { forwardRef } from "react";

const Input = forwardRef(function Input({
  id,
  name,
  label = 'Input',
  hint,
  error,
  type = 'text',
  placeholder = 'Write your input',
  value,
  onChange,
  onChangeValue,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  ...rest
}, ref) {
  const handleChange = onChange || onChangeValue;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-1.5 text-sm text-slate-400">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <LeftIcon size={16} />
          </span>
        )}

        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-slate-800/50 border border-slate-600
            text-white placeholder-slate-500
            focus:outline-none focus:border-indigo-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${LeftIcon ? 'pl-10' : ''}
            ${RightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${inputClassName}
          `}
          {...rest}
        />

        {RightIcon && (
          <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <RightIcon size={16} />
          </button>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
})

export default Input
