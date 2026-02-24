'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Confetti Celebration Component
 * Shows beautiful confetti animation when users hit milestones
 * Supports different celebration types: streak, goal, achievement
 */

// Generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

// Generate a random color from the celebration palette
const getColor = (type) => {
  const palettes = {
    streak: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'],
    goal: ['#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'],
    achievement: ['#F97316', '#EAB308', '#84CC16', '#22C55E', '#14B8A6', '#0EA5E9'],
    milestone: ['#FFD700', '#FFC107', '#FFEB3B', '#FF9800', '#FF5722', '#E91E63'],
  };
  const colors = palettes[type] || palettes.streak;
  return colors[Math.floor(Math.random() * colors.length)];
};

// Individual confetti piece component
function ConfettiPiece({ piece, type: _type }) {
  return (
    <div
      className="confetti-piece"
      style={{
        position: 'absolute',
        left: piece.x,
        top: piece.y,
        width: piece.size,
        height: piece.size * 0.4,
        backgroundColor: piece.color,
        borderRadius: '2px',
        transform: `rotate(${piece.rotation}deg)`,
        opacity: piece.opacity,
        animation: `confetti-fall ${piece.duration}s linear forwards`,
        animationDelay: `${piece.delay}s`,
      }}
    />
  );
}

// Star burst for special milestones
function StarBurst({ show }) {
  if (!show) return null;
  
  return (
    <div className="star-burst">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="star-ray"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '4px',
            height: '60px',
            background: 'linear-gradient(to top, #FFD700, transparent)',
            transformOrigin: 'center bottom',
            transform: `translateX(-50%) rotate(${i * 45}deg)`,
            animation: 'star-ray 0.8s ease-out forwards',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Confetti({
  show = false,
  type = 'streak', // streak, goal, achievement, milestone
  duration = 3000,
  pieces = 100,
  onComplete,
  message,
  subMessage,
  icon,
}) {
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const createPieces = useCallback(() => {
    const newPieces = [];
    for (let i = 0; i < pieces; i++) {
      newPieces.push({
        id: i,
        x: random(0, window.innerWidth),
        y: random(-100, -20),
        size: random(8, 14),
        color: getColor(type),
        rotation: random(0, 360),
        opacity: random(0.8, 1),
        duration: random(2, 4),
        delay: random(0, 1.5),
      });
    }
    return newPieces;
  }, [pieces, type]);

  useEffect(() => {
    if (show && !isActive) {
      // Use functional updates to avoid sync setState warnings
      const initTimer = setTimeout(() => {
        setIsActive(true);
        setConfettiPieces(createPieces());
      }, 0);
      
      // Show message after brief delay
      const messageTimer = setTimeout(() => setShowMessage(true), 300);
      
      // Cleanup after duration
      const cleanupTimer = setTimeout(() => {
        setIsActive(false);
        setShowMessage(false);
        setConfettiPieces([]);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(initTimer);
        clearTimeout(messageTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [show, isActive, createPieces, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      className="confetti-container"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Confetti pieces */}
      {confettiPieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} type={type} />
      ))}

      {/* Star burst for milestone */}
      {type === 'milestone' && <StarBurst show={isActive} />}

      {/* Center message */}
      {showMessage && message && (
        <div
          className="celebration-message"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            animation: 'celebration-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            pointerEvents: 'auto',
          }}
        >
          {/* Icon/Emoji */}
          {icon && (
            <div 
              className="celebration-icon"
              style={{
                fontSize: '64px',
                marginBottom: '16px',
                animation: 'bounce 0.6s ease infinite',
              }}
            >
              {icon}
            </div>
          )}
          
          {/* Main message */}
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {message}
          </h2>
          
          {/* Sub message */}
          {subMessage && (
            <p
              style={{
                fontSize: '1rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500',
              }}
            >
              {subMessage}
            </p>
          )}
        </div>
      )}

      {/* Add necessary keyframes */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes celebration-pop {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes star-ray {
          0% {
            height: 0;
            opacity: 1;
          }
          50% {
            height: 120px;
            opacity: 1;
          }
          100% {
            height: 120px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Preset celebrations for common milestones
export const celebrations = {
  week: {
    type: 'streak',
    message: '🔥 7-Day Streak!',
    subMessage: 'One week of consistency!',
    icon: '🎯',
    pieces: 80,
  },
  twoWeeks: {
    type: 'streak',
    message: '⚡ 14-Day Streak!',
    subMessage: 'Two weeks strong!',
    icon: '💪',
    pieces: 100,
  },
  month: {
    type: 'milestone',
    message: '🏆 30-Day Streak!',
    subMessage: 'One month of dedication!',
    icon: '🌟',
    pieces: 150,
  },
  twoMonths: {
    type: 'milestone',
    message: '🚀 60-Day Streak!',
    subMessage: 'Incredible commitment!',
    icon: '💎',
    pieces: 150,
  },
  hundred: {
    type: 'milestone',
    message: '💯 100-Day Streak!',
    subMessage: 'Legendary achievement!',
    icon: '👑',
    pieces: 200,
  },
  goalComplete: {
    type: 'goal',
    message: '🎯 Goal Complete!',
    subMessage: 'You did it!',
    icon: '✨',
    pieces: 100,
  },
  perfectDay: {
    type: 'achievement',
    message: '✨ Perfect Day!',
    subMessage: 'All tasks completed!',
    icon: '💧',
    pieces: 60,
  },
  perfectWeek: {
    type: 'milestone',
    message: '🌊 Perfect Week!',
    subMessage: 'Every day, every task!',
    icon: '🏅',
    pieces: 120,
  },
};

// Hook for easy celebration triggering
export function useCelebration() {
  const [celebration, setCelebration] = useState(null);

  const celebrate = useCallback((preset, customOptions = {}) => {
    const config = typeof preset === 'string' 
      ? { ...celebrations[preset], ...customOptions }
      : preset;
    setCelebration(config);
  }, []);

  const clearCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return { celebration, celebrate, clearCelebration };
}
