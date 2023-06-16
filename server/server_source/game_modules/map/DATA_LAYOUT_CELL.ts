import { cell_id } from "@custom_types/common";

export interface Cell {
    id: cell_id
    x: number,
    y: number,
    market_scent: number,
    rat_scent: number,
    loaded_forest: boolean,
    loaded_spawn: boolean,

    game: number,
    fish: number,
    cotton: number,
}
