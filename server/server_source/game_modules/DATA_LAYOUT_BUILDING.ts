import { cell_id, money } from "./types";

export interface Building {
    cell_id: cell_id,
    durability: number,
    tier: number
    rooms: number,
    kitchen: number,
    workshop: number,

    is_inn: boolean,
    
    room_cost: money
}
