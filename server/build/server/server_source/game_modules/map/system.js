"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSystem = void 0;
// import { EloTemplate } from "../races/elo";
// import { BigRatTemplate, RatTemplate } from "../races/rat";
const data_1 = require("../data");
const basic_functions_1 = require("../calculations/basic_functions");
// import { Convert } from "../systems_communication";
// import { MEAT } from "../manager_classes/materials_manager";
// import { Building } from "../DATA_LAYOUT_BUILDING";
// import { Cell } from "./DATA_LAYOUT_CELL";
const terrain_1 = require("./terrain");
const geom_1 = require("../geom");
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
    }
    MapSystem.initial_load = initial_load;
    function get_size() {
        return data_1.Data.World.get_world_dimensions();
    }
    MapSystem.get_size = get_size;
    function can_hunt(cell_id) {
        return data_1.Data.Cells.has_game(cell_id);
    }
    MapSystem.can_hunt = can_hunt;
    function can_fish(cell_id) {
        return data_1.Data.Cells.has_fish(cell_id);
        // if (Data.World.id_to_terrain(cell_id) == Terrain.coast) return true
        // if (Data.Cells.sea_nearby(cell_id)) return true
        // return false
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
    function update_rat_scent(deltaTime, cell) {
        if (cell == undefined)
            return;
        // constant change by dt / 100
        let base_d_scent = deltaTime / 10000;
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
        }
        { //account for urbanisation
            d_scent -= data_1.Data.Cells.urbanisation(cell.id) * base_d_scent;
        }
        { //account for forest
            d_scent -= data_1.Data.Cells.forestation(cell.id) / 100 * base_d_scent;
        }
        // trim to avoid weirdness
        cell.rat_scent = (0, basic_functions_1.trim)(cell.rat_scent + d_scent * 20, 0, 50);
    }
    function update_market_scent(cell) {
        if (cell == undefined)
            return;
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
    function update_fish(cell) {
        if (data_1.Data.Cells.sea_nearby(cell.id)) {
            if (Math.random() < (10 - cell.fish) / 100) {
                cell.fish = cell.fish + 1;
            }
        }
    }
    function update_cotton(cell) {
        const competition = data_1.Data.Cells.forestation(cell.id) + cell.cotton * 20;
        if (Math.random() < 1 - competition / 200) {
            cell.cotton = cell.cotton + 1;
        }
    }
    function update_game(cell) {
        const competition = cell.game * 50 - data_1.Data.Cells.forestation(cell.id);
        if (Math.random() < 1 - competition / 200) {
            cell.game = cell.game + 1;
        }
    }
    function update(dt) {
        const cells = data_1.Data.Cells.list();
        for (const cell of cells) {
            update_rat_scent(dt, cell);
            update_market_scent(cell);
            if (Math.random() < 0.001) {
                update_cotton(cell);
                update_game(cell);
                update_fish(cell);
            }
        }
    }
    MapSystem.update = update;
    function initial_update() {
        const cells = data_1.Data.Cells.list();
        for (const cell of cells) {
            for (let i = 0; i < 20; i++) {
                update_cotton(cell);
                update_game(cell);
                update_fish(cell);
            }
        }
    }
    MapSystem.initial_update = initial_update;
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
    function extract_path(prev, start, end) {
        let path = [];
        let current = end;
        while (current != start) {
            path.push(current);
            let previous = prev[current];
            if (previous == undefined) {
                return undefined;
            }
            else {
                current = previous;
            }
        }
        path.push(start);
        return path.reverse();
    }
    function find_path_full(start, end) {
        let current = start;
        let queue = [current];
        let prev = {};
        prev[current] = undefined;
        let used = {};
        let right = 1;
        let next = 0;
        while ((next != -1) && (right < 400)) {
            current = queue[next];
            used[current] = true;
            for (let neighbour of data_1.Data.World.neighbours(current)) {
                if (data_1.Data.World.id_to_terrain(neighbour) == terrain_1.Terrain.sea)
                    continue;
                if (data_1.Data.World.id_to_terrain(neighbour) == terrain_1.Terrain.rupture)
                    continue;
                if (data_1.Data.World.id_to_terrain(neighbour) == terrain_1.Terrain.void)
                    continue;
                if (used[neighbour])
                    continue;
                queue[right] = neighbour;
                prev[neighbour] = current;
                right++;
                if (neighbour == end) {
                    return extract_path(prev, start, end);
                }
            }
            let heur_score = 9999;
            next = -1;
            for (let i = 0; i < right; i++) {
                let tmp = dist(queue[i], start) / 100000;
                if ((tmp < heur_score) && (!used[queue[i]])) {
                    next = i;
                    heur_score = tmp;
                }
            }
        }
        return extract_path(prev, start, end);
    }
    MapSystem.find_path_full = find_path_full;
    function find_path(start, end) {
        let path = find_path_full(start, end);
        if (path == undefined)
            return undefined;
        return path[1];
    }
    MapSystem.find_path = find_path;
    function dist(a, b) {
        const a_coord = data_1.Data.World.id_to_coordinate(a);
        const b_coord = data_1.Data.World.id_to_coordinate(b);
        let a_center = get_hex_centre(a_coord);
        let b_center = get_hex_centre(b_coord);
        return geom_1.geom.dist(a_center, b_center);
    }
    function get_hex_centre([x, y]) {
        var h = Math.sqrt(3) / 2;
        var w = 1 / 2;
        var tx = (1 + w) * x;
        var ty = 2 * h * y - h * x;
        return { x: tx, y: ty };
    }
})(MapSystem = exports.MapSystem || (exports.MapSystem = {}));
