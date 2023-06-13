import { Data } from "../data";
import { Cell } from "../map/DATA_LAYOUT_CELL";
import { MapSystem } from "../map/system";
// import { cell_id } from "../types";


export function forest_constraints(cell: Cell) {
    if (!MapSystem.can_move([cell.x, cell.y])) return false 
    if (Data.Cells.forestation(cell.id) > 0) {
        return true
    }
    return false
}


export function urban_constraints(cell: Cell) {
    return (Data.Cells.urbanisation(cell.id) > 0)
        && (MapSystem.can_move([cell.x, cell.y]));
}

export function steppe_constraints(cell: Cell) {
    if (!MapSystem.can_move([cell.x, cell.y])) return false 
    if (forest_constraints(cell)) return false
    if (urban_constraints(cell)) return false
    return true
}
export function simple_constraints(cell: Cell) {
    return MapSystem.can_move([cell.x, cell.y]);
}