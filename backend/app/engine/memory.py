from typing import Dict, Any, Optional, List
import uuid


class MemoryBlock:
    """
    Reprezentuje pojedynczą komórkę pamięci lub zaalokowany blok.
    W systemach edukacyjnych upraszczamy to: jeden Block = jeden Węzeł.
    """

    def __init__(self, address: str, size: int = 1, label: str = ""):
        self.address: str = address  # np. "0x100"
        self.size: int = size  # Ile "komórek" zajmuje
        self.label: str = label  # np. "node_A"
        self.data: Dict[str, Any] = {}  # Przechowuje wartości i wskaźniki, np. {"val": 10, "next": "0x104"}
        self.is_freed: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Serializacja do JSON dla Frontendu"""
        return {
            "address": self.address,
            "label": self.label,
            "size": self.size,
            "data": self.data,
            "is_freed": self.is_freed
        }


class VirtualRAM:
    """
    Symulator sterty (Heap) pamięci RAM.
    Zarządza adresami i alokacją.
    """

    def __init__(self, start_address: int = 0x100):
        self.memory: Dict[str, MemoryBlock] = {}
        self.next_address = start_address
        self.variables: Dict[str, str] = {}  # Zmienne globalne, np. head -> 0x100

    def malloc(self, label: str, fields: Dict[str, Any]) -> str:
        """
        Alokuje nowy blok pamięci (odpowiednik new Node() / malloc).
        Zwraca adres nowego bloku.
        """
        # Generujemy adres w formacie HEX (dla klimatu)
        address_hex = f"0x{self.next_address:X}"

        # Tworzymy blok
        new_block = MemoryBlock(address=address_hex, label=label)
        new_block.data = fields  # np. {"val": 5, "next": None}

        # Zapisujemy w "RAMie"
        self.memory[address_hex] = new_block

        # Przesuwamy wskaźnik wolnej pamięci (symulacja zajmowania miejsca)
        # Zakładamy dla uproszczenia, że każdy węzeł zajmuje np. 4 bajty przesunięcia
        self.next_address += 4

        return address_hex

    def free(self, address: str) -> bool:
        """Zwalnia pamięć (odpowiednik free/delete)"""
        if address in self.memory:
            self.memory[address].is_freed = True
            return True
        return False

    def read(self, address: str, field: str = None) -> Any:
        """Odczytuje dane z konkretnego adresu"""
        if address not in self.memory:
            raise ValueError(f"Segmentation Fault: Adres {address} nie istnieje!")

        block = self.memory[address]
        if block.is_freed:
            raise ValueError(f"Dostęp do zwolnionej pamięci pod adresem {address}!")

        if field:
            return block.data.get(field)
        return block.data

    def write(self, address: str, field: str, value: Any):
        """Zapisuje dane do konkretnego pola w bloku (np. node->next = ...)"""
        if address not in self.memory:
            raise ValueError(f"Segmentation Fault: Adres {address} nie istnieje!")

        block = self.memory[address]
        block.data[field] = value

    def set_variable(self, name: str, address: Optional[str]):
        """Ustawia zmienną wskaźnikową, np. head = 0x100"""
        self.variables[name] = address

    def dump_memory(self) -> Dict[str, Any]:
        """Zrzut całej pamięci dla Frontendu (do wizualizacji tabeli)"""
        return {
            "heap": [block.to_dict() for block in self.memory.values() if not block.is_freed],
            "stack": self.variables  # Zmienne lokalne/globalne
        }


# --- TEST JEDNOSTKOWY (Uruchom ten plik, żeby sprawdzić czy działa) ---
if __name__ == "__main__":
    ram = VirtualRAM()

    # 1. Tworzymy węzeł A
    addr_a = ram.malloc("Node A", {"val": 10, "next": None})
    print(f"Zaalokowano A pod: {addr_a}")

    # 2. Tworzymy węzeł B
    addr_b = ram.malloc("Node B", {"val": 20, "next": None})
    print(f"Zaalokowano B pod: {addr_b}")

    # 3. Łączymy A -> B (A.next = adres B)
    ram.write(addr_a, "next", addr_b)

    # 4. Ustawiamy head -> A
    ram.set_variable("head", addr_a)

    print("\n--- ZRZUT PAMIĘCI ---")
    print(ram.dump_memory())