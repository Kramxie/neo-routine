'use client';

import { forwardRef } from 'react';

/**
 * Input Component
 * Reusable input field with label, error state, and icons
 * Matches Neo Routine's calm, water-inspired design
 */

const Input = forwardRef(function Input(
  {
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
    ...props
  },
  ref
) {
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
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
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 rounded-neo border-2 bg-white
            transition-all duration-200
            placeholder:text-calm-400
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
              : 'border-calm-200 focus:border-neo-400 focus:ring-2 focus:ring-neo-100'
            }
            ${disabled 
              ? 'bg-calm-100 cursor-not-allowed opacity-60' 
              : ''
            }
            focus:outline-none
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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
