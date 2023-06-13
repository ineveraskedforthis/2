"use strict";
// import { cell_id, money } from "./types";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
function rooms(type) {
    switch (type) {
        case "shack" /* LandPlotType.Shack */: return 2;
        case "inn" /* LandPlotType.Inn */: return 5;
        case "human_house" /* LandPlotType.HumanHouse */: return 3;
        case "rat_lair" /* LandPlotType.RatLair */: return 10;
        case "elodino_house" /* LandPlotType.ElodinoHouse */: return 10;
        case "land_plot" /* LandPlotType.LandPlot */: return 100;
        case "forest_plot" /* LandPlotType.ForestPlot */: return 100;
        case "farm_plot" /* LandPlotType.FarmPlot */: return 100;
        case "cotton_field" /* LandPlotType.CottonField */: return 100;
    }
}
exports.rooms = rooms;
