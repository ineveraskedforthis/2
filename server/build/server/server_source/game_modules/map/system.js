"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSystem = void 0;
const basic_functions_1 = require("../calculations/basic_functions");
const terrain_1 = require("./terrain");
const geom_1 = require("../geom");
const data_objects_1 = require("../data/data_objects");
const data_id_1 = require("../data/data_id");
var MapSystem;
(function (MapSystem) {
    function sea_nearby(cell) {
        let neigbours = data_objects_1.Data.World.neighbours(cell);
        for (const item in neigbours) {
            let terrain = data_objects_1.Data.World.id_to_terrain(neigbours[item]);
            if (terrain == 2 /* Terrain.sea */) {
                return true;
            }
        }
        return false;
    }
    MapSystem.sea_nearby = sea_nearby;
    function can_clean(location) {
        const object = data_objects_1.Data.Locations.from_id(location);
        return sea_nearby(object.cell_id);
    }
    MapSystem.can_clean = can_clean;
    function has_forest(location) {
        const object = data_objects_1.Data.Locations.from_id(location);
        return object.forest > 0;
    }
    MapSystem.has_forest = has_forest;
    function has_cotton(location) {
        const object = data_objects_1.Data.Locations.from_id(location);
        return object.cotton > 0;
    }
    MapSystem.has_cotton = has_cotton;
    function has_game(location) {
        const object = data_objects_1.Data.Locations.from_id(location);
        return object.small_game > 0;
    }
    MapSystem.has_game = has_game;
    function has_fish(location) {
        const object = data_objects_1.Data.Locations.from_id(location);
        return object.fish > 0;
    }
    MapSystem.has_fish = has_fish;
    function forestation(cell) {
        let result = 0;
        let locations = data_id_1.DataID.Cells.locations(cell);
        for (let location of locations) {
            let object = data_objects_1.Data.Locations.from_id(location);
            result += object.forest;
        }
        return result;
    }
    MapSystem.forestation = forestation;
    function urbanisation(cell) {
        let result = 0;
        let locations = data_id_1.DataID.Cells.locations(cell);
        for (let location of locations) {
            let object = data_objects_1.Data.Locations.from_id(location);
            if (object.has_house_level > 0)
                result++;
        }
        return result;
    }
    MapSystem.urbanisation = urbanisation;
    function rat_lair(cell) {
        let result = false;
        let locations = data_id_1.DataID.Cells.locations(cell);
        for (let location of locations) {
            let object = data_objects_1.Data.Locations.from_id(location);
            if (object.has_rat_lair)
                result = true;
        }
        return result;
    }
    MapSystem.rat_lair = rat_lair;
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
            let neighbours = data_objects_1.Data.World.neighbours(cell.id);
            for (let neighbour of neighbours) {
                const neigbour_cell = data_objects_1.Data.Cells.from_id(neighbour);
                total += neigbour_cell.rat_scent;
            }
            const average = total / neighbours.length * 1;
            d_scent += base_d_scent * (average - cell.rat_scent) * 5;
        }
        { //account for urbanisation
            d_scent -= urbanisation(cell.id) * base_d_scent * 2;
        }
        { //account for forest
            d_scent -= forestation(cell.id) / 100 * base_d_scent;
        }
        // fresh sea air
        if (sea_nearby(cell.id)) {
            d_scent -= 10 / 100 * base_d_scent;
        }
        // trim to avoid weirdness
        cell.rat_scent = (0, basic_functions_1.trim)(cell.rat_scent + d_scent * 20, -50, 50);
    }
    function update_fish(location) {
        if (sea_nearby(location.cell_id)) {
            if (Math.random() < (10 - location.fish) / 100) {
                location.fish = location.fish + 1;
            }
        }
    }
    function update_cotton(location) {
        const competition = forestation(location.cell_id) + location.cotton * 20;
        if (Math.random() < 1 - competition / 200) {
            location.cotton = location.cotton + 1;
        }
    }
    function update_game(location) {
        const competition = location.small_game * 50 - forestation(location.cell_id);
        if (Math.random() < 1 - competition / 200) {
            location.small_game = location.small_game + 1;
        }
    }
    function update(dt) {
        data_objects_1.Data.Cells.for_each((cell) => {
            update_rat_scent(dt, cell);
        });
        data_objects_1.Data.Locations.for_each((location) => {
            if (Math.random() < 0.001) {
                update_cotton(location);
                update_game(location);
                update_fish(location);
            }
        });
    }
    MapSystem.update = update;
    function initial_update() {
        data_objects_1.Data.Locations.for_each((location) => {
            for (let i = 0; i < 20; i++) {
                update_cotton(location);
                update_game(location);
                update_fish(location);
            }
        });
    }
    MapSystem.initial_update = initial_update;
    function can_move(pos) {
        if (!data_objects_1.Data.World.validate_coordinates(pos))
            return false;
        let terrain = data_objects_1.Data.World.get_terrain();
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
            for (let neighbour of data_objects_1.Data.World.neighbours(current)) {
                if (data_objects_1.Data.World.id_to_terrain(neighbour) == 2 /* Terrain.sea */)
                    continue;
                if (data_objects_1.Data.World.id_to_terrain(neighbour) == 4 /* Terrain.rupture */)
                    continue;
                if (data_objects_1.Data.World.id_to_terrain(neighbour) == 0 /* Terrain.void */)
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
        const a_coord = data_objects_1.Data.World.id_to_coordinate(a);
        const b_coord = data_objects_1.Data.World.id_to_coordinate(b);
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
})(MapSystem || (exports.MapSystem = MapSystem = {}));
