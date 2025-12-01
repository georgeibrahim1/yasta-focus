import React from "react";

export default function Select({
  id,
  name,
  label = 'Select',
  hint,
  error,
  value,
  onChangeValue,
  options = [],
  placeholder = 'Select an option',
  leftIcon: LeftIcon,
  className = '',
  selectClassName = '',
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

        <select
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`w-full input-base appearance-none cursor-pointer ${LeftIcon ? 'pl-10' : ''} pr-10 ${error ? 'border-[var(--color-error)]' : ''} ${selectClassName}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
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
