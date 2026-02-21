/**
 * Card Component
 * Flexible container with soft shadow and rounded corners
 * Matches Neo Routine's calm, water-inspired design
 */

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hover = false,
  ...props
}) {
  // Variant styles
  const variants = {
    default: 'bg-white border border-calm-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100',
    elevated: 'bg-white shadow-neo dark:bg-slate-800 dark:shadow-none dark:border dark:border-slate-700 dark:text-slate-100',
    outlined: 'bg-transparent border-2 border-calm-200 dark:border-slate-600 dark:text-slate-100',
    gradient: 'bg-gradient-water border border-neo-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100',
    dark: 'bg-calm-800 text-white border border-calm-700',
  };

  // Padding styles
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover effect
  const hoverStyles = hover
    ? 'cursor-pointer transition-all duration-200 hover:shadow-neo-lg hover:-translate-y-1'
    : '';

  // Clickable styles
  const clickableStyles = onClick
    ? 'cursor-pointer'
    : '';

  return (
    <div
      className={`
        rounded-neo
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component
 * Optional header section for cards
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 pb-4 border-b border-calm-100 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title Component
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-calm-800 dark:text-slate-100 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * Card Description Component
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-calm-600 dark:text-slate-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * Card Content Component
 * Main content area
 */
export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer Component
 * Optional footer section for actions
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-calm-100 ${className}`}>
      {children}
    </div>
  );
}
