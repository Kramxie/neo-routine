'use client';

import Link from 'next/link';

/**
 * Button Component
 * Reusable button with primary and secondary variants
 * Matches Neo Routine's calm, water-inspired design
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-neo
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neo-300 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Variant styles
  const variants = {
    primary: 'bg-neo-500 text-white hover:bg-neo-600 shadow-neo hover:shadow-neo-lg',
    secondary: 'bg-white text-neo-600 border-2 border-neo-200 hover:border-neo-400 hover:bg-neo-50',
    outline: 'bg-transparent text-neo-600 border-2 border-neo-200 hover:border-neo-400 hover:bg-neo-50 dark:text-neo-300 dark:border-slate-600 dark:hover:border-neo-400 dark:hover:bg-slate-700',
    ghost: 'bg-transparent text-neo-600 hover:bg-neo-50',
    soft: 'bg-neo-100 text-neo-700 hover:bg-neo-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  // Size styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedStyles = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`.trim();
  const isDisabled = disabled || loading;

  // Render as link if href is provided
  if (href) {
    return (
      <Link href={href} className={combinedStyles} {...props}>
        {children}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={combinedStyles}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
