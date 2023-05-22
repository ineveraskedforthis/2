"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSystem = void 0;
const data_1 = require("../data");
// import { Cell} from "./cell";
const templates_1 = require("../templates");
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
    function update(dt, rats_number, elodino_number, npc_humans) {
        // updating rat scent
        // for (const cell of cells) {
        //     if (cell == undefined) continue
        //     // constant change by dt / 100
        //     let base_d_scent = dt / 100
        //     // constant decay
        //     let d_scent = -1 * base_d_scent
        //     // cell.rat_scent -=dt / 100
        //     // then calculate base scent change
        //     if (cell.development.rats == 1) {
        //         // lairs always have 50 scent
        //         cell.rat_scent = max_scent
        //     } else {
        //         // take an average of scent around
        //         let total = 0
        //         let neighbours = neighbours_cells(cell.id)
        //         for (let neighbour of neighbours) {
        //             total += neighbour.rat_scent 
        //         }
        //         const average = total / neighbours.length * 0.95
        //         d_scent += base_d_scent * (average - cell.rat_scent) * 5
        //         // cell.rat_scent = total
        //     }
        //     if (cell.development.urban > 0) {
        //         d_scent -= 30 * base_d_scent
        //     }
        //     if (cell.development.rural > 0) {
        //         d_scent -= 20 * base_d_scent
        //     }
        //     if (cell.development.wild > 0) {
        //         d_scent -= 20 * base_d_scent
        //     }
        //     // add scent to cells with rats
        //     // let guests = cell.characters_set
        //     // let rats = 0
        //     // for (let guest of guests) {
        //     //     let character = Data.CharacterDB.from_id(guest)
        //     //     if (character.race() == 'rat') rats += 1
        //     // }
        //     // cell.rat_scent += rats
        //     // trim to avoid weirdness
        //     cell.rat_scent = trim(cell.rat_scent + d_scent * 20, 0, 50)
        // }
        // for (const cell of cells) {
        //     if (cell == undefined) continue
        //     let temp = 0
        //     if (cell.is_market()) {
        //         temp = 100
        //     } else {
        //         let neighbours = neighbours_cells(cell.id)
        //         let max = 0
        //         for (let item of neighbours) {
        //             if (item.market_scent > max) {
        //                 max = item.market_scent
        //             }
        //         }
        //         temp = max - 1
        //     }
        //     cell.market_scent = temp
        // }
        // for (const cell of cells) {
        //     if (cell == undefined) continue
        //     cell.update(dt)
        //     if ((rats_number < 120) && (cell.development.rats == 1)) {
        //         let dice = Math.random()
        //         if (dice < 0.6) {
        //             Template.Character.GenericRat(cell.x, cell.y, undefined)
        //         } else if (dice < 0.8) {
        //             Template.Character.BigRat(cell.x, cell.y, undefined)
        //         } else if (dice < 1) {
        //             Template.Character.MageRat(cell.x, cell.y, undefined)
        //         }                
        //     }
        //     if ((elodino_number < 60) && (cell.development.elodinos == 1)) {
        //         let dice = Math.random()
        //         if (dice < 0.7) {
        //             Template.Character.Elo(cell.x, cell.y, undefined)
        //         } else {
        //             Template.Character.MageElo(cell.x, cell.y, undefined)
        //         }
        //     }
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
