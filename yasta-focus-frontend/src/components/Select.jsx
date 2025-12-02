import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select({
  id,
  name,
  label = 'Select',
  hint,
  error,
  value,
  onChange,
  onChangeValue,
  options = [],
  placeholder = 'Select an option',
  leftIcon: LeftIcon,
  className = '',
  selectClassName = '',
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

        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer
            bg-slate-800/50 border border-slate-600
            text-white
            focus:outline-none focus:border-indigo-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${LeftIcon ? 'pl-10' : ''}
            pr-10
            ${error ? 'border-red-500' : ''}
            ${selectClassName}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <ChevronDown size={16} />
        </span>
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

export default Select
