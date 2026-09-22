from backend.app.engine.memory import VirtualRAM
from backend.app.schemas.actions import Instruction, GraphNode, GraphEdge
from typing import List, Optional


class LogicEngine:
    def __init__(self, ram: VirtualRAM):
        self.ram = ram

    def get_next_node_id(self, current_node: GraphNode, edges: List[GraphEdge],
                         condition_result: Optional[bool] = None) -> Optional[str]:
        """
        Traverser grafu: Szuka następnego węzła na podstawie krawędzi i wyniku warunku IF.
        """
        for edge in edges:
            if edge.source == current_node.id:
                # Obsługa rozgałęzień dla węzłów warunkowych (IF)
                if current_node.type == 'conditionNode':
                    if condition_result is True and edge.sourceHandle == 'true':
                        return edge.target
                    elif condition_result is False and edge.sourceHandle == 'false':
                        return edge.target
                # Zwykłe węzły akcji (jeden kierunek w dół)
                elif current_node.type in ['actionNode', 'startNode']:
                    return edge.target
        return None

    def execute_step(self, instr: Instruction) -> Optional[bool]:
        """
        Interpretuje pojedynczy krok algorytmu i zwraca wynik (jeśli to węzeł warunkowy).
        Używa pattern matching (Python 3.10+)
        """
        match instr.cmd:

            case "ASSIGN_VAR":
                source_addr = None
                if instr.source_var:
                    base_addr = self.ram.variables.get(instr.source_var)
                    if base_addr is None:
                        if instr.field_name:
                            raise ValueError(f"Segmentation Fault: Zmienna '{instr.source_var}' jest pusta (NULL)!")

                    if instr.field_name:
                        source_addr = self.ram.read(base_addr, instr.field_name)
                    else:
                        source_addr = base_addr
                self.ram.set_variable(instr.var_name, source_addr)

            case "ASSIGN_FIELD":
                target_addr = instr.target_address
                if not target_addr and instr.var_name:
                    target_addr = self.ram.variables.get(instr.var_name)
                if not target_addr:
                    raise ValueError(f"Błąd: Zmienna '{instr.var_name}' nie wskazuje na żaden obiekt (jest NULL).")

                value_to_write = None
                if instr.source_var:
                    value_to_write = self.ram.variables.get(instr.source_var)

                self.ram.write(target_addr, instr.field_name, value_to_write)

            case "ALLOC":
                new_addr = self.ram.malloc(label=instr.var_name, fields=instr.val_payload)
                if instr.var_name:
                    self.ram.set_variable(instr.var_name, new_addr)

            case "FREE":
                addr_to_free = self.ram.variables.get(instr.var_name)
                if not addr_to_free:
                    raise ValueError(f"Nie można zwolnić: Zmienna '{instr.var_name}' jest pusta.")
                success = self.ram.free(addr_to_free)
                if not success:
                    raise ValueError(f"Double Free: Adres {addr_to_free} został już zwolniony.")

            case "SET_VAL":
                target_addr = self.ram.variables.get(instr.var_name)
                if not target_addr:
                    raise ValueError(f"Błąd: Zmienna '{instr.var_name}' jest pusta (NULL).")
                new_val = instr.val_payload
                if new_val is None:
                    raise ValueError("Brak wartości do ustawienia.")
                self.ram.write(target_addr, "val", new_val)

            # --- NOWE KOMENDY DLA GRAFÓW I LOGIKI ORAZ ROZGAŁĘZIEŃ ---

            case "STEP_FORWARD":
                # Przesunięcie wskaźnika (np. curr = curr->next)
                if instr.var_name and instr.field_name:
                    base_addr = self.ram.variables.get(instr.var_name)
                    if base_addr:
                        next_addr = self.ram.read(base_addr, instr.field_name)
                        self.ram.set_variable(instr.var_name, next_addr)

            case "SET_FIELD_NULL":
                # Odpięcie krawędzi (np. node->next = NULL)
                target_addr = self.ram.variables.get(instr.var_name)
                if target_addr and instr.field_name:
                    self.ram.write(target_addr, instr.field_name, None)

            case "COMPARE":
                # Wyliczanie warunku logicznego w locie dla węzłów ConditionNode
                left_addr = self.ram.variables.get(instr.var_name)
                if not left_addr:
                    return False  # Zabezpieczenie przed błędem jeśli zmienna to NULL

                left_val = self.ram.read(left_addr, "val")
                right_val = 0

                # Logika parsowania operandu prawostronnego
                if isinstance(instr.val_payload, dict):
                    if instr.val_payload.get("compareMode") == "variable":
                        right_var_name = instr.val_payload.get("rightValue")
                        right_addr = self.ram.variables.get(right_var_name)
                        if right_addr:
                            right_val = self.ram.read(right_addr, "val")
                    else:
                        right_val = int(instr.val_payload.get("rightValue", 0))

                operator = instr.field_name
                if operator == ">": return left_val > right_val
                if operator == "<": return left_val < right_val
                if operator == "==": return left_val == right_val
                if operator == "!=": return left_val != right_val
                if operator == ">=": return left_val >= right_val
                if operator == "<=": return left_val <= right_val

                return False

            case _:
                raise ValueError(f"Nieznana komenda: {instr.cmd}")

        # Domyślnie zwracamy None dla zwykłych akcji, bo nie wpływają one na ścieżkę (IF)
        return None