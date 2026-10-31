// src/hooks/useSessionTimeout.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
const WARNING_BEFORE_MS = 60 * 1000; // avertissement 1 min avant

export default function useSessionTimeout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const touchActivity = useAuthStore((s) => s.touchActivity);
  const isSessionExpired = useAuthStore((s) => s.isSessionExpired);
  const extendSession = useAuthStore((s) => s.extendSession);
  const getRemainingMs = useAuthStore((s) => s.getRemainingMs);
  const sessionTimeoutMs = useAuthStore((s) => s.sessionTimeoutMs);

  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  // 1. Vérification immédiate au montage / navigation (après un reload)
  useEffect(() => {
    if (!user || !token) return;
    if (isSessionExpired()) {
      logout();
      navigate('/admin/login?expired=1', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 2. Suivi de l'activité + timers
  useEffect(() => {
    if (!user || !token) return undefined;

    const clearTimers = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };

    const scheduleTimers = () => {
      clearTimers();
      const remaining = getRemainingMs();

      if (remaining <= 0) {
        logout();
        navigate('/admin/login?expired=1', { replace: true });
        return;
      }

      // Timer d'expiration
      timerRef.current = setTimeout(() => {
        logout();
        navigate('/admin/login?expired=1', { replace: true });
      }, remaining);

      // Timer d'avertissement (si assez de temps)
      if (remaining > WARNING_BEFORE_MS) {
        warningTimerRef.current = setTimeout(
          () => setShowWarning(true),
          remaining - WARNING_BEFORE_MS
        );
      }
    };

    const handleActivity = () => {
      setShowWarning(false);
      touchActivity();
      scheduleTimers();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    scheduleTimers();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
  }, [user, token, sessionTimeoutMs, touchActivity, getRemainingMs, isSessionExpired, logout, navigate]);

  const handleExtend = () => {
    setShowWarning(false);
    extendSession();
    // force le recalcul des timers en changeant l'état via touchActivity
    touchActivity();
  };

  return { showWarning, handleExtend };
}