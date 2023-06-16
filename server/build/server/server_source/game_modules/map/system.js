"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSystem = void 0;
// import { EloTemplate } from "../races/elo";
// import { BigRatTemplate, RatTemplate } from "../races/rat";
const data_1 = require("../data");
// import { Event } from "../events/events";
// import { Factions } from "../factions";
// import { STARTING_DEVELOPMENT, STARTING_RESOURCES, STARTING_TERRAIN, WORLD_SIZE } from "../static_data/map_definitions";
// import { cell_id, world_coordinates } from "../types";
// import { Cell} from "./cell";
const templates_1 = require("../templates");
const basic_functions_1 = require("../calculations/basic_functions");
// import { Convert } from "../systems_communication";
// import { MEAT } from "../manager_classes/materials_manager";
// import { Building } from "../DATA_LAYOUT_BUILDING";
// import { Cell } from "./DATA_LAYOUT_CELL";
const terrain_1 = require("./terrain");
// var size:world_dimensions = [0, 0]
// var max_direction:number = 30
// const dp = 
var MapSystem;
(function (MapSystem) {
    function cells() {
        return data_1.Data.Cells.list();
    }
    MapSystem.cells = cells;
    function initial_load() {
        console.log('loading map');
        // const development = STARTING_DEVELOPMENT
        // const resources = STARTING_RESOURCES
        // const terrain = STARTING_TERRAIN
        // let size = Data.World.get_world_dimensions()
        // for (let x = 0; x < size[0]; x++) {
        //     for (let y = 0; y < size[1]; y++) {
        //         const id = coordinate_to_id(x, y)
        //         const cell: Cell =  {
        //             id: id,
        //             x: x,
        //             y: y,
        //             market_scent: 0,
        //             rat_scent: 0,
        //             rupture: false
        //         }
        //         Data.Cells.set_data(id, cell)
        //     }
        // }
        // console.log('map is initialised')
    }
    MapSystem.initial_load = initial_load;
    function get_size() {
        return data_1.Data.World.get_world_dimensions();
    }
    MapSystem.get_size = get_size;
    function can_hunt(cell_id) {
        if (data_1.Data.Cells.forestation(cell_id) > 200)
            return true;
        if (data_1.Data.Cells.urbanisation(cell_id) < 5)
            return true;
        return false;
    }
    MapSystem.can_hunt = can_hunt;
    function can_fish(cell_id) {
        if (data_1.Data.World.id_to_terrain(cell_id) == terrain_1.Terrain.coast)
            return true;
        if (data_1.Data.Cells.sea_nearby(cell_id))
            return true;
        return false;
    }
    MapSystem.can_fish = can_fish;
    function has_market(cell_id) {
        if (data_1.Data.World.id_to_market(cell_id))
            return true;
        return false;
    }
    MapSystem.has_market = has_market;
    function has_wood(cell_id) {
        if (data_1.Data.Cells.forestation(cell_id) > 100)
            return true;
        return false;
    }
    MapSystem.has_wood = has_wood;
    const max_scent = 50;
    function update(dt) {
        // updating rat scent
        const cells = data_1.Data.Cells.list();
        for (const cell of cells) {
            if (cell == undefined)
                continue;
            // constant change by dt / 100
            let base_d_scent = dt / 10000;
            // constant decay
            let d_scent = -1 * base_d_scent * cell.rat_scent;
            // cell.rat_scent -=dt / 100
            {
                // take an average of scent around
                let total = 0;
                let neighbours = data_1.Data.World.neighbours(cell.id);
                for (let neighbour of neighbours) {
                    const neigbour_cell = data_1.Data.Cells.from_id(neighbour);
                    total += neigbour_cell.rat_scent;
                }
                const average = total / neighbours.length * 1;
                d_scent += base_d_scent * (average - cell.rat_scent) * 5;
                // cell.rat_scent = total
            }
            { //account for urbanisation
                d_scent -= data_1.Data.Cells.urbanisation(cell.id) * base_d_scent;
            }
            // if (cell.development.rural > 0) {
            //     d_scent -= 20 * base_d_scent
            // }
            { //account for forest
                d_scent -= data_1.Data.Cells.forestation(cell.id) / 100 * base_d_scent;
            }
            // add scent to cells with rats
            // let guests = cell.characters_set
            // let rats = 0
            // for (let guest of guests) {
            //     let character = Data.CharacterDB.from_id(guest)
            //     if (character.race() == 'rat') rats += 1
            // }
            // cell.rat_scent += rats
            // trim to avoid weirdness
            cell.rat_scent = (0, basic_functions_1.trim)(cell.rat_scent + d_scent * 20, 0, 50);
        }
        // update market scent
        for (const cell of cells) {
            if (cell == undefined)
                continue;
            let temp = 0;
            if (data_1.Data.World.id_to_terrain(cell.id) == terrain_1.Terrain.sea) {
                temp = -999;
            }
            else if (data_1.Data.Cells.has_market(cell.id)) {
                temp = 200;
            }
            else {
                // let neighbours = neighbours_cells(cell.id)
                let neighbours = data_1.Data.World.neighbours(cell.id);
                let max = 0;
                for (let item of neighbours) {
                    let cell_object = data_1.Data.Cells.from_id(item);
                    if (cell_object.market_scent > max) {
                        max = cell_object.market_scent;
                    }
                }
                temp = max - 1;
            }
            cell.market_scent = temp;
        }
        // for (const cell of cells) {
        //     if (cell == undefined) continue
        //     cell.update(dt)
        // }
        // if (npc_humans <= 80) {
        //     roll_human()
        // }
    }
    MapSystem.update = update;
    function roll_human() {
        let dice = Math.random();
        if (dice < 0.08) {
            templates_1.Template.Character.HumanRatHunter(0, 3, "Rat Hunter");
        }
        else if (dice < 0.16) {
            templates_1.Template.Character.HumanCityGuard(0, 3, "Guard");
        }
        else if (dice < 0.32) {
            templates_1.Template.Character.HumanLocalTrader(0, 3, "Local Trader", 'city');
        }
    }
    function can_move(pos) {
        if (!data_1.Data.World.validate_coordinates(pos))
            return false;
        let terrain = data_1.Data.World.get_terrain();
        try {
            return (0, terrain_1.terrain_can_move)(terrain[pos[0]][pos[1]]);
        }
        catch (error) {
            return false;
        }
    }
    MapSystem.can_move = can_move;
    function is_valid_move(dx, dy) {
        return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1));
    }
    MapSystem.is_valid_move = is_valid_move;
})(MapSystem = exports.MapSystem || (exports.MapSystem = {}));
