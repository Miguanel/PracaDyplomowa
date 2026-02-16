from app.engine.memory import VirtualRAM
from app.schemas.actions import Instruction


class LogicEngine:
    def __init__(self, ram: VirtualRAM):
        self.ram = ram

    def execute_step(self, instr: Instruction):
        """
        Interpretuje pojedynczy krok algorytmu.
        Używa pattern matching (Python 3.10+)
        """
        match instr.cmd:

            # PRZYPADEK 1: Przypisanie zmiennej (np. curr = head)
            case "ASSIGN_VAR":
                source_addr = None

                # A. Jeśli źródłem jest inna zmienna (np. source_var="head")
                if instr.source_var:
                    # Pobieramy adres, na który wskazuje source_var
                    base_addr = self.ram.variables.get(instr.source_var)

                    if base_addr is None:
                        # W C++ przypisanie NULL jest ok, ale odczyt pola z NULL już nie
                        if instr.field_name:
                            raise ValueError(f"Segmentation Fault: Zmienna '{instr.source_var}' jest pusta (NULL)!")

                    # B. Jeśli chcemy wejść głębiej (np. head->next)
                    if instr.field_name:
                        # Odczytujemy pole 'next' z adresu base_addr
                        source_addr = self.ram.read(base_addr, instr.field_name)
                    else:
                        # Po prostu curr = head
                        source_addr = base_addr

                # Wykonanie przypisania: variables["curr"] = adres
                self.ram.set_variable(instr.var_name, source_addr)

            # PRZYPADEK 2: Edycja pola w węźle (np. node->next = ...)
            case "ASSIGN_FIELD":
                # Musimy wiedzieć, który węzeł modyfikujemy
                target_addr = instr.target_address

                if not target_addr and instr.var_name:
                    target_addr = self.ram.variables.get(instr.var_name)

                if not target_addr:
                    raise ValueError(f"Błąd: Zmienna '{instr.var_name}' nie wskazuje na żaden obiekt (jest NULL).")

                # Skąd bierzemy wartość?
                value_to_write = None
                if instr.source_var:
                    value_to_write = self.ram.variables.get(instr.source_var)

                # Zapis: RAM[addr].data['next'] = ...
                self.ram.write(target_addr, instr.field_name, value_to_write)

            # PRZYPADEK 3: Alokacja (np. newNode = new Node())
            case "ALLOC":
                new_addr = self.ram.malloc(label=instr.var_name, fields=instr.val_payload)
                if instr.var_name:
                    self.ram.set_variable(instr.var_name, new_addr)

            # PRZYPADEK 4: Zwalnianie (np. delete temp) --- NOWOŚĆ ---
            case "FREE":
                # Pobieramy adres, na który wskazuje zmienna (np. temp -> 0x100)
                addr_to_free = self.ram.variables.get(instr.var_name)

                if not addr_to_free:
                    raise ValueError(f"Nie można zwolnić: Zmienna '{instr.var_name}' jest pusta.")

                # Wywołujemy free w pamięci
                success = self.ram.free(addr_to_free)
                if not success:
                    raise ValueError(f"Double Free: Adres {addr_to_free} został już zwolniony.")

            # PRZYPADEK 5: Zmiana wartości danych (np. node->val = 5)
            case "SET_VAL":
                # 1. Pobierz adres węzła
                target_addr = self.ram.variables.get(instr.var_name)
                if not target_addr:
                    raise ValueError(f"Błąd: Zmienna '{instr.var_name}' jest pusta (NULL). Nie można ustawić wartości.")

                # 2. Pobierz nową wartość (z payloadu lub innej zmiennej - tu upraszczamy do payloadu)
                new_val = instr.val_payload
                if new_val is None:
                    raise ValueError("Brak wartości do ustawienia.")

                # 3. Zapisz w pamięci (pole 'val')
                self.ram.write(target_addr, "val", new_val)

            case _:
                raise ValueError(f"Nieznana komenda: {instr.cmd}")

        return self.ram.dump_memory()