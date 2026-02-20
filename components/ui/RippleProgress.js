'use client';

/**
 * RippleProgress Component
 * Visualizes progress as expanding ripples in water
 * Calm, pressure-free alternative to streak counters
 */

export default function RippleProgress({
  percent = 0,
  size = 'md',
  label = 'Progress',
  sublabel,
  showRipples = true,
  className = '',
}) {
  // Size configurations
  const sizes = {
    sm: {
      container: 'w-20 h-20',
      text: 'text-xl',
      subtext: 'text-xs',
    },
    md: {
      container: 'w-32 h-32',
      text: 'text-3xl',
      subtext: 'text-xs',
    },
    lg: {
      container: 'w-40 h-40',
      text: 'text-4xl',
      subtext: 'text-sm',
    },
    xl: {
      container: 'w-48 h-48',
      text: 'text-5xl',
      subtext: 'text-sm',
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Calculate water level (how full the circle is)
  const waterLevel = Math.min(100, Math.max(0, percent));

  // Determine color intensity based on progress
  const getProgressColor = () => {
    if (waterLevel === 0) return 'text-calm-400';
    if (waterLevel < 25) return 'text-neo-400';
    if (waterLevel < 50) return 'text-neo-500';
    if (waterLevel < 75) return 'text-neo-600';
    return 'text-neo-700';
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Main circle container */}
      <div
        className={`
          ${sizeConfig.container}
          relative rounded-full overflow-hidden
          bg-gradient-to-b from-neo-50 to-neo-100
          flex items-center justify-center
        `}
      >
        {/* Water fill effect */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neo-400/40 to-neo-300/20 transition-all duration-1000 ease-out"
          style={{ height: `${waterLevel}%` }}
        >
          {/* Wave effect at top of water */}
          <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden">
            <svg
              className="absolute w-[200%] h-full animate-[wave_3s_ease-in-out_infinite]"
              viewBox="0 0 1440 20"
              preserveAspectRatio="none"
            >
              <path
                fill="rgba(14, 165, 233, 0.3)"
                d="M0,10 C360,20 720,0 1440,10 L1440,20 L0,20 Z"
              />
            </svg>
          </div>
        </div>

        {/* Ripple animations */}
        {showRipples && waterLevel > 0 && (
          <>
            <div
              className="absolute inset-4 border-2 border-neo-300 rounded-full opacity-0 animate-ripple"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="absolute inset-4 border-2 border-neo-300 rounded-full opacity-0 animate-ripple"
              style={{ animationDelay: '0.6s' }}
            />
            <div
              className="absolute inset-4 border-2 border-neo-300 rounded-full opacity-0 animate-ripple"
              style={{ animationDelay: '1.2s' }}
            />
          </>
        )}

        {/* Center content */}
        <div className="relative z-10 text-center">
          <div className={`font-bold ${sizeConfig.text} ${getProgressColor()}`}>
            {Math.round(waterLevel)}%
          </div>
          {sublabel && (
            <p className={`${sizeConfig.subtext} text-calm-500 mt-0.5`}>
              {sublabel}
            </p>
          )}
        </div>
      </div>

      {/* Label below */}
      {label && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-calm-600 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Mini ripple indicator for inline use
 */
export function RippleDot({ completed = false, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center
        transition-all duration-300
        ${completed ? 'bg-neo-500 shadow-neo' : 'bg-calm-200'}
      `}
    >
      {completed && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}

/**
 * Weekly progress visual (7 dots)
 */
export function WeeklyRipples({ data = [], className = '' }) {
  // We intentionally don't trust array order coming from the API.
  // Some environments can shift dates (timezone) or return unsorted arrays.
  // We'll normalize to Mon -> Sun by sorting + padding.
  const daySlots = [
    { label: 'M', key: 'Mon' },
    { label: 'T', key: 'Tue' },
    { label: 'W', key: 'Wed' },
    { label: 'T', key: 'Thu' },
    { label: 'F', key: 'Fri' },
    { label: 'S', key: 'Sat' },
    { label: 'S', key: 'Sun' },
  ];

  const list = Array.isArray(data) ? data : [];

  // Prefer explicit `day` from API. If missing, fall back to sorting by `date`.
  const byDay = new Map();
  list.forEach((d) => {
    const k = d?.day;
    if (k) byDay.set(k, d);
  });

  let normalized = daySlots.map((slot) => byDay.get(slot.key));

  // If API didn't provide day labels, normalize by date order.
  if (normalized.every((x) => !x) && list.length) {
    const sorted = [...list].sort((a, b) =>
      String(a?.date || '').localeCompare(String(b?.date || ''))
    );
    normalized = daySlots.map((_, i) => sorted[i]);
  }

  return (
    <div className={`flex justify-between gap-1 ${className}`}>
      {daySlots.map((slot, index) => {
        const dayData = normalized[index];
        const percent = dayData?.percent || 0;
        const isToday = dayData?.isToday;

        return (
          <div key={index} className="flex-1 text-center">
            <p className="text-xs text-calm-500 mb-1">{slot.label}</p>
            <div
              className={`
                w-full aspect-square rounded-full flex items-center justify-center
                transition-all duration-300
                ${
                  percent === 0
                    ? 'bg-calm-100'
                    : percent < 50
                    ? 'bg-neo-200'
                    : percent < 100
                    ? 'bg-neo-400'
                    : 'bg-neo-500'
                }
                ${isToday ? 'ring-2 ring-neo-400 ring-offset-2' : ''}
              `}
            >
              <span
                className={`text-xs font-medium ${
                  percent === 0 ? 'text-calm-400' : 'text-white'
                }`}
              >
                {percent > 0 ? `${percent}` : '-'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
