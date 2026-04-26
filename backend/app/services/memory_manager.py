import uuid


class MemoryBlock:
    def __init__(self, address: str, size: int, label: str = "", x: int = None, y: int = None):
        self.address = address
        self.size = size
        self.label = label
        self.visual_x = x
        self.visual_y = y
        self.fields = {
            "val": 0,
            "next": "NULL",  # Zmieniamy z None na "NULL", by symulować C++
            "prev": "NULL"
        }


class MemoryManager:
    def __init__(self):
        self.heap = {}
        self.stack = {}

    def resolve_pointer(self, expression: str) -> str:
        """
        Magia kompilatora: Tłumaczy łańcuch np. 'curr->next->prev' na adres fizyczny np. '0x108'.
        Rzuca wyjątki (SegFault), jeśli napotka NULL lub usuniętą pamięć.
        """
        if not expression or expression == "NULL":
            return "NULL"

        # Jeśli wyrażenie jest już surowym adresem (np. przywracanie stanu)
        if expression.startswith("0x"):
            return expression

        # Rozdzielamy string, np. ["curr", "next", "prev"]
        parts = expression.split("->")
        base_var = parts[0]

        # 1. Sprawdzamy, czy zmienna bazowa w ogóle istnieje na stosie
        if base_var not in self.stack:
            raise ValueError(f"Kompilator: Zmienna '{base_var}' nie została zadeklarowana.")

        current_address = self.stack[base_var]

        # 2. Iterujemy przez kolejne dowiązania wskaźnikowe
        for field in parts[1:]:
            # Symulacja: Null Pointer Exception
            if current_address == "NULL":
                raise ValueError(f"Segmentation Fault: Próba odwołania do '{field}' we wskaźniku NULL.")

            # Symulacja: Wiszący Wskaźnik (pamięć została już zwolniona komendą free)
            if current_address not in self.heap:
                raise ValueError(
                    f"Segmentation Fault (Dangling Pointer): Adres {current_address} nie istnieje na stercie.")

            block = self.heap[current_address]

            if field not in block.fields:
                raise ValueError(f"Błąd kompilacji: Typ Node nie posiada pola '{field}'.")

            current_address = block.fields[field]

        return current_address

    def malloc(self, size: int, label: str = "", x: int = None, y: int = None) -> str:
        address = f"0x{100 + len(self.heap) * 8:x}"
        block = MemoryBlock(address, size, label, x, y)
        self.heap[address] = block

        if label:
            # Tworzymy wskaźnik na stosie, który patrzy na nowy blok
            self.stack[label] = address

        return address

    def set_variable(self, name: str, source_expression: str):
        """
        Odpowiednik w C++: Node* name = source_expression;
        np. curr = head->next;
        """
        target_address = self.resolve_pointer(source_expression)
        self.stack[name] = target_address
        return True

    def assign_pointer(self, target_expression: str, field: str, source_expression: str):
        """
        Odpowiednik w C++: target_expression->field = source_expression;
        np. curr->next = prev->next;
        """
        target_address = self.resolve_pointer(target_expression)
        source_address = self.resolve_pointer(source_expression)

        if target_address == "NULL":
            raise ValueError("Segmentation Fault: Przypisanie do pola wskaźnika NULL.")
        if target_address not in self.heap:
            raise ValueError("Dangling Pointer: Zapis do zwolnionej pamięci.")

        self.heap[target_address].fields[field] = source_address
        return True

    def write_value(self, target_expression: str, field: str, value: any):
        """
        Odpowiednik w C++: target_expression->field = wartość_stała;
        np. curr->val = 99;
        """
        target_address = self.resolve_pointer(target_expression)

        if target_address == "NULL":
            raise ValueError("Segmentation Fault: Odwołanie do wskaźnika NULL.")
        if target_address not in self.heap:
            raise ValueError("Dangling Pointer: Zapis do zwolnionej pamięci.")

        self.heap[target_address].fields[field] = value
        return True

    def free(self, target_expression: str):
        """
        Odpowiednik w C++: delete target_expression;
        """
        target_address = self.resolve_pointer(target_expression)

        if target_address == "NULL":
            raise ValueError("Błąd: Próba zwolnienia wskaźnika NULL (Double Free / Invalid Pointer).")

        if target_address in self.heap:
            del self.heap[target_address]

            # ZMIANA EDUKACYJNA: W C++ 'delete' NIE usuwa zmiennych z pamięci stosu!
            # Zostawiamy wskaźniki na stosie, aby na własne oczy zobaczyć zjawisko Dangling Pointer.
            # (Wskazują one teraz na usunięty adres).
            return True
        else:
            raise ValueError("Double Free: Próba zwolnienia niezaalokowanej pamięci.")

    def reset(self):
        self.heap = {}
        self.stack = {}

    def get_state(self):
        heap_list = []
        for addr, block in self.heap.items():
            heap_list.append({
                "address": addr,
                "size": block.size,
                "data": block.fields,
                "label": block.label,
                "visual_x": block.visual_x,
                "visual_y": block.visual_y
            })
        return {
            "heap": heap_list,
            "stack": self.stack
        }

    def restore_state(self, state_dump: dict):
        self.reset()
        self.stack = state_dump.get("stack", {}).copy()
        heap_data = state_dump.get("heap", [])
        for node in heap_data:
            addr = node["address"]
            x = node.get("visual_x")
            y = node.get("visual_y")
            block = MemoryBlock(addr, node["size"], node.get("label", ""), x, y)
            block.fields = node["data"].copy()
            self.heap[addr] = block


memory_manager = MemoryManager()