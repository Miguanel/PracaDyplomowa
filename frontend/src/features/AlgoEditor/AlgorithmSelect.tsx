// Ścieżka: src/features/AlgoEditor/AlgorithmSelect.tsx
// Lista wyboru scenariusza - wspólna dla okna Odtwarzacza i mobilnego paska kroków.
// Zmiana wyboru w dowolnym momencie zatrzymuje bieżący algorytm i ładuje nowy.
import clsx from 'clsx';
import { useMemoryStore } from '../../store/memoryStore';
import { usePlayerActions } from '../../hooks/usePlayerActions';
import { ALGORITHMS_DB } from '../../data/algorithms';

interface AlgorithmSelectProps {
  className?: string;
  placeholder?: string;
}

export const AlgorithmSelect = ({ className, placeholder = '-- Wybierz algorytm --' }: AlgorithmSelectProps) => {
  const activeAlgorithm = useMemoryStore(s => s.activeAlgorithm);
  const customAlgorithms = useMemoryStore(s => s.customAlgorithms);
  const { selectAlgorithm } = usePlayerActions();

  return (
    <select
      aria-label="Wybierz scenariusz"
      className={clsx("outline-none cursor-pointer", className)}
      onChange={(e) => selectAlgorithm(e.target.value)}
      value={activeAlgorithm?.id || ""}
    >
      <option value="" disabled>{placeholder}</option>
      <optgroup label="Baza Wiedzy EduAlgo">
        {ALGORITHMS_DB.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
      </optgroup>
      {customAlgorithms?.length > 0 && (
        <optgroup label="Twoje Projekty">
          {customAlgorithms.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </optgroup>
      )}
    </select>
  );
};
