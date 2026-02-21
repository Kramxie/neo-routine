'use client';

import { forwardRef, useState } from 'react';

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Input = forwardRef(function Input(props, ref) {
  const {
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    icon,
    className = '',
    ...rest
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const inputId = name || 'input-' + Math.random().toString(36).substr(2, 9);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const togglePassword = () => {
    setShowPassword(function (prev) { return !prev; });
  };

  let inputClasses = 'w-full px-4 py-3 rounded-neo border-2 bg-white transition-all duration-200 placeholder:text-calm-400 focus:outline-none';

  if (icon) {
    inputClasses += ' pl-10';
  }

  if (isPasswordField) {
    inputClasses += ' pr-12';
  }

  if (error) {
    inputClasses += ' border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';
  } else {
    inputClasses += ' border-calm-200 focus:border-neo-400 focus:ring-2 focus:ring-neo-100';
  }

  if (disabled) {
    inputClasses += ' bg-calm-100 cursor-not-allowed opacity-60';
  }

  return (
    <div className={'w-full ' + className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-calm-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-calm-400">{icon}</span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? inputId + '-error' : undefined}
          className={inputClasses}
          {...rest}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-calm-400 hover:text-calm-600 transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error && (
        <p
          id={inputId + '-error'}
          className="mt-1 text-sm text-red-500 flex items-center"
          role="alert"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
