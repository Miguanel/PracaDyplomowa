// Ścieżka: src/utils/codeTranslators.js

// Funkcja pomocnicza do wyciągania wartości z val_payload
const extractVal = (payload) => {
  if (typeof payload === 'object' && payload !== null && 'val' in payload) return payload.val;
  return payload;
};

export const languageTemplates = {
  // --- DODAJ TO DO languageTemplates ---


  cpp: {
    ALLOC: (v, payload, f, src) => [`Node* ${v} = new Node(${extractVal(payload)});`],
    FREE: (v) => [`delete ${v};`, `${v} = nullptr;`],
    ASSIGN_VAR: (v, p, f, src) => [`Node* ${v} = ${src};`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}->${f} = ${src};`],
    STEP_FORWARD: (v, p, f, src) => [`${v} = ${v}->${f};`],
    SET_FIELD_NULL: (v, p, f, src) => [`${v}->${f} = nullptr;`],
    COMPARE: (v, payload, operator, src) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : (payload?.rightValue ?? payload);
       const target = payload?.targetNode || 'res';
       return [`bool ${target} = (${v}->val ${operator} ${rightVal});`];
    },
    SET_VAL: (v, payload) => [`${v}->val = ${extractVal(payload)};`],
    DEFAULT: (cmd) => [`// [C++] Wykonuję operację: ${cmd}`]
  },

  python: {
    ALLOC: (v, payload) => [`${v} = Node(${extractVal(payload)})`],
    FREE: (v) => [`del ${v}  # W Pythonie zwykle wystarczy usunąć referencję`],
    ASSIGN_VAR: (v, p, f, src) => [`${v} = ${src}`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}.${f} = ${src}`],
    STEP_FORWARD: (v, p, f, src) => [`${v} = ${v}.${f}`],
    SET_FIELD_NULL: (v, p, f, src) => [`${v}.${f} = None`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : (payload?.rightValue ?? payload);
       const target = payload?.targetNode || 'res';
       return [`${target} = (${v}.val ${operator} ${rightVal})`];
    },
    SET_VAL: (v, payload) => [`${v}.val = ${extractVal(payload)}`],
    DEFAULT: (cmd) => [`# [Python] Operacja: ${cmd}`]
  },

  java: {
    ALLOC: (v, payload) => [`Node ${v} = new Node(${extractVal(payload)});`],
    FREE: (v) => [`${v} = null; // GC usunie obiekt`],
    ASSIGN_VAR: (v, p, f, src) => [`Node ${v} = ${src};`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}.${f} = ${src};`],
    STEP_FORWARD: (v, p, f, src) => [`${v} = ${v}.${f};`],
    SET_FIELD_NULL: (v, p, f, src) => [`${v}.${f} = null;`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : (payload?.rightValue ?? payload);
       const target = payload?.targetNode || 'res';
       return [`boolean ${target} = (${v}.val ${operator} ${rightVal});`];
    },
    SET_VAL: (v, payload) => [`${v}.val = ${extractVal(payload)};`],
    DEFAULT: (cmd) => [`// [Java] Operacja: ${cmd}`]
  },

  assembler: {
    ALLOC: (v, payload) => [
        `MOV eax, sizeof(Node)`,
        `PUSH eax`,
        `CALL malloc`,
        `MOV dword ptr [eax], ${extractVal(payload)} ; Inicjalizacja val`,
        `MOV [${v}], eax`
    ],
    FREE: (v) => [`PUSH [${v}]`, `CALL free`],
    ASSIGN_VAR: (v, p, f, src) => [`MOV eax, [${src}]`, `MOV [${v}], eax`],
    ASSIGN_FIELD: (v, p, f, src) => [
        `MOV eax, [${v}]`,
        `MOV ebx, [${src}]`,
        `MOV [eax + offset_${f}], ebx`
    ],
    STEP_FORWARD: (v, p, f) => [`MOV eax, [${v}]`, `MOV ebx, [eax + offset_${f}]`, `MOV [${v}], ebx`],
    SET_FIELD_NULL: (v, p, f) => [`MOV eax, [${v}]`, `MOV dword ptr [eax + offset_${f}], 0`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? `[${payload.rightValue}]` : (payload?.rightValue ?? payload);
       return [`MOV eax, [${v}]`, `CMP [eax + offset_val], ${rightVal}`];
    },
    SET_VAL: (v, payload) => [`MOV eax, [${v}]`, `MOV dword ptr [eax + offset_val], ${extractVal(payload)}`],
    DEFAULT: (cmd) => [`; [ASM] Instrukcja: ${cmd}`]
  },

  c: {
    ALLOC: (v, payload) => [
        `struct Node* ${v} = (struct Node*)malloc(sizeof(struct Node));`,
        `${v}->val = ${extractVal(payload)};`,
        `${v}->next = NULL;`
    ],
    FREE: (v) => [`free(${v});`, `${v} = NULL;`],
    ASSIGN_VAR: (v, p, f, src) => [`struct Node* ${v} = ${src};`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}->${f} = ${src};`],
    STEP_FORWARD: (v, p, f) => [`${v} = ${v}->${f};`],
    SET_FIELD_NULL: (v, p, f) => [`${v}->${f} = NULL;`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : extractVal(payload);
       return [`if (${v}->val ${operator} ${rightVal}) { ... }`];
    },
    SET_VAL: (v, payload) => [`${v}->val = ${extractVal(payload)};`],
    DEFAULT: (cmd) => [`/* [C] Operacja: ${cmd} */`]
  },

  javascript: {
    ALLOC: (v, payload) => [`let ${v} = { val: ${extractVal(payload)}, next: null, prev: null };`],
    FREE: (v) => [`${v} = null; // Obiekt zostanie usunięty przez Garbage Collector`],
    ASSIGN_VAR: (v, p, f, src) => [`let ${v} = ${src};`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}.${f} = ${src};`],
    STEP_FORWARD: (v, p, f) => [`${v} = ${v}.${f};`],
    SET_FIELD_NULL: (v, p, f) => [`${v}.${f} = null;`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : extractVal(payload);
       return [`const res = ${v}.val ${operator} ${rightVal};`];
    },
    SET_VAL: (v, payload) => [`${v}.val = ${extractVal(payload)};`],
    DEFAULT: (cmd) => [`// [JS] Operacja: ${cmd}`]
  },

  csharp: {
    ALLOC: (v, payload) => [`Node ${v} = new Node { val = ${extractVal(payload)} };`],
    FREE: (v) => [`${v} = null; // Oczekiwanie na GC`],
    ASSIGN_VAR: (v, p, f, src) => [`Node ${v} = ${src};`],
    ASSIGN_FIELD: (v, p, f, src) => [`${v}.${f} = ${src};`],
    STEP_FORWARD: (v, p, f) => [`${v} = ${v}.${f};`],
    SET_FIELD_NULL: (v, p, f) => [`${v}.${f} = null;`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : extractVal(payload);
       return [`bool res = ${v}.val ${operator} ${rightVal};`];
    },
    SET_VAL: (v, payload) => [`${v}.val = ${extractVal(payload)};`],
    DEFAULT: (cmd) => [`// [C#] Operacja: ${cmd}`]
  },

  pseudo: {
    ALLOC: (v, payload) => [`STWÓRZ NOWY WĘZEŁ ${v} Z WARTOŚCIĄ ${extractVal(payload)}`],
    FREE: (v) => [`USUŃ WĘZEŁ ${v} Z PAMIĘCI`],
    ASSIGN_VAR: (v, p, f, src) => [`USTAW WSKAŹNIK ${v} NA ${src}`],
    ASSIGN_FIELD: (v, p, f, src) => [`POŁĄCZ ${v}.${f} DO ${src}`],
    STEP_FORWARD: (v, p, f) => [`PRZEJDŹ WSKAŹNIKIEM ${v} NA JEGO POLE ${f}`],
    SET_FIELD_NULL: (v, p, f) => [`ODŁĄCZ POLE ${f} WĘZŁA ${v} (USTAW PUSTKĘ)`],
    COMPARE: (v, payload, operator) => {
       const rightVal = payload?.compareMode === 'variable' ? payload.rightValue : extractVal(payload);
       return [`JEŻELI ${v}.val ${operator} ${rightVal} TO:`];
    },
    SET_VAL: (v, payload) => [`ZAPISZ ${extractVal(payload)} DO POLA WARTOŚCI WĘZŁA ${v}`],
    DEFAULT: (cmd) => [`LOGIKA: ${cmd}`]
  }
};