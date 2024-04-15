import { cell_id } from "@custom_types/ids";

export interface CellData {
    id: cell_id,

    x: number,
    y: number,

    rat_scent: number,

    loaded_forest: boolean,
    loaded_spawn: boolean,
}