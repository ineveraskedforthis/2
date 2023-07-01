import { cell_id, money } from "./common";

export interface LandPlot {
    cell_id: cell_id,
    durability: number,
    // rooms: number,
    type: LandPlotType,
    room_cost: money
}

export interface LandPlotSocket {
    id: number,
    cell_id: cell_id,
    durability: number,
    rooms: number,
    rooms_occupied: number,
    type: LandPlotType,
    room_cost: money,
    room_cost_true: money,
    owner_id: number,
    owner_name: string;
}

export const enum LandPlotType {
    Shack = 'shack',
    Inn = 'inn',
    HumanHouse = 'human_house',
    RatLair = 'rat_lair',
    ElodinoHouse = 'elodino_house',
    LandPlot = 'land_plot',
    ForestPlot = 'forest_plot',
    FarmPlot = 'farm_plot',
    CottonField = 'cotton_field'
}