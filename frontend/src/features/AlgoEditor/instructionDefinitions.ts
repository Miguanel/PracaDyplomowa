// Typy instrukcji (rozszerzone)
export type InstructionType =
  | 'ALLOC' | 'FREE'
  | 'ASSIGN_VAR' | 'ASSIGN_FIELD'
  | 'STEP_FORWARD'   // NOWOŚĆ: curr = curr->next
  | 'SET_FIELD_NULL' // NOWOŚĆ: node->next = NULL
  | 'SET_VAL' | 'COPY_VAL' | 'MATH_ADD'
  | 'CHECK_NULL'
  | 'COMPARE';


export interface InstructionDef {
  cmd: InstructionType;
  category: 'MEMORY' | 'POINTERS' | 'DATA' | 'CONTROL';
  label: string;
  description: string;
  syntax: string;
  color: string;
  inputs: string[];
}

export const INSTRUCTION_DEFS: Record<string, InstructionDef> = {

  // --- MEMORY ---
  ALLOC: {
    cmd: 'ALLOC', category: 'MEMORY', label: 'Alokuj (ALLOC)',
    description: 'Tworzy nowy węzeł. Możesz podać opcjonalne koordynaty X i Y.',
    syntax: 'ptr = new Node(val)',
    color: 'text-green-400',
    // DODANO 'x' i 'y' do tablicy inputs
    inputs: ['var_name', 'val_payload', 'x', 'y']
  },
  FREE: {
    cmd: 'FREE', category: 'MEMORY', label: 'Zwolnij (FREE)',
    description: 'Usuwa węzeł.', syntax: 'delete ptr',
    color: 'text-red-500', inputs: ['var_name']
  },

  // --- POINTERS ---
  ASSIGN_VAR: {
    cmd: 'ASSIGN_VAR', category: 'POINTERS', label: 'Przypisz Zmienną (ASSIGN_VAR)',
    description: 'temp = curr (kopiuje adres)', syntax: 'A = B',
    color: 'text-blue-400', inputs: ['var_name', 'source_var']
  },
  ASSIGN_FIELD: {
    cmd: 'ASSIGN_FIELD', category: 'POINTERS', label: 'Połącz Węzły (ASSIGN_FIELD)',
    description: 'node->next = target', syntax: 'A->next = B',
    color: 'text-yellow-400', inputs: ['var_name', 'field_name', 'source_var']
  },

  // NOWOŚĆ 1: Przesuwanie
  STEP_FORWARD: {
    cmd: 'STEP_FORWARD', category: 'POINTERS', label: 'Przesuń (STEP_FORWARD)',
    description: 'Przesuwa wskaźnik na następny element.',
    syntax: 'curr = curr->next',
    color: 'text-cyan-400',
    inputs: ['var_name', 'field_name'] // np. var_name="curr", field_name="next"
  },

  // NOWOŚĆ 2: Zerowanie wskaźnika
  SET_FIELD_NULL: {
    cmd: 'SET_FIELD_NULL', category: 'POINTERS', label: 'Ustaw NULL (SET_FIELD_NULL)',
    description: 'Przerywa połączenie (ustawia next/prev na NULL).',
    syntax: 'node->next = NULL',
    color: 'text-gray-500',
    inputs: ['var_name', 'field_name']
  },

  // --- DATA ---
  SET_VAL: {
    cmd: 'SET_VAL', category: 'DATA', label: 'Ustaw Wartość (SET_VAL)',
    description: 'Wpisuje liczbę.', syntax: 'node->val = 5',
    color: 'text-purple-400', inputs: ['var_name', 'val_payload']
  },
  COPY_VAL: {
    cmd: 'COPY_VAL', category: 'DATA', label: 'Kopiuj Dane (COPY_VAL)',
    description: 'Kopiuje wartość z innego węzła.', syntax: 'A->val = B->val',
    color: 'text-pink-400', inputs: ['var_name', 'source_var']
  },
  MATH_ADD: {
    cmd: 'MATH_ADD', category: 'DATA', label: 'Dodaj (MATH_ADD)',
    description: 'Inkrementacja.', syntax: 'node->val += X',
    color: 'text-orange-400', inputs: ['var_name', 'val_payload']
  },

  // --- CONTROL ---
  CHECK_NULL: {
    cmd: 'CHECK_NULL', category: 'CONTROL', label: 'Sprawdź NULL (CHECK_NULL)',
    description: 'Wizualne sprawdzenie.', syntax: 'if (ptr == NULL)',
    color: 'text-white', inputs: ['var_name']
  },

  COMPARE: {
    cmd: 'COMPARE',
    category: 'CONTROL',
    label: 'Porównaj i Zapisz (COMPARE)',
    description: 'Porównuje wartości i zapisuje wynik (1 lub 0) do wskazanego węzła.',
    syntax: 'res->val = (A->val > B)',
    color: 'text-indigo-400',
    inputs: ['var_name', 'field_name', 'val_payload']
  }
};