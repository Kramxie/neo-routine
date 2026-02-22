'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Idle Timeout System
 * Automatically logs out users after period of inactivity
 * Shows a warning modal before logout
 */

// Configuration
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of inactivity
const WARNING_BEFORE_LOGOUT_MS = 60 * 1000; // Show warning 60 seconds before logout

// Events that reset the idle timer
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'focus',
];

/**
 * Custom hook for idle timeout detection
 */
export function useIdleTimeout(options = {}) {
  const {
    timeout = IDLE_TIMEOUT_MS,
    warningTime = WARNING_BEFORE_LOGOUT_MS,
    onIdle,
    onActive,
    onWarning,
    enabled = true,
  } = options;

  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(warningTime);
  
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset all timers
  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Reset state
    setIsIdle(false);
    setShowWarning(false);
    setTimeRemaining(warningTime);
    lastActivityRef.current = Date.now();

    if (!enabled) return;

    // Start warning timer (shows warning before final timeout)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      onWarning?.();

      // Start countdown
      let remaining = warningTime;
      setTimeRemaining(remaining);
      
      countdownRef.current = setInterval(() => {
        remaining -= 1000;
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);
    }, timeout - warningTime);

    // Start idle timer (actual logout)
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  }, [enabled, timeout, warningTime, onIdle, onWarning]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!enabled) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if more than 1 second since last activity (debounce)
    if (timeSinceLastActivity > 1000) {
      lastActivityRef.current = now;
      
      // If warning is showing, hide it and call onActive
      if (showWarning) {
        onActive?.();
      }
      
      resetTimers();
    }
  }, [enabled, showWarning, resetTimers, onActive]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    // Add activity event listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start timers
    resetTimers();

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, handleActivity, resetTimers]);

  // Extend session (when user clicks "Stay logged in")
  const extendSession = useCallback(() => {
    onActive?.();
    resetTimers();
  }, [resetTimers, onActive]);

  return {
    isIdle,
    showWarning,
    timeRemaining,
    extendSession,
    resetTimers,
  };
}

/**
 * Timeout Warning Modal Component
 */
export function TimeoutWarningModal({ 
  isOpen, 
  timeRemaining, 
  onStayLoggedIn, 
  onLogout 
}) {
  if (!isOpen) return null;

  const seconds = Math.max(0, Math.ceil(timeRemaining / 1000));
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Session Timeout</h2>
              <p className="text-white/80 text-sm">Are you still there?</p>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-calm-700 dark:text-slate-300 text-center mb-4">
            We noticed you&apos;ve been inactive for a while. For your security, 
            you&apos;ll be automatically logged out in:
          </p>
          
          {/* Countdown */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-900/30 border-4 border-amber-400 flex items-center justify-center">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{seconds}</span>
            </div>
          </div>
          
          <p className="text-calm-500 dark:text-slate-400 text-sm text-center mb-6">
            Click &quot;Stay Logged In&quot; to continue your session, or you can log out now.
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-3 border border-calm-200 dark:border-slate-600 text-calm-600 dark:text-slate-300 rounded-xl font-medium hover:bg-calm-50 dark:hover:bg-slate-700 transition-colors"
            >
              Log Out Now
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 px-4 py-3 bg-neo-500 text-white rounded-xl font-medium hover:bg-neo-600 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Logged Out Notification Modal
 * Shows after user has been logged out due to inactivity
 */
export function LoggedOutModal({ isOpen, onClose }) {
  const router = useRouter();
  
  const handleClose = () => {
    onClose?.();
    router.push('/login');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-calm-500 to-calm-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Session Expired</h2>
              <p className="text-white/80 text-sm">You&apos;ve been logged out</p>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-calm-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-calm-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <p className="text-calm-700 dark:text-slate-300 mb-2">
              For your security, we&apos;ve logged you out after 10 minutes of inactivity.
            </p>
            
            <p className="text-calm-500 dark:text-slate-400 text-sm">
              Please log in again to continue using Neo Routine.
            </p>
          </div>
          
          {/* Action */}
          <button
            onClick={handleClose}
            className="w-full px-4 py-3 bg-neo-500 text-white rounded-xl font-medium hover:bg-neo-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Idle Timeout Provider Component
 * Wrap your authenticated layout with this to enable idle timeout
 */
export function IdleTimeoutProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLoggedOutModal, setShowLoggedOutModal] = useState(false);
  
  // Only enable for authenticated routes
  const isAuthenticatedRoute = pathname?.startsWith('/dashboard') || 
                               pathname?.startsWith('/coach');
  
  const handleIdle = useCallback(async () => {
    // Call logout API
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Show logged out modal
    setShowLoggedOutModal(true);
  }, []);
  
  const handleLogoutNow = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/login');
  }, [router]);
  
  const { showWarning, timeRemaining, extendSession } = useIdleTimeout({
    timeout: IDLE_TIMEOUT_MS,
    warningTime: WARNING_BEFORE_LOGOUT_MS,
    onIdle: handleIdle,
    enabled: isAuthenticatedRoute,
  });
  
  return (
    <>
      {children}
      
      {/* Warning Modal */}
      <TimeoutWarningModal
        isOpen={showWarning && !showLoggedOutModal}
        timeRemaining={timeRemaining}
        onStayLoggedIn={extendSession}
        onLogout={handleLogoutNow}
      />
      
      {/* Logged Out Modal */}
      <LoggedOutModal
        isOpen={showLoggedOutModal}
        onClose={() => setShowLoggedOutModal(false)}
      />
    </>
  );
}

export default IdleTimeoutProvider;
