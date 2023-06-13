// import { cell_id, money } from "./types";

import { LandPlotType } from "../../../shared/buildings"


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