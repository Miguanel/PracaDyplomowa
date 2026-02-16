import type { AlgorithmInstruction } from "../store/memoryStore";

export interface AlgorithmDef {
  id: string;
  title: string;
  description: string;
  codeLines: string[];
  steps: AlgorithmInstruction[];
}

export const ALGORITHMS_DB: AlgorithmDef[] = [
  // --- 1. WYSZUKIWANIE LINIOWE ---
  {
    id: "sll_find_val",
    title: "1. Szukanie paczki (Wyszukiwanie liniowe)",
    description: "Wyobraź sobie, że szukasz pudełka z numerem 30 w rzędzie. Musisz otwierać je po kolei, od pierwszego do ostatniego, aż trafisz na właściwe.",
    codeLines: [
      "Node* curr = head;",
      "while (curr != NULL) {",
      "  if (curr->val == 30) return curr;",
      "  curr = curr->next;",
      "}",
      "return NULL;"
    ],
    steps: [
      // Zwiększone odstępy X: 100 -> 350 -> 600 -> 850
      { group: "Faza 1: Budowa układu pudełek", cmd: "ALLOC", var_name: "head", val_payload: { val: 10, x: 100, y: 150 }, explanation: "Stawiamy pierwsze pudełko (wartość 10) i dajemy mu naklejkę 'head' (początek)." },
      { group: "Faza 1: Budowa układu pudełek", cmd: "ALLOC", var_name: "n2", val_payload: { val: 20, x: 350, y: 150 }, explanation: "Stawiamy drugie pudełko (wartość 20) w bezpiecznej odległości." },
      { group: "Faza 1: Budowa układu pudełek", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "n2", explanation: "Rozciągamy sznurek (strzałkę) z pierwszego do drugiego pudełka." },
      { group: "Faza 1: Budowa układu pudełek", cmd: "ALLOC", var_name: "n3", val_payload: { val: 30, x: 600, y: 150 }, explanation: "Stawiamy trzecie pudełko (wartość 30). Tego będziemy szukać!" },
      { group: "Faza 1: Budowa układu pudełek", cmd: "ASSIGN_FIELD", var_name: "n2", field_name: "next", source_var: "n3", explanation: "Wiążemy sznurek między drugim a trzecim pudełkiem." },

      { group: "Faza 2: Start Poszukiwań", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "head", explanation: "Zaczynamy! Bierzemy nową naklejkę 'curr' (obecny) i przyklejamy na pierwsze pudełko. Będziemy ją przesuwać podczas szukania." },

      { group: "Faza 3: Logika - Otwieranie i Sprawdzanie", cmd: "COMPARE", var_name: "curr", field_name: "==", val_payload: { targetNode: "res", compareMode: "number", rightValue: 30 }, explanation: "Zaglądamy do pudełka z naklejką 'curr'. Czy jest tu 30? Nie (jest 10)." },
      { group: "Faza 3: Logika - Otwieranie i Sprawdzanie", cmd: "STEP_FORWARD", var_name: "curr", field_name: "next", explanation: "Odklejamy naklejkę 'curr' i przesuwamy się po sznurku na kolejne pudełko." },
      { group: "Faza 3: Logika - Otwieranie i Sprawdzanie", cmd: "COMPARE", var_name: "curr", field_name: "==", val_payload: { targetNode: "res", compareMode: "number", rightValue: 30 }, explanation: "Sprawdzamy drugie pudełko. Czy tu jest 30? Znowu pudło (jest 20)." },
      { group: "Faza 3: Logika - Otwieranie i Sprawdzanie", cmd: "STEP_FORWARD", var_name: "curr", field_name: "next", explanation: "Idziemy dalej po sznurku." },
      { group: "Faza 3: Logika - Otwieranie i Sprawdzanie", cmd: "COMPARE", var_name: "curr", field_name: "==", val_payload: { targetNode: "res", compareMode: "number", rightValue: 30 }, explanation: "Zaglądamy... JEST 30! Znaleźliśmy." },

      { group: "Faza 4: Finał", cmd: "ASSIGN_VAR", var_name: "found", source_var: "curr", explanation: "Przyklejamy tu ostateczną naklejkę 'found'. Szukanie zakończone." }
    ]
  },

  // --- 2. WSTAWIANIE W ŚRODEK ---
  {
    id: "sll_insert_mid",
    title: "2. Wpinanie wagonu w środek pociągu",
    description: "Mamy pociąg i chcemy wpiąć nowy wagonik między dwa inne. Musimy tak rozpiąć stary sznurek i zapiąć nowy, żeby żaden wagon nie odjechał w siną dal.",
    codeLines: [
      "Node* nowy = new Node(25);",
      "nowy->next = curr->next;",
      "curr->next = nowy;"
    ],
    steps: [
      // Zwiększone odstępy X: 100 -> 350 -> [luka 600] -> 850
      { group: "Faza 1: Budowa starego pociągu", cmd: "ALLOC", var_name: "w1", val_payload: { val: 10, x: 100, y: 150 }, explanation: "Budujemy pociąg: Wagonik pierwszy." },
      { group: "Faza 1: Budowa starego pociągu", cmd: "ALLOC", var_name: "w2", val_payload: { val: 20, x: 350, y: 150 }, explanation: "Wagonik drugi." },
      { group: "Faza 1: Budowa starego pociągu", cmd: "ASSIGN_FIELD", var_name: "w1", field_name: "next", source_var: "w2", explanation: "Łączymy pierwszy z drugim." },
      { group: "Faza 1: Budowa starego pociągu", cmd: "ALLOC", var_name: "w3", val_payload: { val: 30, x: 850, y: 150 }, explanation: "Wagonik trzeci (zostawiliśmy DUŻĄ lukę pośrodku na nowy wagon)." },
      { group: "Faza 1: Budowa starego pociągu", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "next", source_var: "w3", explanation: "Pociąg z 3 wagonów jest gotowy." },

      { group: "Faza 2: Przygotowanie nowego elementu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w2", explanation: "Przyklejamy naklejkę 'curr' na drugi wagonik. To ZA NIM chcemy wpiąć nowość." },
      { group: "Faza 2: Przygotowanie nowego elementu", cmd: "ALLOC", var_name: "nowy", val_payload: { val: 25, x: 600, y: 350 }, explanation: "Przywozimy na tory nowy wagonik z numerem 25 (ustawiamy go poniżej luki)." },

      { group: "Faza 3: Bezpieczne przepinanie wskaźników", cmd: "ASSIGN_VAR", var_name: "temp", source_var: "curr", field_name: "next", explanation: "WAŻNE: Zabezpieczamy resztę pociągu! Naklejamy 'temp' na wagon nr 3, żeby go nie zgubić po odpięciu." },
      { group: "Faza 3: Bezpieczne przepinanie wskaźników", cmd: "ASSIGN_FIELD", var_name: "nowy", field_name: "next", source_var: "temp", explanation: "Najpierw podpinamy NOWY wagon do zabezpieczonej reszty pociągu (nowy->temp)." },
      { group: "Faza 3: Bezpieczne przepinanie wskaźników", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "nowy", explanation: "Na koniec przepinamy wagonik 'curr', by wskazywał na nowy. Pociąg znów jest cały!" }
    ]
  },

  // --- 3. USUWANIE ZE ŚRODKA ---
  {
    id: "sll_delete_mid",
    title: "3. Wycinanie zepsutego wagonu",
    description: "Jeden z wagonów w środku pociągu się zepsuł. Musimy go ominąć, łącząc wagon przed nim z wagonem za nim, a zepsuty usunąć z torów.",
    codeLines: [
      "przed->next = zepsuty->next;",
      "delete zepsuty;"
    ],
    steps: [
      { group: "Faza 1: Sytuacja awaryjna na torach", cmd: "ALLOC", var_name: "head", val_payload: { val: 1, x: 100, y: 200 }, explanation: "Wagon nr 1." },
      { group: "Faza 1: Sytuacja awaryjna na torach", cmd: "ALLOC", var_name: "zepsuty", val_payload: { val: 2, x: 400, y: 200 }, explanation: "Wagon nr 2 (jest zepsuty)." },
      { group: "Faza 1: Sytuacja awaryjna na torach", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "zepsuty", explanation: "Łączymy." },
      { group: "Faza 1: Sytuacja awaryjna na torach", cmd: "ALLOC", var_name: "dobry", val_payload: { val: 3, x: 700, y: 200 }, explanation: "Wagon nr 3." },
      { group: "Faza 1: Sytuacja awaryjna na torach", cmd: "ASSIGN_FIELD", var_name: "zepsuty", field_name: "next", source_var: "dobry", explanation: "Pociąg 1-2-3 jedzie na torach. Środkowy element uległ awarii." },

      { group: "Faza 2: Identyfikacja sąsiadów", cmd: "ASSIGN_VAR", var_name: "przed", source_var: "head", explanation: "Oznaczamy naklejką 'przed' wagonik, który stoi przed zepsutym." },
      { group: "Faza 2: Identyfikacja sąsiadów", cmd: "ASSIGN_VAR", var_name: "za", source_var: "zepsuty", field_name: "next", explanation: "Oznaczamy naklejką 'za' wagonik, który stoi po zepsutym." },

      { group: "Faza 3: Mostkowanie i Sprzątanie", cmd: "ASSIGN_FIELD", var_name: "przed", field_name: "next", source_var: "za", explanation: "Budujemy ominięcie (most). Wagon przed zepsutym podpinamy bezpośrednio do wagonu za zepsutym." },
      { group: "Faza 3: Mostkowanie i Sprzątanie", cmd: "SET_FIELD_NULL", var_name: "zepsuty", field_name: "next", explanation: "Odpinamy stary sznurek od zepsutego wagonu, żeby niczego nie ciągnął." },
      { group: "Faza 3: Mostkowanie i Sprzątanie", cmd: "FREE", var_name: "zepsuty", explanation: "Wyrzucamy zepsuty wagonik (zwalniamy pamięć). Trasa znów jest przejezdna." }
    ]
  },

  // --- 4. ODWRACANIE LISTY (REVERSE) ---
  {
    id: "sll_reverse",
    title: "4. Zawracanie pociągu (Reverse)",
    description: "Zaawansowany manewr! Odwracamy wszystkie strzałki w pociągu, aby jechał w drugą stronę. Wymaga użycia 3 naklejek w tym samym czasie.",
    codeLines: [
      "Node* prev = NULL;",
      "while (curr != NULL) {",
      "  Node* nxt = curr->next;",
      "  curr->next = prev;",
      "  prev = curr;",
      "  curr = nxt;",
      "}",
      "head = prev;"
    ],
    steps: [
      { group: "Faza 1: Ustawienie składu", cmd: "ALLOC", var_name: "head", val_payload: { val: 10, x: 100, y: 200 }, explanation: "Wagonik 10." },
      { group: "Faza 1: Ustawienie składu", cmd: "ALLOC", var_name: "n2", val_payload: { val: 20, x: 400, y: 200 }, explanation: "Wagonik 20." },
      { group: "Faza 1: Ustawienie składu", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "n2", explanation: "10 -> 20" },
      { group: "Faza 1: Ustawienie składu", cmd: "ALLOC", var_name: "n3", val_payload: { val: 30, x: 700, y: 200 }, explanation: "Wagonik 30." },
      { group: "Faza 1: Ustawienie składu", cmd: "ASSIGN_FIELD", var_name: "n2", field_name: "next", source_var: "n3", explanation: "20 -> 30. Pociąg jedzie w prawo." },

      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "head", explanation: "Naklejamy 'curr' na pierwszy wagon. Zaraz odwrócimy jego strzałkę w tył (w stronę pustki)." },
      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "ASSIGN_VAR", var_name: "nxt", source_var: "curr", explanation: "Zabezpieczamy resztę pociągu naklejką 'nxt'." },
      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "STEP_FORWARD", var_name: "nxt", field_name: "next", explanation: "'nxt' przeskakuje na wagonik 20." },
      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "SET_FIELD_NULL", var_name: "curr", field_name: "next", explanation: "Odcinamy strzałkę z 10. (Dla pierwszego wagonu odwrócenie w tył oznacza wskazywanie na nic - staje się on nowym końcem)." },
      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "ASSIGN_VAR", var_name: "prev", source_var: "curr", explanation: "'prev' (poprzedni) staje się teraz dziesiątką. Będzie punktem zaczepienia dla wagonu nr 20." },
      { group: "Faza 2: Pierwszy wagon zawraca", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "nxt", explanation: "Przeprowadzamy 'curr' do następnego wagonu (20)." },

      { group: "Faza 3: Drugi wagon zawraca", cmd: "ASSIGN_VAR", var_name: "nxt", source_var: "curr", explanation: "Ponownie zabezpieczamy resztę pociągu (wagon 30)." },
      { group: "Faza 3: Drugi wagon zawraca", cmd: "STEP_FORWARD", var_name: "nxt", field_name: "next", explanation: "'nxt' idzie na 30." },
      { group: "Faza 3: Drugi wagon zawraca", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "prev", explanation: "KLUCZOWY MOMENT: Odwracamy! Wagonik 20 zamiast na 30, patrzy teraz wstecz, na wagonik 10 (czyli 'prev')." },
      { group: "Faza 3: Drugi wagon zawraca", cmd: "ASSIGN_VAR", var_name: "prev", source_var: "curr", explanation: "Punkt zaczepienia ('prev') przesuwa się na 20." },
      { group: "Faza 3: Drugi wagon zawraca", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "nxt", explanation: "'curr' idzie na ostatni wagonik (30)." },

      { group: "Faza 4: Finał manewru", cmd: "ASSIGN_VAR", var_name: "nxt", source_var: "curr", explanation: "Zabezpieczamy pustkę po końcu pociągu." },
      { group: "Faza 4: Finał manewru", cmd: "STEP_FORWARD", var_name: "nxt", field_name: "next", explanation: "'nxt' spada z planszy." },
      { group: "Faza 4: Finał manewru", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "prev", explanation: "ODWRACAMY OSTATNI! 30 patrzy na 20." },
      { group: "Faza 4: Finał manewru", cmd: "ASSIGN_VAR", var_name: "head", source_var: "curr", explanation: "Pociąg zawrócił! Naklejka 'head' ląduje na dawnym końcu (30), który stał się nowym początkiem." }
    ]
  },

  // --- 5. KOLEJKA (QUEUE ENQUEUE) ---
  {
    id: "queue_enqueue",
    title: "5. Kolejka: Ktoś dochodzi",
    description: "Kolejka w urzędzie (Pierwszy wchodzi, Pierwszy wychodzi). Jeśli przychodzi nowa osoba, zawsze staje na samym końcu (przy etykiecie 'tail').",
    codeLines: [
      "Node* nowy = new Node(55);",
      "tail->next = nowy;",
      "tail = nowy;"
    ],
    steps: [
      { group: "Faza 1: Kolejka w okienku", cmd: "ALLOC", var_name: "head", val_payload: { val: 11, x: 100, y: 200 }, explanation: "Pierwsza osoba w urzędzie." },
      { group: "Faza 1: Kolejka w okienku", cmd: "ALLOC", var_name: "tail", val_payload: { val: 22, x: 350, y: 200 }, explanation: "Druga osoba, która zamyka kolejkę (tail - ogon)." },
      { group: "Faza 1: Kolejka w okienku", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "tail", explanation: "Kolejka ustawiona w rzędzie." },

      { group: "Faza 2: Obsługa nowego klienta", cmd: "ALLOC", var_name: "nowy", val_payload: { val: 55, x: 600, y: 200 }, explanation: "Przychodzi nowy interesant z numerkiem 55." },
      { group: "Faza 2: Obsługa nowego klienta", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "nowy", explanation: "Poprzednia ostatnia osoba (tail) musi wskazać strzałką na nowego, by stanął za nią." },
      { group: "Faza 2: Obsługa nowego klienta", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "nowy", explanation: "Zdejmujemy naklejkę 'tail' ze starego końca i przyklejamy ją na nową osobę. Teraz ona oficjalnie zamyka kolejkę." }
    ]
  },

  // --- 6. KOLEJKA (QUEUE DEQUEUE) ---
  {
    id: "queue_dequeue",
    title: "6. Kolejka: Obsługa kasy",
    description: "Gdy zwalnia się kasa w urzędzie, obsługiwana jest osoba, która stoi na samym przodzie ('head'). Potem zwalnia ona miejsce kolejnemu.",
    codeLines: [
      "Node* do_usunięcia = head;",
      "head = head->next;",
      "delete do_usunięcia;"
    ],
    steps: [
      { group: "Faza 1: Stan kolejki", cmd: "ALLOC", var_name: "head", val_payload: { val: 11, x: 100, y: 200 }, explanation: "Osoba 11 jest pierwsza w kolejce." },
      { group: "Faza 1: Stan kolejki", cmd: "ALLOC", var_name: "n2", val_payload: { val: 22, x: 350, y: 200 }, explanation: "Osoba 22 czeka." },
      { group: "Faza 1: Stan kolejki", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "n2", explanation: "11 -> 22." },
      { group: "Faza 1: Stan kolejki", cmd: "ALLOC", var_name: "tail", val_payload: { val: 33, x: 600, y: 200 }, explanation: "Osoba 33 zamyka kolejkę." },
      { group: "Faza 1: Stan kolejki", cmd: "ASSIGN_FIELD", var_name: "n2", field_name: "next", source_var: "tail", explanation: "Kolejka: 11 -> 22 -> 33." },

      { group: "Faza 2: Zaproszenie do okienka", cmd: "ASSIGN_VAR", var_name: "okienko", source_var: "head", explanation: "Dajemy osobie pierwszej ('head') naklejkę 'okienko', by wezwać ją do kasy." },
      { group: "Faza 2: Zaproszenie do okienka", cmd: "STEP_FORWARD", var_name: "head", field_name: "next", explanation: "Przesuwamy naklejkę początku kolejki na kolejną osobę (22). Teraz ona jest oficjalnie pierwsza w rzędzie i czeka na swoją kolej." },

      { group: "Faza 3: Wyjście z urzędu", cmd: "SET_FIELD_NULL", var_name: "okienko", field_name: "next", explanation: "Osoba obsłużona przy okienku puszcza rękę (strzałkę) z resztą kolejki." },
      { group: "Faza 3: Wyjście z urzędu", cmd: "FREE", var_name: "okienko", explanation: "Obsłużony klient wychodzi z urzędu (pamięć zostaje zwolniona)." }
    ]
  },

  // --- 7. STOS (STACK PUSH) ---
  {
    id: "stack_push",
    title: "7. Stos: Odkładanie talerza",
    description: "Stos działa inaczej niż kolejka. Wyobraź sobie stos talerzy - nowy talerz kładziemy zawsze na wierzch (oznaczony jako 'top').",
    codeLines: [
      "Node* nowy = new Node(99);",
      "nowy->next = top;",
      "top = nowy;"
    ],
    steps: [
      { group: "Faza 1: Sterta talerzy", cmd: "ALLOC", var_name: "top", val_payload: { val: 10, x: 400, y: 400 }, explanation: "Na stole leży jeden talerz (wartość 10). Ma on etykietę 'top', bo jest na samym szczycie." },
      { group: "Faza 2: Dokładanie na szczyt", cmd: "ALLOC", var_name: "nowy", val_payload: { val: 99, x: 400, y: 150 }, explanation: "Bierzemy nowy talerz (99), który kładziemy WYŻEJ (mniejszy y) na stertę." },
      { group: "Faza 2: Dokładanie na szczyt", cmd: "ASSIGN_FIELD", var_name: "nowy", field_name: "next", source_var: "top", explanation: "Nowy talerz wskazuje w dół, na stary szczyt stosu." },
      { group: "Faza 3: Aktualizacja szczytu", cmd: "ASSIGN_VAR", var_name: "top", source_var: "nowy", explanation: "Przenosimy etykietę 'top' na nasz nowy talerz. Od teraz to on króluje na szczycie!" }
    ]
  },

  // --- 8. STOS (STACK POP) ---
  {
    id: "stack_pop",
    title: "8. Stos: Branie ze szczytu",
    description: "Ze stosu talerzy możemy wziąć tylko ten, który leży na samej górze. Gdy go zdejmiemy, nowym szczytem zostaje ten pod spodem.",
    codeLines: [
      "Node* zdjety = top;",
      "top = top->next;",
      "delete zdjety;"
    ],
    steps: [
      { group: "Faza 1: Sterta talerzy", cmd: "ALLOC", var_name: "top", val_payload: { val: 99, x: 400, y: 150 }, explanation: "Górny talerz (99)." },
      { group: "Faza 1: Sterta talerzy", cmd: "ALLOC", var_name: "drugi", val_payload: { val: 10, x: 400, y: 400 }, explanation: "Dolny talerz (10)." },
      { group: "Faza 1: Sterta talerzy", cmd: "ASSIGN_FIELD", var_name: "top", field_name: "next", source_var: "drugi", explanation: "Górny leży na dolnym." },

      { group: "Faza 2: Operacja zdjęcia", cmd: "ASSIGN_VAR", var_name: "w_rece", source_var: "top", explanation: "Bierzemy w ręce górny talerz." },
      { group: "Faza 2: Operacja zdjęcia", cmd: "STEP_FORWARD", var_name: "top", field_name: "next", explanation: "Szczytem stosu ('top') zostaje automatycznie talerz leżący niżej." },
      { group: "Faza 3: Uprzątnięcie", cmd: "SET_FIELD_NULL", var_name: "w_rece", field_name: "next", explanation: "Odsuwamy wzięty talerz, pękają połączenia w dół." },
      { group: "Faza 3: Uprzątnięcie", cmd: "FREE", var_name: "w_rece", explanation: "Używamy talerza (wyrzucamy z pamięci). Został tylko ten na dole." }
    ]
  },

  // --- 9. SZYBKI I WOLNY WSKAŹNIK ---
  {
    id: "tortoise_hare",
    title: "9. Wyścig: Zając i Żółw",
    description: "Bardzo mądry algorytm! Jak znaleźć środek pociągu, nie licząc wcześniej wagonów? Puszczamy Żółwia (1 krok na raz) i Zająca (2 kroki na raz). Gdy Zając dobiegnie do końca, Żółw będzie w połowie drogi!",
    codeLines: [
      "Node* zolw = head; Node* zajac = head;",
      "while (zajac != NULL && zajac->next != NULL) {",
      "  zolw = zolw->next;",
      "  zajac = zajac->next->next;",
      "}"
    ],
    steps: [
      // Tutaj używamy nieco gęstszego X (co 200px), żeby 5 węzłów zmieściło się ładnie na jednym ekranie
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ALLOC", var_name: "head", val_payload: { val: 1, x: 50, y: 200 }, explanation: "Wagon 1." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ALLOC", var_name: "w2", val_payload: { val: 2, x: 250, y: 200 }, explanation: "Wagon 2." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "w2", explanation: "Łączymy." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ALLOC", var_name: "w3", val_payload: { val: 3, x: 450, y: 200 }, explanation: "Wagon 3 (nasz sekretny środek)." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "next", source_var: "w3", explanation: "Łączymy." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ALLOC", var_name: "w4", val_payload: { val: 4, x: 650, y: 200 }, explanation: "Wagon 4." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ASSIGN_FIELD", var_name: "w3", field_name: "next", source_var: "w4", explanation: "Łączymy." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ALLOC", var_name: "w5", val_payload: { val: 5, x: 850, y: 200 }, explanation: "Wagon 5 (Koniec)." },
      { group: "Faza 1: Budowa toru wyścigowego", cmd: "ASSIGN_FIELD", var_name: "w4", field_name: "next", source_var: "w5", explanation: "Tor z 5 wagonów gotowy." },

      { group: "Faza 2: Zawodnicy na start", cmd: "ASSIGN_VAR", var_name: "zolw", source_var: "head", explanation: "Kładziemy naklejkę Żółwia na pierwszym wagonie." },
      { group: "Faza 2: Zawodnicy na start", cmd: "ASSIGN_VAR", var_name: "zajac", source_var: "head", explanation: "Kładziemy naklejkę Zająca obok Żółwia. Wyścig czas zacząć!" },

      { group: "Faza 3: Runda Pierwsza", cmd: "STEP_FORWARD", var_name: "zolw", field_name: "next", explanation: "Żółw idzie powoli: 1 krok do przodu (na wagon 2)." },
      { group: "Faza 3: Runda Pierwsza", cmd: "STEP_FORWARD", var_name: "zajac", field_name: "next", explanation: "Zając bierze rozpęd: 1..." },
      { group: "Faza 3: Runda Pierwsza", cmd: "STEP_FORWARD", var_name: "zajac", field_name: "next", explanation: "...i 2! Zając skoczył od razu na wagon 3." },

      { group: "Faza 4: Runda Druga i Meta", cmd: "STEP_FORWARD", var_name: "zolw", field_name: "next", explanation: "Żółw człapie na wagon 3." },
      { group: "Faza 4: Runda Druga i Meta", cmd: "STEP_FORWARD", var_name: "zajac", field_name: "next", explanation: "Zając pędzi: 1..." },
      { group: "Faza 4: Runda Druga i Meta", cmd: "STEP_FORWARD", var_name: "zajac", field_name: "next", explanation: "...i 2. Zając dobiega do mety na ostatni wagon nr 5." },

      { group: "Faza 5: Wynik Magii", cmd: "ASSIGN_VAR", var_name: "srodek", source_var: "zolw", explanation: "Zając dotarł do końca. Sprawdzamy, gdzie jest w tym czasie żółw... Zatrzymaliśmy się dokładnie na środkowym wagonie nr 3! Magia matematyki." }
    ]
  },

  // --- 10. BUDOWANIE DRZEWA ---
  {
    id: "tree_build",
    title: "10. Drzewo: Budowa od korzenia",
    description: "Zamiast pociągu w jednej linii, budujemy strukturę, która rozgałęzia się w dół jak piramida. Każde pudełko (rodzic) może mieć dwoje dzieci (lewe i prawe).",
    codeLines: [
      "Node* root = new Node(50);",
      "root->left = new Node(30);",
      "root->right = new Node(70);"
    ],
    steps: [
      // Szersze odstępy dla drzewa, żeby gałęzie na siebie nie nachodziły
      { group: "Faza 1: Posadzenie nasiona", cmd: "ALLOC", var_name: "root", val_payload: { val: 50, x: 500, y: 50 }, explanation: "Stawiamy główne pudełko (Dziadek/Korzeń) z liczbą 50 na samej górze." },

      { group: "Faza 2: Pierwsze pokolenie dzieci", cmd: "ALLOC", var_name: "lewy_syn", val_payload: { val: 30, x: 250, y: 250 }, explanation: "Po lewej stronie, piętro niżej, tworzymy pierwsze dziecko (wartość 30)." },
      { group: "Faza 2: Pierwsze pokolenie dzieci", cmd: "ASSIGN_FIELD", var_name: "root", field_name: "prev", source_var: "lewy_syn", explanation: "Z dziadka wypuszczamy lewą gałąź i łączymy ją z synem." },

      { group: "Faza 2: Pierwsze pokolenie dzieci", cmd: "ALLOC", var_name: "prawy_syn", val_payload: { val: 70, x: 750, y: 250 }, explanation: "Po prawej stronie tworzymy drugie dziecko (wartość 70)." },
      { group: "Faza 2: Pierwsze pokolenie dzieci", cmd: "ASSIGN_FIELD", var_name: "root", field_name: "next", source_var: "prawy_syn", explanation: "Z dziadka wypuszczamy prawą gałąź i łączymy. Mamy trójkąt." },

      { group: "Faza 3: Pojawienie się wnuków", cmd: "ALLOC", var_name: "wnuczek1", val_payload: { val: 20, x: 100, y: 450 }, explanation: "Lewy syn ma własne dziecko (Wnuczek 20)." },
      { group: "Faza 3: Pojawienie się wnuków", cmd: "ASSIGN_FIELD", var_name: "lewy_syn", field_name: "prev", source_var: "wnuczek1", explanation: "Wypuszczamy gałąź łączącą syna z wnukiem." },

      { group: "Faza 3: Pojawienie się wnuków", cmd: "ALLOC", var_name: "wnuczek2", val_payload: { val: 80, x: 900, y: 450 }, explanation: "Prawy syn rodzi wnuczka (Wartość 80)." },
      { group: "Faza 3: Pojawienie się wnuków", cmd: "ASSIGN_FIELD", var_name: "prawy_syn", field_name: "next", source_var: "wnuczek2", explanation: "Wypuszczamy ostatnią gałąź i oto powstaje piękne drzewo!" }
    ]
  },
  // --- 11. MERGE SORTED LISTS (8 WAGONÓW) ---
  {
    id: "sll_merge",
    title: "11. Suwak (Łączenie 2 długich pociągów)",
    description: "Dwa pociągi (po 4 wagony) ułożone rosnąco przyjeżdżają na stację. Łączymy je w jeden długi pociąg 8-wagonowy przepinając strzałki na przemian, niczym zapinanie zamka błyskawicznego.",
    codeLines: [
      "if (p1->val < p2->val) { tail->next = p1; p1 = p1->next; }",
      "else { tail->next = p2; p2 = p2->next; }"
    ],
    steps: [
      // Faza 1: Rozstawienie pociągów zygzakiem
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ALLOC", var_name: "A1", val_payload: { val: 10, x: 100, y: 100 }, explanation: "Pociąg A: Wagon 10." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ALLOC", var_name: "A2", val_payload: { val: 30, x: 400, y: 100 }, explanation: "Wagon 30." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ASSIGN_FIELD", var_name: "A1", field_name: "next", source_var: "A2", explanation: "10 -> 30." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ALLOC", var_name: "A3", val_payload: { val: 50, x: 700, y: 100 }, explanation: "Wagon 50." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ASSIGN_FIELD", var_name: "A2", field_name: "next", source_var: "A3", explanation: "30 -> 50." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ALLOC", var_name: "A4", val_payload: { val: 70, x: 1000, y: 100 }, explanation: "Wagon 70. Pociąg A gotowy." },
      { group: "Faza 1: Wjazd Pociągu Górnego (A)", cmd: "ASSIGN_FIELD", var_name: "A3", field_name: "next", source_var: "A4", explanation: "50 -> 70." },

      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ALLOC", var_name: "B1", val_payload: { val: 20, x: 250, y: 300 }, explanation: "Pociąg B: Wagon 20." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ALLOC", var_name: "B2", val_payload: { val: 40, x: 550, y: 300 }, explanation: "Wagon 40." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ASSIGN_FIELD", var_name: "B1", field_name: "next", source_var: "B2", explanation: "20 -> 40." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ALLOC", var_name: "B3", val_payload: { val: 60, x: 850, y: 300 }, explanation: "Wagon 60." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ASSIGN_FIELD", var_name: "B2", field_name: "next", source_var: "B3", explanation: "40 -> 60." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ALLOC", var_name: "B4", val_payload: { val: 80, x: 1150, y: 300 }, explanation: "Wagon 80. Pociąg B gotowy." },
      { group: "Faza 2: Wjazd Pociągu Dolnego (B)", cmd: "ASSIGN_FIELD", var_name: "B3", field_name: "next", source_var: "B4", explanation: "60 -> 80." },

      { group: "Faza 3: Start łączenia", cmd: "ASSIGN_VAR", var_name: "p1", source_var: "A1", explanation: "Maszynista 'p1' melduje się w pierwszym górnym wagonie (10)." },
      { group: "Faza 3: Start łączenia", cmd: "ASSIGN_VAR", var_name: "p2", source_var: "B1", explanation: "Maszynista 'p2' melduje się w pierwszym dolnym wagonie (20)." },

      // Zamek Krok 1 (10 < 20)
      { group: "Faza 4: Porównanie 10 vs 20", cmd: "COMPARE", var_name: "p1", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p2" }, explanation: "10 jest mniejsze. Zaczynamy budować nowy pociąg od 10!" },
      { group: "Faza 4: Porównanie 10 vs 20", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p1", explanation: "Oznaczamy wagon 10 naklejką 'tail' (ogon naszego nowego super-pociągu)." },
      { group: "Faza 4: Porównanie 10 vs 20", cmd: "STEP_FORWARD", var_name: "p1", field_name: "next", explanation: "Maszynista p1 przechodzi na wagon 30." },

      // Zamek Krok 2 (30 > 20)
      { group: "Faza 5: Porównanie 30 vs 20", cmd: "COMPARE", var_name: "p2", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p1" }, explanation: "Teraz 20 (p2) jest mniejsze od 30 (p1)." },
      { group: "Faza 5: Porównanie 30 vs 20", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p2", explanation: "KLUCZOWY MOMENT! Ogon (10) puszcza stary sznurek i łapie wagon 20 z dolnego toru!" },
      { group: "Faza 5: Porównanie 30 vs 20", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p2", explanation: "Przesuwamy naklejkę ogona na wagon 20." },
      { group: "Faza 5: Porównanie 30 vs 20", cmd: "STEP_FORWARD", var_name: "p2", field_name: "next", explanation: "Maszynista p2 idzie dalej (na 40)." },

      // Zamek Krok 3 (30 < 40)
      { group: "Faza 6: Porównanie 30 vs 40", cmd: "COMPARE", var_name: "p1", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p2" }, explanation: "30 jest mniejsze od 40." },
      { group: "Faza 6: Porównanie 30 vs 40", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p1", explanation: "Ogon (20) łapie wagon 30. Strzałka znów zygzakuje do góry!" },
      { group: "Faza 6: Porównanie 30 vs 40", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p1", explanation: "Ogon przesuwa się na 30." },
      { group: "Faza 6: Porównanie 30 vs 40", cmd: "STEP_FORWARD", var_name: "p1", field_name: "next", explanation: "Maszynista p1 przechodzi na 50." },

      // Zamek Krok 4 (50 > 40)
      { group: "Faza 7: Porównanie 50 vs 40", cmd: "COMPARE", var_name: "p2", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p1" }, explanation: "40 jest mniejsze od 50." },
      { group: "Faza 7: Porównanie 50 vs 40", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p2", explanation: "Ogon (30) łapie wagon 40 w dół." },
      { group: "Faza 7: Porównanie 50 vs 40", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p2", explanation: "Ogon na 40." },
      { group: "Faza 7: Porównanie 50 vs 40", cmd: "STEP_FORWARD", var_name: "p2", field_name: "next", explanation: "Maszynista p2 wchodzi na 60." },

      // Zamek Krok 5 (50 < 60)
      { group: "Faza 8: Porównanie 50 vs 60", cmd: "COMPARE", var_name: "p1", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p2" }, explanation: "50 jest mniejsze od 60." },
      { group: "Faza 8: Porównanie 50 vs 60", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p1", explanation: "Ogon (40) łapie wagon 50 (w górę)." },
      { group: "Faza 8: Porównanie 50 vs 60", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p1", explanation: "Ogon na 50." },
      { group: "Faza 8: Porównanie 50 vs 60", cmd: "STEP_FORWARD", var_name: "p1", field_name: "next", explanation: "Maszynista p1 na 70." },

      // Zamek Krok 6 (70 > 60)
      { group: "Faza 9: Porównanie 70 vs 60", cmd: "COMPARE", var_name: "p2", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p1" }, explanation: "60 jest mniejsze od 70." },
      { group: "Faza 9: Porównanie 70 vs 60", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p2", explanation: "Ogon (50) łapie 60 (w dół)." },
      { group: "Faza 9: Porównanie 70 vs 60", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p2", explanation: "Ogon na 60." },
      { group: "Faza 9: Porównanie 70 vs 60", cmd: "STEP_FORWARD", var_name: "p2", field_name: "next", explanation: "Maszynista p2 na 80." },

      // Zamek Krok 7 (70 < 80)
      { group: "Faza 10: Porównanie 70 vs 80", cmd: "COMPARE", var_name: "p1", field_name: "<", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "p2" }, explanation: "70 jest mniejsze od 80." },
      { group: "Faza 10: Porównanie 70 vs 80", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p1", explanation: "Ogon (60) łapie 70 (w górę)." },
      { group: "Faza 10: Porównanie 70 vs 80", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p1", explanation: "Ogon ląduje na ostatnim górnym wagonie (70)." },
      { group: "Faza 10: Porównanie 70 vs 80", cmd: "STEP_FORWARD", var_name: "p1", field_name: "next", explanation: "Górny pociąg się skończył! Maszynista p1 schodzi z torów (NULL)." },

      // Finał - doklejenie reszty (80)
      { group: "Faza 11: Dopięcie reszty", cmd: "ASSIGN_FIELD", var_name: "tail", field_name: "next", source_var: "p2", explanation: "Skoro na górze nie ma już wagonów, po prostu dopinamy do ogona to, co zostało na dole (wagon 80)." },
      { group: "Faza 11: Dopięcie reszty", cmd: "ASSIGN_VAR", var_name: "tail", source_var: "p2", explanation: "Zamek błyskawiczny zamknięty! Mamy jeden połączony, zygzakowaty pociąg: 10->20->30->40->50->60->70->80." }
    ]
  },

  // --- 12. CYCLE DETECTION (ZMIANA NA TRASĘ LEŚNĄ) ---
  {
    id: "sll_cycle",
    title: "12. Zgubieni w Lesie (Wykrywanie Pętli)",
    description: "Ktoś dla żartu przestawił drogowskaz na szlaku turystycznym tak, że kieruje z powrotem na początek lasu. Puszczamy Biegacza i Spacerowicza - jeśli biegacz zdubluje pieszego, to znak, że chodzimy w kółko!",
    codeLines: [
      "while (biegacz != NULL && biegacz->next != NULL) {",
      "  pieszy = pieszy->next; biegacz = biegacz->next->next;",
      "  if (pieszy == biegacz) return true; // Pętla!",
      "}"
    ],
    steps: [
      { group: "Faza 1: Tworzenie trasy", cmd: "ALLOC", var_name: "punkt1", val_payload: { val: 1, x: 100, y: 200 }, explanation: "Wejście do lasu (Punkt 1)." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ALLOC", var_name: "punkt2", val_payload: { val: 2, x: 350, y: 200 }, explanation: "Punkt widokowy (2)." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ASSIGN_FIELD", var_name: "punkt1", field_name: "next", source_var: "punkt2", explanation: "Ścieżka z 1 do 2." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ALLOC", var_name: "punkt3", val_payload: { val: 3, x: 600, y: 200 }, explanation: "Stary Dąb (3)." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ASSIGN_FIELD", var_name: "punkt2", field_name: "next", source_var: "punkt3", explanation: "Ścieżka z 2 do 3." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ALLOC", var_name: "punkt4", val_payload: { val: 4, x: 850, y: 200 }, explanation: "Mostek (4)." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ASSIGN_FIELD", var_name: "punkt3", field_name: "next", source_var: "punkt4", explanation: "Ścieżka z 3 do 4." },
      { group: "Faza 1: Tworzenie trasy", cmd: "ASSIGN_FIELD", var_name: "punkt4", field_name: "next", source_var: "punkt2", explanation: "SABOTAŻ! Drogowskaz przy moście nie wskazuje wyjścia, tylko cofa na punkt widokowy (2). Trasa jest zapętlona." },

      { group: "Faza 2: Start poszukiwań", cmd: "ASSIGN_VAR", var_name: "pieszy", source_var: "punkt1", explanation: "Powolny turysta wchodzi na szlak." },
      { group: "Faza 2: Start poszukiwań", cmd: "ASSIGN_VAR", var_name: "biegacz", source_var: "punkt1", explanation: "Biegacz startuje razem z nim (biegnie 2x szybciej)." },

      { group: "Faza 3: Runda 1", cmd: "STEP_FORWARD", var_name: "pieszy", field_name: "next", explanation: "Pieszy dochodzi do punktu 2." },
      { group: "Faza 3: Runda 1", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "Biegacz mija punkt 2..." },
      { group: "Faza 3: Runda 1", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "...i od razu ląduje na punkcie 3." },

      { group: "Faza 4: Wpadnięcie w pułapkę", cmd: "STEP_FORWARD", var_name: "pieszy", field_name: "next", explanation: "Pieszy spokojnie dociera na punkt 3." },
      { group: "Faza 4: Wpadnięcie w pułapkę", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "Biegacz dociera do mostu (4)..." },
      { group: "Faza 4: Wpadnięcie w pułapkę", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "...i zła ścieżka wyrzuca go Z POWROTEM na punkt widokowy (2)!" },

      { group: "Faza 5: Spotkanie", cmd: "STEP_FORWARD", var_name: "pieszy", field_name: "next", explanation: "Pieszy dociera do mostu (4)." },
      { group: "Faza 5: Spotkanie", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "Biegacz biegnie z 2 na 3..." },
      { group: "Faza 5: Spotkanie", cmd: "STEP_FORWARD", var_name: "biegacz", field_name: "next", explanation: "...i z 3 na most (4). UWAGA! Biegacz minął zdezorientowanego pieszego od tyłu!" },
      { group: "Faza 5: Spotkanie", cmd: "COMPARE", var_name: "pieszy", field_name: "==", val_payload: { targetNode: "res", compareMode: "variable", rightValue: "biegacz" }, explanation: "Zdublowanie się na szlaku to absolutny dowód matematyczny, że wędrujemy w pętli!" }
    ]
  },

  // --- 13. REMOVE DUPLICATES (Z POTRÓJNYM DUPLIKATEM) ---
  {
    id: "sll_remove_dupes",
    title: "13. Kontrola Biletów (Usuwanie trójkątów i duplikatów)",
    description: "Mamy wagony: 10,20,20,30,40,50,50,50,60. Usuwamy duble. Kluczowe jest to, że po usunięciu rewizor nie idzie do przodu! Zostaje na miejscu, by sprawdzić, czy kolejny wagon to znów nie jest klon (np. trzy 50-tki).",
    codeLines: [
      "if (curr->val == curr->next->val) {",
      "  Node* temp = curr->next;",
      "  curr->next = temp->next;",
      "  delete temp;",
      "} else { curr = curr->next; }"
    ],
    steps: [
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "head", val_payload: { val: 10, x: 50, y: 200 }, explanation: "Budujemy pociąg. Wagon 10." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w2", val_payload: { val: 20, x: 150, y: 200 }, explanation: "Wagon 20." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "head", field_name: "next", source_var: "w2", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w3", val_payload: { val: 20, x: 250, y: 200 }, explanation: "Klon! Wagon 20." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "next", source_var: "w3", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w4", val_payload: { val: 30, x: 350, y: 200 }, explanation: "Wagon 30." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w3", field_name: "next", source_var: "w4", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w5", val_payload: { val: 50, x: 450, y: 200 }, explanation: "Wagon 50." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w4", field_name: "next", source_var: "w5", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w6", val_payload: { val: 50, x: 550, y: 200 }, explanation: "Klon! Wagon 50." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w5", field_name: "next", source_var: "w6", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w7", val_payload: { val: 50, x: 650, y: 200 }, explanation: "Potrójny Klon! Wagon 50." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w6", field_name: "next", source_var: "w7", explanation: "Link." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ALLOC", var_name: "w8", val_payload: { val: 60, x: 750, y: 200 }, explanation: "Wagon 60." },
      { group: "Faza 1: Rozbudowany pociąg klonów", cmd: "ASSIGN_FIELD", var_name: "w7", field_name: "next", source_var: "w8", explanation: "Pociąg: 10-20-20-30-50-50-50-60." },

      { group: "Faza 2: Pierwszy duplikat (20)", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w2", explanation: "Rewizor 'curr' wchodzi do wagonu 20 (w2)." },
      { group: "Faza 2: Pierwszy duplikat (20)", cmd: "ASSIGN_VAR", var_name: "temp", source_var: "curr", field_name: "next", explanation: "Zagląda do następnego. To też 20 (oznacza go jako temp)." },
      { group: "Faza 2: Pierwszy duplikat (20)", cmd: "ASSIGN_VAR", var_name: "za_klonem", source_var: "temp", field_name: "next", explanation: "Patrzy, co jest za klonem (tam jest wagon 30)." },
      { group: "Faza 2: Pierwszy duplikat (20)", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "za_klonem", explanation: "Mostkujemy! 'curr' (20) łapie od razu za wagon 30, omijając klona." },
      { group: "Faza 2: Pierwszy duplikat (20)", cmd: "FREE", var_name: "temp", explanation: "Pierwszy klon 20 zniszczony. WAŻNE: Rewizor nie idzie dalej, tylko bada nową sytuację ze swojej pozycji!" },

      { group: "Faza 3: Przejście dalej", cmd: "STEP_FORWARD", var_name: "curr", field_name: "next", explanation: "Teraz za rewizorem jest 30 (różne), więc przechodzi na wagon 30." },
      { group: "Faza 3: Przejście dalej", cmd: "STEP_FORWARD", var_name: "curr", field_name: "next", explanation: "Przechodzi na wagon 50 (w5)." },

      { group: "Faza 4: Pierwszy z 50-tek", cmd: "ASSIGN_VAR", var_name: "temp", source_var: "curr", field_name: "next", explanation: "Rewizor (w5) widzi przed sobą klona 50 (w6)." },
      { group: "Faza 4: Pierwszy z 50-tek", cmd: "ASSIGN_VAR", var_name: "za_klonem", source_var: "temp", field_name: "next", explanation: "Za nim jest kolejny klon 50 (w7)." },
      { group: "Faza 4: Pierwszy z 50-tek", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "za_klonem", explanation: "Mostkuje omijając w6." },
      { group: "Faza 4: Pierwszy z 50-tek", cmd: "FREE", var_name: "temp", explanation: "Niszczy w6. Rewizor nadal stoi w wagonie w5 (wartość 50)." },

      { group: "Faza 5: Potrójny duplikat (magia algorytmu)", cmd: "ASSIGN_VAR", var_name: "temp", source_var: "curr", field_name: "next", explanation: "Rewizor ZNOWU ze swojego miejsca patrzy przed siebie. Widzi nowo podpięty wagon w7 (wartość 50). Znów klon!" },
      { group: "Faza 5: Potrójny duplikat (magia algorytmu)", cmd: "ASSIGN_VAR", var_name: "za_klonem", source_var: "temp", field_name: "next", explanation: "Za nim jest wagon 60 (w8)." },
      { group: "Faza 5: Potrójny duplikat (magia algorytmu)", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "za_klonem", explanation: "Znów mostkuje, podpinając w5 prosto do 60." },
      { group: "Faza 5: Potrójny duplikat (magia algorytmu)", cmd: "FREE", var_name: "temp", explanation: "Niszczy ostatniego klona. Z potrójnego 50 zostało jedno. Pociąg jest czysty!" }
    ]
  },

  // --- 14. N-TH FROM END (ZWIADOWCA NOWA FABUŁA) ---
  {
    id: "nth_from_end",
    title: "14. Zwiadowca (Szukanie 2. od końca)",
    description: "Wyobraź sobie głęboki wąwóz. Chcemy postawić znacznik dokładnie 2 kroki przed przepaścią, ale nie wiemy, jak długa jest droga. Używamy liny! Zwiadowca idzie 2 kroki w przód, a my trzymamy napiętą linę za nim. Kiedy on spadnie, my stoimy w idealnym miejscu.",
    codeLines: [
      "Node* my = head; Node* zwiadowca = head;",
      "for(int i=0; i<N; i++) zwiadowca = zwiadowca->next;",
      "while (zwiadowca != NULL) { my=my->next; zwiadowca=zwiadowca->next; }"
    ],
    steps: [
      { group: "Faza 1: Mglista droga", cmd: "ALLOC", var_name: "w1", val_payload: { val: 10, x: 100, y: 200 }, explanation: "Rozstawiamy 5 kroków." },
      { group: "Faza 1: Mglista droga", cmd: "ALLOC", var_name: "w2", val_payload: { val: 20, x: 250, y: 200 }, explanation: "Krok 20." },
      { group: "Faza 1: Mglista droga", cmd: "ASSIGN_FIELD", var_name: "w1", field_name: "next", source_var: "w2", explanation: "Link." },
      { group: "Faza 1: Mglista droga", cmd: "ALLOC", var_name: "w3", val_payload: { val: 30, x: 400, y: 200 }, explanation: "Krok 30." },
      { group: "Faza 1: Mglista droga", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "next", source_var: "w3", explanation: "Link." },
      { group: "Faza 1: Mglista droga", cmd: "ALLOC", var_name: "w4", val_payload: { val: 40, x: 550, y: 200 }, explanation: "Krok 40 (Nasz CEL - 2 od końca)." },
      { group: "Faza 1: Mglista droga", cmd: "ASSIGN_FIELD", var_name: "w3", field_name: "next", source_var: "w4", explanation: "Link." },
      { group: "Faza 1: Mglista droga", cmd: "ALLOC", var_name: "w5", val_payload: { val: 50, x: 700, y: 200 }, explanation: "Krok 50 (Ostatni krok przed przepaścią)." },
      { group: "Faza 1: Mglista droga", cmd: "ASSIGN_FIELD", var_name: "w4", field_name: "next", source_var: "w5", explanation: "Droga gotowa. Na końcu czai się NULL." },

      { group: "Faza 2: Naciąganie liny (fory)", cmd: "ASSIGN_VAR", var_name: "my", source_var: "w1", explanation: "Stajemy (jako 'my') na samym początku trasy." },
      { group: "Faza 2: Naciąganie liny (fory)", cmd: "ASSIGN_VAR", var_name: "zwiadowca", source_var: "w1", explanation: "Zwiadowca również staje na początku." },
      { group: "Faza 2: Naciąganie liny (fory)", cmd: "STEP_FORWARD", var_name: "zwiadowca", field_name: "next", explanation: "Zwiadowca robi 1. krok oddalając się od nas." },
      { group: "Faza 2: Naciąganie liny (fory)", cmd: "STEP_FORWARD", var_name: "zwiadowca", field_name: "next", explanation: "Zwiadowca robi 2. krok (lina ma teraz dokładnie 2 jednostki długości)." },

      { group: "Faza 3: Równy marsz", cmd: "STEP_FORWARD", var_name: "my", field_name: "next", explanation: "My robimy krok (na 20)." },
      { group: "Faza 3: Równy marsz", cmd: "STEP_FORWARD", var_name: "zwiadowca", field_name: "next", explanation: "Zwiadowca robi krok (na 40). Odstęp zachowany." },

      { group: "Faza 4: Wykrycie końca", cmd: "STEP_FORWARD", var_name: "my", field_name: "next", explanation: "My robimy krok (na 30)." },
      { group: "Faza 4: Wykrycie końca", cmd: "STEP_FORWARD", var_name: "zwiadowca", field_name: "next", explanation: "Zwiadowca staje na ostatniej płycie (50)." },

      { group: "Faza 5: Finał", cmd: "STEP_FORWARD", var_name: "my", field_name: "next", explanation: "My robimy ostatni krok (stajemy na 40)." },
      { group: "Faza 5: Finał", cmd: "STEP_FORWARD", var_name: "zwiadowca", field_name: "next", explanation: "Zwiadowca robi krok i wpada w NULL! Ponieważ lina miała długość 2 kroków, my automatycznie zatrzymaliśmy się dokładnie 2 kroki od krawędzi (wartość 40)." }
    ]
  },

  // --- 15a. KARUZELA DOBRA ---
  {
    id: "circular_carousel_ok",
    title: "15a. Karuzela (Tworzenie pętli celowej)",
    description: "Budujemy karuzelę. Ostatni element wskazuje na pierwszy. Możemy na niej krążyć w nieskończoność bez uderzania w przepaść (NULL).",
    codeLines: [
      "tail->next = head;",
      "curr = curr->next; // Działa w kółko"
    ],
    steps: [
      { group: "Faza 1: Budowa", cmd: "ALLOC", var_name: "k1", val_payload: { val: 1, x: 250, y: 150 }, explanation: "Krzesełko 1." },
      { group: "Faza 1: Budowa", cmd: "ALLOC", var_name: "k2", val_payload: { val: 2, x: 450, y: 300 }, explanation: "Krzesełko 2." },
      { group: "Faza 1: Budowa", cmd: "ASSIGN_FIELD", var_name: "k1", field_name: "next", source_var: "k2", explanation: "1 patrzy na 2." },
      { group: "Faza 1: Budowa", cmd: "ALLOC", var_name: "k3", val_payload: { val: 3, x: 100, y: 300 }, explanation: "Krzesełko 3." },
      { group: "Faza 1: Budowa", cmd: "ASSIGN_FIELD", var_name: "k2", field_name: "next", source_var: "k3", explanation: "2 patrzy na 3." },
      { group: "Faza 1: Budowa", cmd: "ASSIGN_FIELD", var_name: "k3", field_name: "next", source_var: "k1", explanation: "ZAMKNIĘCIE: Ostatnie 3 patrzy z powrotem na 1." },

      { group: "Faza 2: Bezpieczna jazda", cmd: "ASSIGN_VAR", var_name: "osoba", source_var: "k1", explanation: "Pasażer siada na 1." },
      { group: "Faza 2: Bezpieczna jazda", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Jedzie na 2." },
      { group: "Faza 2: Bezpieczna jazda", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Jedzie na 3." },
      { group: "Faza 2: Bezpieczna jazda", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Jedzie z powrotem na 1! Kręci się bez końca, brak błędów." }
    ]
  },

  // --- 15b. KARUZELA ZEPSUTA (NULL POINTER EXCEPTION) ---
  {
    id: "circular_carousel_fail",
    title: "15b. Karuzela BŁĘDNA (Błąd Wykolejenia)",
    description: "Co się stanie, jeśli zapomnimy połączyć ostatnie krzesełko z pierwszym? Pasażer jadący dalej natrafi na pustkę (NULL) i program zaliczy katastrofę (Crash).",
    codeLines: [
      "// Brak linii tail->next = head;",
      "curr = curr->next;",
      "print(curr->val); // CRASH (NULL POINTER EXCEPTION)"
    ],
    steps: [
      { group: "Faza 1: Budowa (Niedokończona)", cmd: "ALLOC", var_name: "k1", val_payload: { val: 1, x: 250, y: 150 }, explanation: "Krzesełko 1." },
      { group: "Faza 1: Budowa (Niedokończona)", cmd: "ALLOC", var_name: "k2", val_payload: { val: 2, x: 450, y: 300 }, explanation: "Krzesełko 2." },
      { group: "Faza 1: Budowa (Niedokończona)", cmd: "ASSIGN_FIELD", var_name: "k1", field_name: "next", source_var: "k2", explanation: "1 patrzy na 2." },
      { group: "Faza 1: Budowa (Niedokończona)", cmd: "ALLOC", var_name: "k3", val_payload: { val: 3, x: 100, y: 300 }, explanation: "Krzesełko 3. ZAPOMINAMY je połączyć z powrotem do 1!" },
      { group: "Faza 1: Budowa (Niedokończona)", cmd: "ASSIGN_FIELD", var_name: "k2", field_name: "next", source_var: "k3", explanation: "2 patrzy na 3. Za krzesełkiem nr 3 czyha przepaść (NULL)." },

      { group: "Faza 2: Jazda i Wypadek", cmd: "ASSIGN_VAR", var_name: "osoba", source_var: "k1", explanation: "Pasażer siada na 1, myśląc że to karuzela." },
      { group: "Faza 2: Jazda i Wypadek", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Jedzie na 2." },
      { group: "Faza 2: Jazda i Wypadek", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Jedzie na 3." },
      { group: "Faza 2: Jazda i Wypadek", cmd: "STEP_FORWARD", var_name: "osoba", field_name: "next", explanation: "Próbuje pojechać dalej... i wypada z trasy (Null Pointer)! Brak połączenia zniszczył system." }
    ]
  },

  // --- 16. JOSEPHUS (POPRAWIONA LOGIKA ZMIENNYCH) ---
  {
    id: "josephus",
    title: "16. Gra w Berka (Problem Józefa)",
    description: "Gracze stoją w kółku. Eliminujemy co drugą osobę, aż zostanie jedna. Gracz 1 wskazuje Gracza 2 (ofiarę), puszcza jego rękę i łapie za rękę Gracza 3.",
    codeLines: [
      "Node* ofiara = curr->next;",
      "curr->next = ofiara->next;",
      "delete ofiara;"
    ],
    steps: [
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ALLOC", var_name: "Gracz1", val_payload: { val: 1, x: 250, y: 150 }, explanation: "Gracz 1." },
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ALLOC", var_name: "Gracz2", val_payload: { val: 2, x: 450, y: 150 }, explanation: "Gracz 2." },
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ASSIGN_FIELD", var_name: "Gracz1", field_name: "next", source_var: "Gracz2", explanation: "G1 łapie G2." },
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ALLOC", var_name: "Gracz3", val_payload: { val: 3, x: 350, y: 350 }, explanation: "Gracz 3." },
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ASSIGN_FIELD", var_name: "Gracz2", field_name: "next", source_var: "Gracz3", explanation: "G2 łapie G3." },
      { group: "Faza 1: Kółko zaplata ręce", cmd: "ASSIGN_FIELD", var_name: "Gracz3", field_name: "next", source_var: "Gracz1", explanation: "G3 łapie G1. Koło zamknięte." },

      { group: "Faza 2: Wskazanie", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "Gracz1", explanation: "Zaczynamy. Zmienna 'curr' oznacza bezpiecznego gracza (Gracz 1 krzyczy: JESTEM BEZPIECZNY!)." },
      { group: "Faza 2: Wskazanie", cmd: "ASSIGN_VAR", var_name: "ofiara", source_var: "Gracz2", explanation: "Gracz 1 wskazuje na następnego w kolejce (Gracza 2) i przypina mu łatkę 'ofiara'." },
      { group: "Faza 2: Wskazanie", cmd: "ASSIGN_VAR", var_name: "za_ofiara", source_var: "Gracz3", explanation: "Oznaczamy Gracza 3 jako 'za_ofiara' (to on zostanie złapany za rękę przez G1)." },

      { group: "Faza 3: Eliminacja", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "za_ofiara", explanation: "Gracz 1 wypuszcza rękę ofiary i łapie Gracza 3. Ofiara jest wykluczona z uścisku." },
      { group: "Faza 3: Eliminacja", cmd: "FREE", var_name: "ofiara", explanation: "Gracz 2 (ofiara) oficjalnie opuszcza grę (usunięty z pamięci). W kole zostają tylko 1 i 3." }
    ]
  },
  // --- 6. JOSEPHUS PROBLEM ---
  {
    id: "josephus",
    title: "16. Gra w Berka (Problem Józefa)",
    description: "Grupa stoi w kółku (Karuzela). Wyliczamy: 'jeden, dwa, ODPADASZ'. Eliminujemy co drugą osobę, aż zostanie tylko jedna. Tu pokażemy pierwszą eliminację.",
    codeLines: [
      "Node* ofiara = curr->next;",
      "curr->next = ofiara->next;",
      "delete ofiara;"
    ],
    steps: [
      { group: "Faza 1: Ludzie w kółku", cmd: "ALLOC", var_name: "g1", val_payload: { val: 1, x: 250, y: 150 }, explanation: "Gracz 1." },
      { group: "Faza 1: Ludzie w kółku", cmd: "ALLOC", var_name: "g2", val_payload: { val: 2, x: 450, y: 150 }, explanation: "Gracz 2." },
      { group: "Faza 1: Ludzie w kółku", cmd: "ASSIGN_FIELD", var_name: "g1", field_name: "next", source_var: "g2", explanation: "Złapani za ręce." },
      { group: "Faza 1: Ludzie w kółku", cmd: "ALLOC", var_name: "g3", val_payload: { val: 3, x: 350, y: 350 }, explanation: "Gracz 3." },
      { group: "Faza 1: Ludzie w kółku", cmd: "ASSIGN_FIELD", var_name: "g2", field_name: "next", source_var: "g3", explanation: "Złapani za ręce." },
      { group: "Faza 1: Ludzie w kółku", cmd: "ASSIGN_FIELD", var_name: "g3", field_name: "next", source_var: "g1", explanation: "Kółko zamknięte. Gramy w berka!" },

      { group: "Faza 2: Wyliczanka", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "g1", explanation: "Gracz 1 krzyczy 'JEDEN! JESTEM BEZPIECZNY'. Wskazuje palcem na Gracz 2." },
      { group: "Faza 2: Wyliczanka", cmd: "ASSIGN_VAR", var_name: "ofiara", source_var: "curr", field_name: "next", explanation: "Oznaczamy Gracza 2 naklejką 'ofiara'." },

      { group: "Faza 3: Eliminacja z kółka", cmd: "ASSIGN_VAR", var_name: "za_ofiara", source_var: "ofiara", field_name: "next", explanation: "Sprawdzamy kto stoi za ofiarą (to Gracz 3)." },
      { group: "Faza 3: Eliminacja z kółka", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "za_ofiara", explanation: "Gracz 1 puszcza rękę ofiary i łapie za rękę Gracza 3. Kółko zacieśnia się nad głową ofiary." },
      { group: "Faza 3: Eliminacja z kółka", cmd: "FREE", var_name: "ofiara", explanation: "Gracz 2 wyrzucony z gry (zwolniona pamięć). W grze zostają 1 i 3, trzymając się za ręce." }
    ]
  },

  // --- 7. BST SEARCH ---
  {
    id: "bst_search",
    title: "17. Mapa Skarbów (Szukanie w drzewie BST)",
    description: "Drzewo BST to genialna biblioteka: wszystkie liczby mniejsze są na lewych gałęziach, a większe na prawych. Szukamy liczby 20.",
    codeLines: [
      "if (val == target) return curr;",
      "if (val > target) curr = curr->left;",
      "else curr = curr->right;"
    ],
    steps: [
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ALLOC", var_name: "root", val_payload: { val: 50, x: 500, y: 100 }, explanation: "Korzeń lasu: 50." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ALLOC", var_name: "L", val_payload: { val: 30, x: 300, y: 250 }, explanation: "Dziecko lewe mniejsze: 30." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ASSIGN_FIELD", var_name: "root", field_name: "prev", source_var: "L", explanation: "50 wskazuje na 30." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ALLOC", var_name: "R", val_payload: { val: 70, x: 700, y: 250 }, explanation: "Dziecko prawe większe: 70." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ASSIGN_FIELD", var_name: "root", field_name: "next", source_var: "R", explanation: "50 wskazuje na 70." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ALLOC", var_name: "LL", val_payload: { val: 20, x: 150, y: 400 }, explanation: "Wnuk lewy (od 30) - nasz skarb: 20." },
      { group: "Faza 1: Las (Budowa Drzewa)", cmd: "ASSIGN_FIELD", var_name: "L", field_name: "prev", source_var: "LL", explanation: "Drzewo gotowe. Mamy ścieżkę do skarbu." },

      { group: "Faza 2: Nawigacja na rozwidleniu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "root", explanation: "Stajemy pod wielkim drzewem (50)." },
      { group: "Faza 2: Nawigacja na rozwidleniu", cmd: "COMPARE", var_name: "curr", field_name: ">", val_payload: { targetNode: "res", compareMode: "number", rightValue: 20 }, explanation: "Zadajemy pytanie: Czy obecne 50 jest WIĘKSZE od poszukiwanego 20? TAK. Zatem mniejsze liczby muszą rosnąć w LEWO." },
      { group: "Faza 2: Nawigacja na rozwidleniu", cmd: "STEP_FORWARD", var_name: "curr", field_name: "prev", explanation: "Skręcamy w lewą gałąź ('prev') i schodzimy do węzła 30." },

      { group: "Faza 3: Drugie rozwidlenie", cmd: "COMPARE", var_name: "curr", field_name: ">", val_payload: { targetNode: "res", compareMode: "number", rightValue: 20 }, explanation: "Pytamy znów: Czy 30 jest większe od 20? TAK. Znów musimy skręcić w lewo." },
      { group: "Faza 3: Drugie rozwidlenie", cmd: "STEP_FORWARD", var_name: "curr", field_name: "prev", explanation: "Skręcamy znowu w lewą gałąź i schodzimy niżej." },

      { group: "Faza 4: Odnalezienie Skarbu", cmd: "COMPARE", var_name: "curr", field_name: "==", val_payload: { targetNode: "res", compareMode: "number", rightValue: 20 }, explanation: "Dotarliśmy do 20. Czy to nasza liczba? TAK! Użyliśmy zasad BST, by dojść tu jak po sznurku, bez błądzenia." }
    ]
  },

  // --- 8. BST INSERT ---
  {
    id: "bst_insert",
    title: "18. Sadzenie Jabłka (Wstawianie do Drzewa BST)",
    description: "Zrzucamy jabłko z wartością 40 na szczyt drzewa. Spada w dół, odbijając się w lewo (gdy mniejsze) lub prawo (gdy większe), aż spadnie na pustą ziemię, gdzie zapuszcza korzenie.",
    codeLines: [
      "if (val > curr->val) {",
      "  if(curr->right == NULL) curr->right = new Node(val);",
      "  else curr = curr->right;",
      "}"
    ],
    steps: [
      { group: "Faza 1: Obecne Drzewo", cmd: "ALLOC", var_name: "root", val_payload: { val: 50, x: 500, y: 100 }, explanation: "Korzeń to 50." },
      { group: "Faza 1: Obecne Drzewo", cmd: "ALLOC", var_name: "L", val_payload: { val: 30, x: 300, y: 250 }, explanation: "Lewa gałąź to 30." },
      { group: "Faza 1: Obecne Drzewo", cmd: "ASSIGN_FIELD", var_name: "root", field_name: "prev", source_var: "L", explanation: "Połączone." },

      { group: "Faza 2: Spadanie (Nawigacja)", cmd: "ASSIGN_VAR", var_name: "jablko", source_var: "root", explanation: "Jabłko o wartości 40 uderza w szczyt drzewa (50)." },
      { group: "Faza 2: Spadanie (Nawigacja)", cmd: "COMPARE", var_name: "jablko", field_name: ">", val_payload: { targetNode: "res", compareMode: "number", rightValue: 40 }, explanation: "Drzewo 50 jest większe od jabłka 40, więc gałąź odpycha jabłko w LEWO." },
      { group: "Faza 2: Spadanie (Nawigacja)", cmd: "STEP_FORWARD", var_name: "jablko", field_name: "prev", explanation: "Jabłko spada w dół po lewej gałęzi i uderza w 30." },

      { group: "Faza 3: Szukanie gleby", cmd: "COMPARE", var_name: "jablko", field_name: "<", val_payload: { targetNode: "res", compareMode: "number", rightValue: 40 }, explanation: "Węzeł 30 jest mniejszy niż jabłko 40, więc tym razem gałąź odpycha je w PRAWO." },
      { group: "Faza 3: Szukanie gleby", cmd: "CHECK_NULL", var_name: "jablko", explanation: "Ale uwaga! Po prawej stronie węzła 30 nie ma nic (pusto, ziemia)!" },

      { group: "Faza 4: Zapuszczenie korzeni", cmd: "ALLOC", var_name: "nowe_jablko", val_payload: { val: 40, x: 450, y: 400 }, explanation: "Owoc opada na ziemię i zamienia się w nowy węzeł o wartości 40." },
      { group: "Faza 4: Zapuszczenie korzeni", cmd: "ASSIGN_FIELD", var_name: "jablko", field_name: "next", source_var: "nowe_jablko", explanation: "Węzeł 30 wypuszcza nową prawą gałąź do naszego nowo posadzonego węzła 40. Sadzenie udane!" }
    ]
  },

  // --- 9. DLL REVERSE ---
  {
    id: "dll_reverse",
    title: "19. Generalny Remont (Odwracanie Dwukierunkowe)",
    description: "W pociągu, gdzie każdy wagon ma hak przedni i tylny, zamieniamy te haki miejscami. To, co patrzyło w przód, patrzy w tył, a to co w tył, w przód.",
    codeLines: [
      "Node* temp = curr->next;",
      "curr->next = curr->prev;",
      "curr->prev = temp;"
    ],
    steps: [
      { group: "Faza 1: Pociąg 2-kierunkowy", cmd: "ALLOC", var_name: "w1", val_payload: { val: 10, x: 150, y: 200 }, explanation: "Pierwszy wagon." },
      { group: "Faza 1: Pociąg 2-kierunkowy", cmd: "ALLOC", var_name: "w2", val_payload: { val: 20, x: 450, y: 200 }, explanation: "Drugi wagon." },
      { group: "Faza 1: Pociąg 2-kierunkowy", cmd: "ASSIGN_FIELD", var_name: "w1", field_name: "next", source_var: "w2", explanation: "10 patrzy w przód na 20." },
      { group: "Faza 1: Pociąg 2-kierunkowy", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "prev", source_var: "w1", explanation: "20 patrzy w tył na 10. Połączenie pancerne gotowe." },

      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w1", explanation: "Wchodzimy do pierwszego wagonu (10)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_VAR", var_name: "zapas", source_var: "curr", field_name: "next", explanation: "Bierzemy prawy hak do ręki (zapas)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "curr", explanation: "Mechanik przekręca hak NEXT tak, aby działał jak PREV (na razie puści 20)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "prev", source_var: "zapas", explanation: "A hak PREV wpina w stary NEXT (czyli w wagon 20). 1. wagon obrócony fizycznie o 180 stopni!" },

      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w2", explanation: "Idziemy do drugiego wagonu (20)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_VAR", var_name: "zapas", source_var: "curr", field_name: "next", explanation: "Łapiemy jego prawy hak do ręki (zapas to pustka, bo to koniec pociągu)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "curr", explanation: "Przepinamy NEXT na to gdzie patrzył PREV (czyli wstecz na 10)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "prev", source_var: "zapas", explanation: "Przepinamy PREV w pustkę. Drugi wagon również obrócony! Pociąg jedzie w lewo." }
    ]
  },

  // --- 10. VALUE SWAP (BUBBLE) ---
  {
    id: "dll_reverse",
    title: "19. Generalny Remont (Odwracanie Dwukierunkowe)",
    description: "Odwracamy pociąg dwukierunkowy. Oznacza to fizyczną zamianę miejsc prawego i lewego haka w każdym wagonie. Utrzymujemy wagony w linii poziomej, zmienia się tylko kierunek strzałek.",
    codeLines: [
      "Node* temp = curr->next;",
      "curr->next = curr->prev;",
      "curr->prev = temp;"
    ],
    steps: [
      // Ważne: ustawiamy Y na identyczne (200), X na równomierne, żeby wyglądało jak rzepik
      { group: "Faza 1: Pociąg patrzy w prawo", cmd: "ALLOC", var_name: "w1", val_payload: { val: 10, x: 100, y: 200 }, explanation: "Pierwszy wagon (Lewy)." },
      { group: "Faza 1: Pociąg patrzy w prawo", cmd: "ALLOC", var_name: "w2", val_payload: { val: 20, x: 400, y: 200 }, explanation: "Drugi wagon (Prawy)." },
      { group: "Faza 1: Pociąg patrzy w prawo", cmd: "ASSIGN_FIELD", var_name: "w1", field_name: "next", source_var: "w2", explanation: "Wagon lewy łapie prawego (10->20)." },
      { group: "Faza 1: Pociąg patrzy w prawo", cmd: "ASSIGN_FIELD", var_name: "w2", field_name: "prev", source_var: "w1", explanation: "Wagon prawy odpowiada uściskiem z tyłu (20->10)." },

      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w1", explanation: "Wchodzimy do pierwszego wagonu (10)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_VAR", var_name: "prawyHak", source_var: "w2", explanation: "Zdejmujemy jego prawy hak i trzymamy go w ręce ('prawyHak' wskazuje na w2)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "SET_FIELD_NULL", var_name: "curr", field_name: "next", explanation: "W1 nie ma przed sobą nic (zamieniony w prawą krawędź)." },
      { group: "Faza 2: Obrót 1. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "prev", source_var: "prawyHak", explanation: "Wpinamy hak w2 z powrotem, ale z lewej strony (prev). Wagon 1. obrócony o 180 stopni!" },

      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_VAR", var_name: "curr", source_var: "w2", explanation: "Przechodzimy do drugiego wagonu (20)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_VAR", var_name: "lewyHak", source_var: "w1", explanation: "Zdejmujemy jego stary lewy hak (wskazujący na w1)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "SET_FIELD_NULL", var_name: "curr", field_name: "prev", explanation: "W2 nie ma już nic za sobą (staje się lewą krawędzią)." },
      { group: "Faza 3: Obrót 2. wagonu", cmd: "ASSIGN_FIELD", var_name: "curr", field_name: "next", source_var: "lewyHak", explanation: "Wpinamy hak w1 z przodu (next). Pociąg fizycznie jedzie w drugą stronę!" }
    ]
  }
];