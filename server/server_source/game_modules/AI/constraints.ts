import { Cell } from "../map/DATA_LAYOUT_CELL";
import { MapSystem } from "../map/system";
import { cell_id } from "../types";


export function forest_constraints(cell: cell_id) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] > 0)
        && (MapSystem.can_move([cell.x, cell.y]));
}
export function steppe_constraints(cell: Cell) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] < 1)
        && (MapSystem.can_move([cell.x, cell.y]));
}

export function urban_constraints(cell: Cell) {
    return (cell.development['urban'] > 0)
        && (MapSystem.can_move([cell.x, cell.y]));
}
export function simple_constraints(cell: Cell) {
    return MapSystem.can_move([cell.x, cell.y]);
}