'use client';

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
    ghost: 'bg-transparent text-neo-600 hover:bg-neo-50',
    soft: 'bg-neo-100 text-neo-700 hover:bg-neo-200',
  };

  // Size styles
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  // Render as link if href is provided
  if (href) {
    return (
      <a href={href} className={combinedStyles} {...props}>
        {children}
      </a>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  );
}
