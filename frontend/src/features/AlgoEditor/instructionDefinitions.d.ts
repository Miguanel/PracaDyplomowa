// Ścieżka: src/features/AlgoEditor/instructionDefinitions.d.ts
// Typy dla definicji bloków Kreatora (implementacja w instructionDefinitions.js)
export interface InstructionDef {
  cmd: string;
  category: string;
  label?: string;
  description?: string;
  syntax?: string;
  color?: string;
  inputs?: string[];
}

export declare const INSTRUCTION_DEFS: Record<string, InstructionDef>;
