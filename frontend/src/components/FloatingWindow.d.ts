// Ścieżka: src/components/FloatingWindow.d.ts
// Typy dla komponentu okna (implementacja w FloatingWindow.jsx)
import type { ReactNode, JSX } from 'react';

export interface FloatingWindowComponentProps {
  id: string;
  title: ReactNode;
  icon?: ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
  pinned?: boolean;
  minimized?: boolean;
  z?: number;
  onPosChange: (id: string, x: number, y: number, isDrop?: boolean) => void;
  onSizeChange: (id: string, size: { w: number; h: number }, pos: { x: number; y: number }, isDrop?: boolean) => void;
  onPinToggle: (id: string) => void;
  onMinimizeToggle: (id: string) => void;
  zIndexManager: (id: string) => void;
  children?: ReactNode;
  minimizedContent?: ReactNode;
  className?: string;
  headerControls?: ReactNode;
  footerContent?: ReactNode;
}

export declare const FloatingWindow: (props: FloatingWindowComponentProps) => JSX.Element;
