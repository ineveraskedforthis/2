import { MapSystem } from "../map/system";
import { Cell } from "../map/cell";

export function forest_constraints(cell: Cell) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] > 0)
        && (MapSystem.can_move([cell.x, cell.y]));
}
export function steppe_constraints(cell: Cell) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] < 1)
        && (MapSystem.can_move([cell.x, cell.y]));
}
export function simple_constraints(cell: Cell) {
    return MapSystem.can_move([cell.x, cell.y]);
}
