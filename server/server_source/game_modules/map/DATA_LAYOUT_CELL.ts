import { cell_id, char_id } from "../types";

export interface Cell {
    id: cell_id
    x: number,
    y: number,
    market_scent: number,
    rat_scent: number,
    loaded_forest: boolean,
    loaded_spawn: boolean,
}
