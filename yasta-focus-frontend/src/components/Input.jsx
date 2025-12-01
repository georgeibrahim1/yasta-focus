import React from "react";

export default function Input ({
  id,
  name,
  label = 'Input',
  hint,
  error,
  type = 'text',
  placeholder = 'Write your input',
  value,
  onChangeValue,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
}) {
  const handleChange = onChangeValue;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-[var(--spacing-xs)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          {label}
          {required ? <span className="text-[var(--color-error)]">*</span> : null}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <LeftIcon size={16} />
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`w-full input-base ${LeftIcon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''} ${error ? 'border-[var(--color-error)]' : ''} ${inputClassName}`}
        />

        {RightIcon && (
          <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <RightIcon size={16} />
          </button>
        )}
      </div>

      {hint && !error && (
        <p className="mt-[var(--spacing-xs)] text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="mt-[var(--spacing-xs)] text-[var(--font-size-xs)] text-[var(--color-error)]">{error}</p>
      )}
    </div>
  )
}
