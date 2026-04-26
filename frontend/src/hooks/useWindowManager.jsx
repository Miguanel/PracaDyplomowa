import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 20;
const STORAGE_KEY = 'edualgo_layout_state';
const MINIMIZED_HEIGHT = 40; // Wysokość samej belki okna

export const useWindowManager = () => {
  const [windowsData, setWindowsData] = useState({});
  const [topZ, setTopZ] = useState(100);

  // --- INICJALIZACJA ---
  const initializeLayout = useCallback((defaultLayout) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const clamped = {};
        for (const [id, win] of Object.entries(parsed)) {
          clamped[id] = {
            ...win,
            x: Math.max(0, Math.min(win.x, screenW - win.w)),
            y: Math.max(56, Math.min(win.y, screenH - (win.minimized ? MINIMIZED_HEIGHT : win.h)))
          };
        }
        setWindowsData(clamped);
      } catch (e) {
        setWindowsData(defaultLayout);
      }
    } else {
      setWindowsData(defaultLayout);
    }
  }, []);

  // --- ZAPIS ---
  useEffect(() => {
    if (Object.keys(windowsData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windowsData));
    }
  }, [windowsData]);

  // --- LOGIKA PRZYCIĄGANIA (Z REDUKCJĄ KOLIZJI DLA ZMINIMALIZOWANYCH) ---
  const calculateSnapping = (id, newX, newY, currentW, currentH) => {
    let snappedX = newX;
    let snappedY = newY;

    const otherWindows = Object.entries(windowsData).filter(([wId]) => wId !== id);

    for (const [_, win] of otherWindows) {
      const otherW = win.w;
      // KLUCZOWE: Używamy zredukowanej wysokości, jeśli okno jest zminimalizowane
      const otherH = win.minimized ? MINIMIZED_HEIGHT : win.h;

      const otherRight = win.x + otherW;
      const otherBottom = win.y + otherH;

      // Przyciąganie X
      if (Math.abs(newX - otherRight) < SNAP_THRESHOLD) snappedX = otherRight;
      else if (Math.abs(newX + currentW - win.x) < SNAP_THRESHOLD) snappedX = win.x - currentW;
      else if (Math.abs(newX - win.x) < SNAP_THRESHOLD) snappedX = win.x;

      // Przyciąganie Y (tutaj redukcja kolizji ma największe znaczenie)
      if (Math.abs(newY - otherBottom) < SNAP_THRESHOLD) snappedY = otherBottom;
      else if (Math.abs(newY + currentH - win.y) < SNAP_THRESHOLD) snappedY = win.y - currentH;
      else if (Math.abs(newY - win.y) < SNAP_THRESHOLD) snappedY = win.y;
    }

    return { snappedX, snappedY };
  };

  // --- AKCJE ---
  const bringToFront = useCallback((id) => {
    setTopZ(prev => {
      const nextZ = prev + 1;
      setWindowsData(current => ({
        ...current,
        [id]: { ...current[id], z: nextZ }
      }));
      return nextZ;
    });
  }, []);

  const updatePos = useCallback((id, x, y, isDrop = false) => {
    setWindowsData(prev => {
      const win = prev[id];
      if (!win) return prev;

      const currentH = win.minimized ? MINIMIZED_HEIGHT : win.h;
      const { snappedX, snappedY } = calculateSnapping(id, x, y, win.w, currentH);

      let finalX = snappedX;
      let finalY = snappedY;

      if (isDrop && finalX === x && finalY === y) {
        finalX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        finalY = Math.round(y / GRID_SIZE) * GRID_SIZE;
      }

      return {
        ...prev,
        [id]: { ...prev[id], x: finalX, y: finalY }
      };
    });
  }, [windowsData]);

  const updateSize = useCallback((id, size, pos) => {
    setWindowsData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        w: size.w,
        h: size.h,
        x: pos.x,
        y: pos.y,
      }
    }));
  }, []);

  const togglePin = useCallback((id) => {
    setWindowsData(prev => ({
      ...prev,
      [id]: { ...prev[id], pinned: !prev[id].pinned }
    }));
  }, []);

  const toggleMinimize = useCallback((id) => {
    setWindowsData(prev => ({
      ...prev,
      [id]: { ...prev[id], minimized: !prev[id].minimized }
    }));
  }, []);

  const applySmartClamp = useCallback(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    setWindowsData(prev => {
      const newData = { ...prev };
      let changed = false;
      for (const [id, win] of Object.entries(newData)) {
        if (win.pinned) continue;
        const h = win.minimized ? MINIMIZED_HEIGHT : win.h;
        const newX = Math.max(0, Math.min(win.x, screenW - win.w));
        const newY = Math.max(56, Math.min(win.y, screenH - h));
        if (newX !== win.x || newY !== win.y) {
          newData[id] = { ...win, x: newX, y: newY };
          changed = true;
        }
      }
      return changed ? newData : prev;
    });
  }, []);

  const intelligentLayout = useCallback(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const headerH = 56;
    const padding = 20;
    const gap = 15;
    const phi = 1.618;

    setWindowsData(prev => {
      const newData = { ...prev };
      const activeIds = Object.keys(prev).filter(id => !prev[id].pinned && id !== 'welcome');

      const sidebarWidth = screenW / (phi + 2);
      const centerHeight = screenH - headerH - (padding * 2);
      const colWidth = Math.floor(sidebarWidth);

      const slots = [];
      const halfCount = Math.ceil(activeIds.length / 2);
      const slotHeight = Math.floor((centerHeight - (gap * (halfCount - 1))) / halfCount);

      for (let i = 0; i < halfCount; i++) {
        slots.push({ x: padding, y: headerH + padding + (i * (slotHeight + gap)), maxW: colWidth, maxH: slotHeight });
      }
      for (let i = 0; i < halfCount; i++) {
        slots.push({ x: screenW - padding - colWidth, y: headerH + padding + (i * (slotHeight + gap)), maxW: colWidth, maxH: slotHeight });
      }

      const availableSlots = [...slots];

      activeIds.forEach(id => {
        const win = prev[id];
        let bestSlotIdx = -1;
        let minDistance = Infinity;

        availableSlots.forEach((slot, idx) => {
          const dist = Math.sqrt(Math.pow(win.x - slot.x, 2) + Math.pow(win.y - slot.y, 2));
          if (dist < minDistance) {
            minDistance = dist;
            bestSlotIdx = idx;
          }
        });

        if (bestSlotIdx !== -1) {
          const target = availableSlots[bestSlotIdx];
          const newW = win.minimized ? win.w : Math.min(win.w, target.maxW);
          const newH = win.minimized ? win.h : Math.min(win.h, target.maxH);

          newData[id] = {
            ...win,
            x: target.x,
            y: target.y,
            w: newW,
            h: newH,
          };
          availableSlots.splice(bestSlotIdx, 1);
        }
      });

      return newData;
    });
  }, []);

  return {
    windowsData,
    initializeLayout,
    bringToFront,
    updatePos,
    updateSize,
    togglePin,
    toggleMinimize,
    applySmartClamp,
    intelligentLayout,
    setWindowsData
  };
};