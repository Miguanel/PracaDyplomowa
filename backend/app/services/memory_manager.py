import uuid


class MemoryBlock:
    # Dodajemy visual_x i visual_y (domyślnie None)
    def __init__(self, address: str, size: int, label: str = "", x: int = None, y: int = None):
        self.address = address
        self.size = size
        self.label = label
        # Dane wizualne
        self.visual_x = x
        self.visual_y = y
        self.fields = {
            "val": 0,
            "next": None,
            "prev": None
        }


class MemoryManager:
    def __init__(self):
        self.heap = {}
        self.stack = {}

    # Aktualizacja metody malloc o x i y
    def malloc(self, size: int, label: str = "", x: int = None, y: int = None) -> str:
        address = f"0x{100 + len(self.heap) * 8:x}"
        # Przekazujemy x i y do bloku
        block = MemoryBlock(address, size, label, x, y)
        self.heap[address] = block

        if label:
            self.stack[label] = address

        return address

    def write(self, address: str, field: str, value: any):
        if address not in self.heap:
            return False
        self.heap[address].fields[field] = value
        return True

    def free(self, address: str):
        if address in self.heap:
            del self.heap[address]
            # Usuwanie ze stosu
            keys_to_remove = [k for k, v in self.stack.items() if v == address]
            for k in keys_to_remove:
                del self.stack[k]
            return True
        return False

    def set_variable(self, name: str, address: str):
        if address in self.heap:
            self.stack[name] = address
            return True
        return False

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
                # Zwracamy pozycje w API
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
            # Pobieramy pozycje przy przywracaniu
            x = node.get("visual_x")
            y = node.get("visual_y")
            block = MemoryBlock(addr, node["size"], node.get("label", ""), x, y)
            block.fields = node["data"].copy()
            self.heap[addr] = block


memory_manager = MemoryManager()