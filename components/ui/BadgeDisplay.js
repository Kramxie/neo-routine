'use client';

import { useState } from 'react';
import { BADGE_DEFINITIONS, RARITY_COLORS } from '@/models/Badge';

/**
 * Badge Display Components
 * Shows earned badges with beautiful animations and details
 */

// Single Badge Card
export function BadgeCard({ badge, showDetails = false, onClick, isNew = false }) {
  const definition = BADGE_DEFINITIONS[badge.badgeId] || {
    name: 'Unknown Badge',
    description: 'A mysterious achievement',
    icon: '❓',
    rarity: 'common',
  };

  const colors = RARITY_COLORS[definition.rarity] || RARITY_COLORS.common;
  const earnedDate = badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : '';

  return (
    <div
      onClick={onClick}
      className={`
        badge-card relative rounded-xl p-4 border-2 cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${isNew ? 'animate-pulse ring-2 ring-yellow-400 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* New indicator */}
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
          NEW
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl text-center mb-2">
        {definition.icon}
      </div>

      {/* Name */}
      <h4
        className="text-sm font-bold text-center truncate"
        style={{ color: colors.text }}
      >
        {definition.name}
      </h4>

      {/* Details (optional) */}
      {showDetails && (
        <>
          <p className="text-xs text-center text-calm-500 mt-1">
            {definition.description}
          </p>
          <div className="flex items-center justify-center mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: colors.border, color: colors.text }}
            >
              {definition.rarity}
            </span>
          </div>
          {earnedDate && (
            <p className="text-xs text-center text-calm-400 mt-2">
              Earned {earnedDate}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Badge Grid Display
export function BadgeGrid({ badges = [], showNewBadges = true }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Separate new (unseen) badges
  const newBadges = badges.filter(b => !b.seen);
  const seenBadges = badges.filter(b => b.seen);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };

  return (
    <div className="badge-grid">
      {/* New badges section */}
      {showNewBadges && newBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-calm-700 mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span>
            New Badges ({newBadges.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {newBadges.map(badge => (
              <BadgeCard
                key={badge._id || badge.badgeId}
                badge={badge}
                isNew={true}
                onClick={() => handleBadgeClick(badge)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All badges */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {seenBadges.map(badge => (
          <BadgeCard
            key={badge._id || badge.badgeId}
            badge={badge}
            onClick={() => handleBadgeClick(badge)}
          />
        ))}
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="text-lg font-medium text-calm-700 mb-2">No badges yet</h3>
          <p className="text-calm-500 text-sm">
            Complete tasks and reach milestones to earn badges!
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}

// Badge Detail Modal
export function BadgeModal({ badge, onClose }) {
  const definition = BADGE_DEFINITIONS[badge.badgeId] || {
    name: 'Unknown Badge',
    description: 'A mysterious achievement',
    icon: '❓',
    rarity: 'common',
    category: 'unknown',
  };

  const colors = RARITY_COLORS[definition.rarity] || RARITY_COLORS.common;
  const earnedDate = badge.earnedAt 
    ? new Date(badge.earnedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'badge-modal-pop 0.3s ease-out' }}
      >
        {/* Header */}
        <div
          className="p-8 text-center"
          style={{ backgroundColor: colors.bg }}
        >
          <div className="text-6xl mb-4 animate-bounce">
            {definition.icon}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            {definition.name}
          </h2>
          <span
            className="inline-block mt-2 text-xs px-3 py-1 rounded-full capitalize"
            style={{ backgroundColor: colors.border, color: colors.text }}
          >
            {definition.rarity}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-calm-600 text-center mb-4">
            {definition.description}
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-calm-500">
            <div className="flex items-center gap-1">
              <span>📁</span>
              <span className="capitalize">{definition.category}</span>
            </div>
            {earnedDate && (
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{earnedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-neo-500 text-white rounded-xl font-medium hover:bg-neo-600 transition-colors"
          >
            Awesome!
          </button>
        </div>

        <style jsx global>{`
          @keyframes badge-modal-pop {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Badge Progress - shows progress towards next badge
export function BadgeProgress({ currentStreak = 0, totalCheckIns = 0, completedGoals = 0 }) {
  // Define next milestones
  const milestones = [
    { badgeId: 'streak_3', current: currentStreak, target: 3, type: 'streak' },
    { badgeId: 'streak_7', current: currentStreak, target: 7, type: 'streak' },
    { badgeId: 'streak_14', current: currentStreak, target: 14, type: 'streak' },
    { badgeId: 'streak_30', current: currentStreak, target: 30, type: 'streak' },
    { badgeId: 'streak_100', current: currentStreak, target: 100, type: 'streak' },
    { badgeId: 'checkins_50', current: totalCheckIns, target: 50, type: 'volume' },
    { badgeId: 'checkins_100', current: totalCheckIns, target: 100, type: 'volume' },
    { badgeId: 'checkins_500', current: totalCheckIns, target: 500, type: 'volume' },
  ];

  // Find next achievable milestones (not yet reached)
  const nextMilestones = milestones
    .filter(m => m.current < m.target)
    .slice(0, 3);

  if (nextMilestones.length === 0) return null;

  return (
    <div className="badge-progress space-y-3">
      <h4 className="text-sm font-semibold text-calm-700">Next Badges</h4>
      {nextMilestones.map(milestone => {
        const definition = BADGE_DEFINITIONS[milestone.badgeId];
        const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
        const colors = RARITY_COLORS[definition?.rarity || 'common'];

        return (
          <div key={milestone.badgeId} className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: colors.bg }}
            >
              {definition?.icon || '🏅'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-calm-700 truncate">
                  {definition?.name || 'Unknown'}
                </span>
                <span className="text-calm-500 text-xs">
                  {milestone.current}/{milestone.target}
                </span>
              </div>
              <div className="h-2 bg-calm-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: colors.text,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// New Badge Unlock Animation Overlay
export function BadgeUnlockAnimation({ badge, onComplete }) {
  const definition = BADGE_DEFINITIONS[badge?.badgeId] || {};
  const colors = RARITY_COLORS[definition.rarity || 'common'];

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onComplete}
    >
      <div
        className="text-center"
        style={{ animation: 'badge-unlock 1s ease-out' }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-3xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${colors.border} 0%, transparent 70%)`,
          }}
        />

        {/* Badge */}
        <div className="relative">
          <div
            className="text-8xl mb-6"
            style={{ animation: 'badge-bounce 0.6s ease-out 0.3s both' }}
          >
            {definition.icon || '🏅'}
          </div>
          
          <h2
            className="text-3xl font-bold text-white mb-2"
            style={{ animation: 'fade-in 0.5s ease-out 0.5s both' }}
          >
            Badge Unlocked!
          </h2>
          
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: colors.border, animation: 'fade-in 0.5s ease-out 0.7s both' }}
          >
            {definition.name}
          </h3>
          
          <p
            className="text-white/70"
            style={{ animation: 'fade-in 0.5s ease-out 0.9s both' }}
          >
            {definition.description}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes badge-unlock {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes badge-bounce {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default BadgeGrid;
