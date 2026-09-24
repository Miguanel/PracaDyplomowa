// Ścieżka: src/hooks/useIsMobile.js
// Wykrywanie trybu mobilnego (smartfony w pionie i w poziomie, małe tablety w pionie).
// W trybie mobilnym pływające okna zamieniają się w panele dokowane z dolnym paskiem nawigacji.
import { useSyncExternalStore } from 'react';

export const MOBILE_QUERY = '(max-width: 899px), (max-height: 500px) and (max-width: 1024px)';

const getMql = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null);

const subscribe = (callback) => {
  const mql = getMql();
  if (!mql) return () => {};
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getSnapshot = () => !!getMql()?.matches;

export const isMobileViewport = getSnapshot;

export const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, () => false);
