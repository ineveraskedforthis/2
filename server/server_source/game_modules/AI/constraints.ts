import { CellData } from "../map/cell_interface";
import { MapSystem } from "../map/system";

export function forest_constraints(cell: CellData) {
    if (!MapSystem.can_move([cell.x, cell.y])) return false
    if (MapSystem.forestation(cell.id) > 300) {
        return true
    }
    return false
}

export function urban_constraints(cell: CellData) {
    return (MapSystem.urbanisation(cell.id) > 0) && (MapSystem.can_move([cell.x, cell.y]));
}

export function steppe_constraints(cell: CellData) {
    if (!MapSystem.can_move([cell.x, cell.y])) return false
    if (forest_constraints(cell)) return false
    if (urban_constraints(cell)) return false
    return true
}
export function simple_constraints(cell: CellData) {
    return MapSystem.can_move([cell.x, cell.y]);
}

export function coastal_constraints(cell: CellData) {
    return MapSystem.sea_nearby(cell.id);
}