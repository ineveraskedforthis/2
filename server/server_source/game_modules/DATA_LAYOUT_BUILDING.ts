import { cell_id, money } from "./types";

export interface Building {
    cell_id: cell_id,
    durability: number,
    rooms: number,
    kitchen: number,
    workshop: number,
    type: BuildingType,
    room_cost: money
}

export const enum BuildingType {
    Shack = 'shack',
    Inn = 'inn',
    HumanHouse = 'human_house',
    RatLair = 'rat_lair',
    ElodinoHouse = 'elodino_house',
}