"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSystem = void 0;
const map_definitions_1 = require("../static_data/map_definitions");
const cell_1 = require("./cell");
var size = [0, 0];
var max_direction = 0;
var cells = [];
const dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
var MapSystem;
(function (MapSystem) {
    function load() {
        console.log('loading map');
        size = map_definitions_1.WORLD_SIZE;
        max_direction = Math.max(size[0], size[1]);
        const development = map_definitions_1.STARTING_DEVELOPMENT;
        const resources = map_definitions_1.STARTING_RESOURCES;
        const terrain = map_definitions_1.STARTING_TERRAIN;
        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                const string = x + '_' + y;
                const id = coordinate_to_id(x, y);
                const tmp = terrain[x];
                if (tmp == undefined)
                    continue;
                const cell = new cell_1.Cell(coordinate_to_id(x, y), x, y, string, development[string], resources[string], tmp[y]);
                cells[id] = cell;
            }
        }
        console.log('map is loaded');
    }
    MapSystem.load = load;
    function coordinate_to_id(x, y) {
        return x * max_direction + y;
    }
    MapSystem.coordinate_to_id = coordinate_to_id;
    function id_to_coordinate(id) {
        return [Math.floor(id / max_direction), id - Math.floor(id / max_direction) * max_direction];
    }
    MapSystem.id_to_coordinate = id_to_coordinate;
    function coordinate_to_cell(p) {
        let id = coordinate_to_id(p[0], p[1]);
        return id_to_cell(id);
    }
    MapSystem.coordinate_to_cell = coordinate_to_cell;
    function id_to_cell(id) {
        return cells[id];
    }
    MapSystem.id_to_cell = id_to_cell;
    function SAFE_id_to_cell(id) {
        return cells[id];
    }
    MapSystem.SAFE_id_to_cell = SAFE_id_to_cell;
    function neighbours(id) {
        let arr = [];
        const [x, y] = id_to_coordinate(id);
        for (const [s, t] of dp) {
            const [x1, y1] = [x + s, y + t];
            if (validate_coordinates([x1, y1])) {
                arr.push([x1, y1]);
            }
        }
        return arr;
    }
    MapSystem.neighbours = neighbours;
    function neighbours_cells(id) {
        let arr = [];
        const [x, y] = id_to_coordinate(id);
        for (const [s, t] of dp) {
            const [x1, y1] = [x + s, y + t];
            if (validate_coordinates([x1, y1])) {
                let cell = coordinate_to_cell([x1, y1]);
                if (cell != undefined)
                    arr.push(cell);
            }
        }
        return arr;
    }
    MapSystem.neighbours_cells = neighbours_cells;
    function validate_coordinates([x, y]) {
        return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]);
    }
    MapSystem.validate_coordinates = validate_coordinates;
    function update(dt) {
        for (const cell of cells) {
            if (cell == undefined)
                continue;
            cell.update(dt);
        }
    }
    MapSystem.update = update;
    function can_move(pos) {
        if ((pos[0] < 0) || (pos[0] >= size[0])) {
            return false;
        }
        if ((pos[1] < 0) || (pos[1] >= size[1])) {
            return false;
        }
        let cell = coordinate_to_cell(pos);
        if (cell == undefined) {
            return false;
        }
        if (cell.terrain == 'coast' || cell.terrain == 'steppe' || cell.terrain == 'city') {
            if (cell.development.rupture == 1) {
                return false;
            }
            return true;
        }
        return false;
    }
    MapSystem.can_move = can_move;
    function is_valid_move(dx, dy) {
        return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1));
    }
    MapSystem.is_valid_move = is_valid_move;
})(MapSystem = exports.MapSystem || (exports.MapSystem = {}));