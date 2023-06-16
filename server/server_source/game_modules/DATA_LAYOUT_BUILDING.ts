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

export function has_cooking_tools(type: LandPlotType): boolean {
    switch(type) {
        case LandPlotType.Shack:return true
        case LandPlotType.Inn:return true
        case LandPlotType.HumanHouse:return true
        case LandPlotType.RatLair:return false
        case LandPlotType.ElodinoHouse:return false
        case LandPlotType.LandPlot:return false
        case LandPlotType.ForestPlot:return false
        case LandPlotType.FarmPlot:return false
        case LandPlotType.CottonField:return false
    }
}

export function has_crafting_tools(type: LandPlotType): boolean {
    switch(type) {
        case LandPlotType.Shack:return true
        case LandPlotType.Inn:return true
        case LandPlotType.HumanHouse:return true
        case LandPlotType.RatLair:return false
        case LandPlotType.ElodinoHouse:return false
        case LandPlotType.LandPlot:return false
        case LandPlotType.ForestPlot:return false
        case LandPlotType.FarmPlot:return false
        case LandPlotType.CottonField:return false
    }
}