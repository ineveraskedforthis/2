"use strict";
// import { cell_id, money } from "./types";
Object.defineProperty(exports, "__esModule", { value: true });
exports.has_crafting_tools = exports.has_cooking_tools = exports.rooms = void 0;
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
function has_cooking_tools(type) {
    switch (type) {
        case "shack" /* LandPlotType.Shack */: return true;
        case "inn" /* LandPlotType.Inn */: return true;
        case "human_house" /* LandPlotType.HumanHouse */: return true;
        case "rat_lair" /* LandPlotType.RatLair */: return false;
        case "elodino_house" /* LandPlotType.ElodinoHouse */: return false;
        case "land_plot" /* LandPlotType.LandPlot */: return false;
        case "forest_plot" /* LandPlotType.ForestPlot */: return false;
        case "farm_plot" /* LandPlotType.FarmPlot */: return false;
        case "cotton_field" /* LandPlotType.CottonField */: return false;
    }
}
exports.has_cooking_tools = has_cooking_tools;
function has_crafting_tools(type) {
    switch (type) {
        case "shack" /* LandPlotType.Shack */: return true;
        case "inn" /* LandPlotType.Inn */: return true;
        case "human_house" /* LandPlotType.HumanHouse */: return true;
        case "rat_lair" /* LandPlotType.RatLair */: return false;
        case "elodino_house" /* LandPlotType.ElodinoHouse */: return false;
        case "land_plot" /* LandPlotType.LandPlot */: return false;
        case "forest_plot" /* LandPlotType.ForestPlot */: return false;
        case "farm_plot" /* LandPlotType.FarmPlot */: return false;
        case "cotton_field" /* LandPlotType.CottonField */: return false;
    }
}
exports.has_crafting_tools = has_crafting_tools;
