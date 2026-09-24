// Ścieżka: src/hooks/useCssVarHeight.ts
// Mierzy wysokość elementu i zapisuje ją jako zmienną CSS na kontenerze aplikacji (.app-root).
// Dzięki temu układ mobilny (płótno, arkusze) dopasowuje się do aktualnie widocznych pasków.
import { useEffect } from 'react';
import type { RefObject } from 'react';

export const useCssVarHeight = (ref: RefObject<HTMLElement | null>, varName: string, widthVarName?: string) => {
  useEffect(() => {
    const el = ref.current;
    const root = document.querySelector<HTMLElement>('.app-root');
    if (!el || !root) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      root.style.setProperty(varName, `${Math.round(r.height)}px`);
      if (widthVarName) root.style.setProperty(widthVarName, `${Math.round(r.width)}px`);
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty(varName, '0px');
      if (widthVarName) root.style.setProperty(widthVarName, '0px');
    };
  }, [ref, varName, widthVarName]);
};
