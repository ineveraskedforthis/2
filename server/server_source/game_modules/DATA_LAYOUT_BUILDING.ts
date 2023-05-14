import { cell_id, money } from "./types";

export interface LandPlot {
    cell_id: cell_id,
    durability: number,
    // rooms: number,
    type: LandPlotType,
    room_cost: money
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

export function rooms(type: LandPlotType): number {
    switch(type) {
        case LandPlotType.Shack:return 2
        case LandPlotType.Inn:return 5
        case LandPlotType.HumanHouse:return 3
        case LandPlotType.RatLair:return 10
        case LandPlotType.ElodinoHouse:return 10
        case LandPlotType.LandPlot:return 100
        case LandPlotType.ForestPlot:return 100
        case LandPlotType.FarmPlot:return 100
        case LandPlotType.CottonField:return 100
    }
}