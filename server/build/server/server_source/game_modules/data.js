"use strict";
// THIS MODULE MUST BE IMPORTED FIRST
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SAVE_GAME_PATH_1 = require("../SAVE_GAME_PATH");
const factions_1 = require("./factions");
const classes_1 = require("./market/classes");
const strings_management_1 = require("./strings_management");
const terrain_1 = require("./map/terrain");
// import { Cell } from "./map/cell"
var world_size = [0, 0];
var max_direction = 0;
var terrain = [];
var is_market = [];
var battles_list = [];
var battles_dict = {};
var last_id = 0;
var last_character_id = 0;
var character_list = [];
var character_id_list = [];
var characters_dict = {};
var orders_bulk = [];
var orders_item = [];
var bulk_dict = {};
var item_dict = {};
var char_id_to_orders_bulk = {};
var char_id_to_orders_item = {};
const empty_set_orders_bulk = new Set();
const empty_set_orders_item = new Set();
var last_id_bulk = 0;
var last_id_item = 0;
var reputation = {};
//BUILDINGS 
var last_id_building = 0;
//OWNERSHIP
//REFACTOR LATER TO LAW SYSTEM
var character_to_buildings = new Map();
var building_to_character = new Map();
var building_to_cell = new Map();
var cell_to_buildings = new Map();
var id_to_building = new Map();
var building_to_occupied_rooms = new Map();
var cells = [];
var id_to_cell = new Map();
var cell_to_characters_set = new Map();
const save_path = {
    REPUTATION: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'characters.txt'),
    CELLS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'cells.txt'),
    WORLD_DIMENSIONS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'description.txt'),
    TERRAIN: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_terrain.txt'),
    FORESTS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_forest.txt'),
    MARKETS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_markets.txt')
};
const save_path_bulk = path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'bulk_market.txt');
const save_path_item = path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'item_market.txt');
const loaded_flag = {
    Characters: false
};
function read_lines(file) {
    if (!fs_1.default.existsSync(file)) {
        fs_1.default.writeFileSync(file, '');
    }
    let data = fs_1.default.readFileSync(file).toString();
    return data.split('\n');
}
var Data;
(function (Data) {
    function load() {
        World.load();
        CharacterDB.load(save_path.CHARACTERS);
        BulkOrders.load();
        ItemOrders.load();
        Reputation.load(save_path.REPUTATION);
        Buildings.load(save_path.BUILDINGS);
        Buildings.load_ownership(save_path.BUILDINGS_OWNERSHIP);
        Cells.load(save_path.CELLS);
    }
    Data.load = load;
    function save() {
        CharacterDB.save();
        BulkOrders.save();
        ItemOrders.save();
        Reputation.save(save_path.REPUTATION);
        Buildings.save(save_path.BUILDINGS);
        Buildings.save_ownership(save_path.BUILDINGS_OWNERSHIP);
        Cells.save(save_path.CELLS);
    }
    Data.save = save;
    let Connection;
    (function (Connection) {
        function character_cell(character, cell) {
            let character_object = CharacterDB.from_id(character);
            let old_cell = character_object.cell_id;
            character_object.cell_id = cell;
            let set = cell_to_characters_set.get(cell);
            if (set == undefined) {
                cell_to_characters_set.set(cell, new Set([character]));
            }
            else {
                set.add(character);
            }
            cell_to_characters_set.get(old_cell)?.delete(character);
            return old_cell;
        }
        Connection.character_cell = character_cell;
    })(Connection = Data.Connection || (Data.Connection = {}));
    let World;
    (function (World) {
        World.directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
        function coordinate_to_id([x, y]) {
            return x * max_direction + y;
        }
        World.coordinate_to_id = coordinate_to_id;
        function id_to_coordinate(id) {
            let max = max_direction;
            return [Math.floor(id / max), id - Math.floor(id / max) * max];
        }
        World.id_to_coordinate = id_to_coordinate;
        function neighbours(id) {
            let arr = [];
            const [x, y] = id_to_coordinate(id);
            for (const [s, t] of World.directions) {
                const [x1, y1] = [x + s, y + t];
                if (validate_coordinates([x1, y1])) {
                    let id = coordinate_to_id([x1, y1]);
                    // arr.push([x1, y1])
                    arr.push(id);
                }
            }
            return arr;
        }
        World.neighbours = neighbours;
        function validate_coordinates([x, y]) {
            let size = get_world_dimensions();
            return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]);
        }
        World.validate_coordinates = validate_coordinates;
        function load_world_dimensions(path) {
            let data = fs_1.default.readFileSync(path).toString().split(' ');
            world_size[0] = Number(data[0]);
            world_size[1] = Number(data[0]);
            max_direction = Math.max(world_size[0], world_size[1]);
        }
        World.load_world_dimensions = load_world_dimensions;
        function load_terrain(path) {
            terrain = [];
            let lines = read_lines(path);
            for (let line of lines) {
                let terrains = line.split(' ');
                let terrain_row = [];
                for (let terrain in terrains) {
                    terrain_row.push((0, terrain_1.string_to_terrain)(terrain));
                }
                terrain.push(terrain_row);
            }
        }
        World.load_terrain = load_terrain;
        function load_markets(path) {
            terrain = [];
            let lines = read_lines(path);
            for (let line of lines) {
                let row = line.split(' ');
                let markets_row = [];
                for (let market in row) {
                    markets_row.push(Number(market) == 1);
                }
                is_market.push(markets_row);
            }
        }
        World.load_markets = load_markets;
        function load_forests(path) {
            terrain = [];
            let lines = read_lines(path);
            let x = 0;
            for (let line of lines) {
                let row = line.split(' ');
                let y = 0;
                for (let forest_level in row) {
                    let cell_id = coordinate_to_id([x, y]);
                    for (let i = 0; i < Number(forest_level); i++) {
                        let forest = {
                            durability: 100,
                            cell_id: cell_id,
                            type: "forest_plot" /* LandPlotType.ForestPlot */,
                            room_cost: 0
                        };
                        Buildings.create(forest);
                    }
                }
            }
        }
        World.load_forests = load_forests;
        function get_terrain() {
            return terrain;
        }
        World.get_terrain = get_terrain;
        function id_to_terrain(cell_id) {
            let [x, y] = id_to_coordinate(cell_id);
            return terrain[x][y];
        }
        World.id_to_terrain = id_to_terrain;
        function id_to_market(cell_id) {
            let [x, y] = id_to_coordinate(cell_id);
            return is_market[x][y];
        }
        World.id_to_market = id_to_market;
        function load() {
            load_world_dimensions(save_path.WORLD_DIMENSIONS);
            load_terrain(save_path.TERRAIN);
            load_forests(save_path.FORESTS);
            load_markets(save_path.MARKETS);
        }
        World.load = load;
        function set_world_dimensions(size) {
            world_size = size;
            max_direction = Math.max(size[0], size[1]);
        }
        World.set_world_dimensions = set_world_dimensions;
        function get_world_dimensions() {
            return world_size;
        }
        World.get_world_dimensions = get_world_dimensions;
        function get_max_dimension() {
            return max_direction;
        }
        World.get_max_dimension = get_max_dimension;
    })(World = Data.World || (Data.World = {}));
    let Cells;
    (function (Cells) {
        function save(save_path) {
            let str = '';
            id_to_cell.forEach((value, key) => {
                str += JSON.stringify({ id: key, cell: value }) + '\n';
            });
            fs_1.default.writeFileSync(save_path, str);
        }
        Cells.save = save;
        function load(save_path) {
            console.log('loading map...');
            for (let line of read_lines(save_path)) {
                if (line == '')
                    continue;
                let { id, cell } = JSON.parse(line);
                set_data(id, cell);
            }
        }
        Cells.load = load;
        function set_data(id, cell) {
            cells.push(cell);
            id_to_cell.set(id, cell);
        }
        Cells.set_data = set_data;
        function get_characters_set_from_cell(cell) {
            return cell_to_characters_set.get(cell);
        }
        Cells.get_characters_set_from_cell = get_characters_set_from_cell;
        function get_characters_list_from_cell(cell) {
            let set = get_characters_set_from_cell(cell);
            if (set == undefined)
                return [];
            return Array.from(set);
        }
        Cells.get_characters_list_from_cell = get_characters_list_from_cell;
        function get_characters_list_display(cell) {
            let set = get_characters_set_from_cell(cell);
            if (set == undefined)
                return [];
            const array = Array.from(set);
            let responce = [];
            for (const item of array) {
                let character = Data.CharacterDB.from_id(item);
                responce.push({ name: character.name, id: item });
            }
        }
        Cells.get_characters_list_display = get_characters_list_display;
        function list() {
            return cells;
        }
        Cells.list = list;
        function from_id(cell) {
            return id_to_cell.get(cell);
        }
        Cells.from_id = from_id;
        function can_clean(cell) {
            return true;
        }
        Cells.can_clean = can_clean;
        function has_forest(cell) {
            let land_plots = Buildings.from_cell_id(cell);
            if (land_plots == undefined)
                return false;
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id);
                if (plot.type != "forest_plot" /* LandPlotType.ForestPlot */)
                    continue;
                if (plot.durability > 0)
                    return true;
            }
        }
        Cells.has_forest = has_forest;
        function has_cotton(cell) {
            let land_plots = Buildings.from_cell_id(cell);
            if (land_plots == undefined)
                return false;
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id);
                if (plot.type != "cotton_field" /* LandPlotType.CottonField */)
                    continue;
                if (plot.durability > 0)
                    return true;
            }
        }
        Cells.has_cotton = has_cotton;
        function has_market(cell) {
            let [x, y] = World.id_to_coordinate(cell);
            return is_market[x][y];
        }
        Cells.has_market = has_market;
        function forestation(cell) {
            let result = 0;
            let land_plots = Buildings.from_cell_id(cell);
            if (land_plots == undefined)
                return 0;
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id);
                if (plot.type != "forest_plot" /* LandPlotType.ForestPlot */)
                    continue;
                result += plot.durability;
            }
            return result;
        }
        Cells.forestation = forestation;
        function urbanisation(cell) {
            let result = 0;
            let land_plots = Buildings.from_cell_id(cell);
            if (land_plots == undefined)
                return 0;
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id);
                if (plot.type == "human_house" /* LandPlotType.HumanHouse */)
                    result += 1;
                else if (plot.type == "elodino_house" /* LandPlotType.ElodinoHouse */)
                    result += 1;
                // else if (plot.type == LandPlotType.Shack) result += 1
                else if (plot.type == "inn" /* LandPlotType.Inn */)
                    result += 1;
            }
            return result;
        }
        Cells.urbanisation = urbanisation;
    })(Cells = Data.Cells || (Data.Cells = {}));
    let Buildings;
    (function (Buildings) {
        function load(save_path) {
            console.log('loading buildings');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { id, building } = JSON.parse(line);
                last_id_building = Math.max(id, last_id_building);
                set_data(id, building);
            }
        }
        Buildings.load = load;
        function load_ownership(save_path) {
            console.log('loading buildings ownership');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { character, building } = JSON.parse(line);
                set_ownership(character, building);
            }
        }
        Buildings.load_ownership = load_ownership;
        function save(save_path) {
            let str = '';
            id_to_building.forEach((value, key) => {
                str += JSON.stringify({ id: key, building: value }) + '\n';
            });
            fs_1.default.writeFileSync(save_path, str);
        }
        Buildings.save = save;
        function save_ownership(save_path) {
            let str = '';
            building_to_character.forEach((value, key) => {
                str += JSON.stringify({ character: value, building: key }) + '\n';
            });
            fs_1.default.writeFileSync(save_path, str);
        }
        Buildings.save_ownership = save_ownership;
        function set_ownership(character, building) {
            let buildings = character_to_buildings.get(character);
            if (buildings == undefined) {
                character_to_buildings.set(character, new Set([building]));
            }
            else {
                buildings.add(building);
            }
            building_to_character.set(building, character);
        }
        Buildings.set_ownership = set_ownership;
        function remove_ownership(character, building) {
            building_to_character.delete(building);
            let buildings = character_to_buildings.get(character);
            if (buildings == undefined)
                return;
            buildings.delete(building);
        }
        Buildings.remove_ownership = remove_ownership;
        function remove_ownership_character(character) {
            let buildings = character_to_buildings.get(character);
            if (buildings == undefined)
                return;
            for (let id of buildings.values()) {
                building_to_character.delete(id);
            }
            buildings.clear();
        }
        Buildings.remove_ownership_character = remove_ownership_character;
        function create(item) {
            last_id_building = last_id_building + 1;
            set_data(last_id_building, item);
            return last_id_building;
        }
        Buildings.create = create;
        function set_data(id, item) {
            building_to_cell.set(id, item.cell_id);
            let temp = cell_to_buildings.get(item.cell_id);
            if (temp == undefined) {
                cell_to_buildings.set(item.cell_id, new Set([id]));
            }
            else {
                temp.add(id);
            }
            id_to_building.set(id, item);
            building_to_occupied_rooms.set(id, 0);
        }
        function occupied_rooms(id) {
            return building_to_occupied_rooms.get(id);
        }
        Buildings.occupied_rooms = occupied_rooms;
        function free_room(id) {
            let rooms = occupied_rooms(id);
            building_to_occupied_rooms.set(id, rooms - 1);
        }
        Buildings.free_room = free_room;
        function occupy_room(id) {
            let rooms = occupied_rooms(id);
            building_to_occupied_rooms.set(id, rooms + 1);
        }
        Buildings.occupy_room = occupy_room;
        function from_id(id) {
            return id_to_building.get(id);
        }
        Buildings.from_id = from_id;
        function from_cell_id(id) {
            return cell_to_buildings.get(id);
        }
        Buildings.from_cell_id = from_cell_id;
        function owner(id) {
            return building_to_character.get(id);
        }
        Buildings.owner = owner;
    })(Buildings = Data.Buildings || (Data.Buildings = {}));
    let Reputation;
    (function (Reputation) {
        function load(save_path) {
            console.log('loading reputation');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let reputation_line = JSON.parse(line);
                reputation[reputation_line.char] = reputation_line.item;
            }
            console.log('reputation loaded');
        }
        Reputation.load = load;
        function save(save_path) {
            console.log('saving reputation');
            let str = '';
            for (let [char_id, item] of Object.entries(reputation)) {
                str = str + JSON.stringify({ char: char_id, item: item }) + '\n';
            }
            fs_1.default.writeFileSync(save_path, str);
            console.log('reputation saved');
        }
        Reputation.save = save;
        function from_id(faction, char_id) {
            if (reputation[char_id] == undefined)
                return 'neutral';
            let responce = reputation[char_id][faction];
            if (responce == undefined) {
                return 'neutral';
            }
            return responce.level;
        }
        Reputation.from_id = from_id;
        function list_from_id(char_id) {
            let responce = [];
            for (let faction of Object.values(factions_1.Factions)) {
                responce.push({
                    id: faction.id,
                    name: faction.name,
                    reputation: from_id(faction.id, char_id)
                });
            }
            return responce;
        }
        Reputation.list_from_id = list_from_id;
        /**
         *
         * @param a his factions are checked
         * @param X reputation level
         * @param b his reputation is checked
         * @returns **true** if b has a reputation level X with one of factions of a and **false** otherwise
         */
        function a_X_b(a, X, b) {
            if (reputation[b] == undefined)
                return false;
            if (reputation[a] == undefined)
                return false;
            const rep = reputation[a];
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == X)
                        return true;
                }
            }
            return false;
        }
        Reputation.a_X_b = a_X_b;
        /**
         * sets reputation of b to X with factions of a
         * @param a his factions are checked
         * @param X reputation level
         * @param b his reputation is changed
         * @returns
         */
        function set_a_X_b(a, X, b) {
            if (reputation[a] == undefined)
                return;
            if (reputation[b] == undefined)
                reputation[b] = {};
            const rep = reputation[a];
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    set(reputation.faction, b, X);
                }
            }
            return false;
        }
        Reputation.set_a_X_b = set_a_X_b;
        function set(faction, char_id, level) {
            if (reputation[char_id] == undefined)
                reputation[char_id] = {};
            if (reputation[char_id][faction] == undefined)
                reputation[char_id][faction] = { faction: faction, level: level };
            else
                reputation[char_id][faction].level = level;
        }
        Reputation.set = set;
        function a_is_enemy_of_b(a, b) {
            if (reputation[a] == undefined)
                return false;
            if (reputation[b] == undefined)
                return false;
            const rep = reputation[a];
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == 'enemy')
                        return true;
                }
            }
            return false;
        }
        Reputation.a_is_enemy_of_b = a_is_enemy_of_b;
    })(Reputation = Data.Reputation || (Data.Reputation = {}));
    let Battle;
    (function (Battle) {
        function increase_id() {
            last_id = last_id + 1;
        }
        Battle.increase_id = increase_id;
        function id() {
            return last_id;
        }
        Battle.id = id;
        function set_id(x) {
            last_id = x;
        }
        Battle.set_id = set_id;
        function set(id, data) {
            battles_list.push(data);
            battles_dict[id] = data;
        }
        Battle.set = set;
        function from_id(id) {
            return battles_dict[id];
        }
        Battle.from_id = from_id;
        function list() {
            return battles_list;
        }
        Battle.list = list;
    })(Battle = Data.Battle || (Data.Battle = {}));
    let CharacterDB;
    (function (CharacterDB) {
        function load(save_path) {
            if (loaded_flag.Characters) {
                return;
            }
            console.log('loading characters');
            if (!fs_1.default.existsSync(save_path)) {
                fs_1.default.writeFileSync(save_path, '');
            }
            let data = fs_1.default.readFileSync(save_path).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const character = (0, strings_management_1.string_to_character)(line);
                Data.CharacterDB.set(character.id, character);
                Data.CharacterDB.set_id(Math.max(character.id, Data.CharacterDB.id()));
                Connection.character_cell(character.id, character.cell_id);
            }
            loaded_flag.Characters = true;
            console.log('characters loaded');
        }
        CharacterDB.load = load;
        function save() {
            console.log('saving characters');
            let str = '';
            for (let item of Data.CharacterDB.list()) {
                if (item.dead())
                    continue;
                str = str + (0, strings_management_1.character_to_string)(item) + '\n';
            }
            fs_1.default.writeFileSync(save_path.CHARACTERS, str);
            console.log('characters saved');
        }
        CharacterDB.save = save;
        function increase_id() {
            last_character_id = last_character_id + 1;
        }
        CharacterDB.increase_id = increase_id;
        function id() {
            return last_character_id;
        }
        CharacterDB.id = id;
        function set_id(x) {
            last_character_id = x;
        }
        CharacterDB.set_id = set_id;
        function set(id, data) {
            character_list.push(data);
            character_id_list.push(id);
            characters_dict[id] = data;
        }
        CharacterDB.set = set;
        function from_id(id) {
            return characters_dict[id];
        }
        CharacterDB.from_id = from_id;
        function list() {
            return character_list;
        }
        CharacterDB.list = list;
        function list_of_id() {
            return character_id_list;
        }
        CharacterDB.list_of_id = list_of_id;
    })(CharacterDB = Data.CharacterDB || (Data.CharacterDB = {}));
    let BulkOrders;
    (function (BulkOrders) {
        function save() {
            console.log('saving bulk market orders');
            let str = '';
            for (let item of Data.BulkOrders.list()) {
                if (item.amount == 0)
                    continue;
                str = str + JSON.stringify(item) + '\n';
            }
            fs_1.default.writeFileSync(save_path_bulk, str);
            console.log('bulk market orders saved');
        }
        BulkOrders.save = save;
        function load() {
            console.log('loading bulk market orders');
            if (!fs_1.default.existsSync(save_path_bulk)) {
                fs_1.default.writeFileSync(save_path_bulk, '');
            }
            let data = fs_1.default.readFileSync(save_path_bulk).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const order = JSON.parse(line);
                // console.log(order)
                Data.BulkOrders.set(order.id, order.owner_id, order);
                const last_id = Data.BulkOrders.id();
                Data.BulkOrders.set_id(Math.max(order.id, last_id));
            }
            console.log('bulk market orders loaded');
        }
        BulkOrders.load = load;
        function increase_id() {
            last_id_bulk = last_id_bulk + 1;
        }
        BulkOrders.increase_id = increase_id;
        function id() {
            return last_id_bulk;
        }
        BulkOrders.id = id;
        function set_id(x) {
            last_id_bulk = x;
        }
        BulkOrders.set_id = set_id;
        function set(id, owner_id, data) {
            orders_bulk.push(data);
            bulk_dict[id] = data;
            const set = char_id_to_orders_bulk[owner_id];
            if (set == undefined)
                char_id_to_orders_bulk[owner_id] = new Set([id]);
            else
                set.add(id);
        }
        BulkOrders.set = set;
        function from_id(id) {
            return bulk_dict[id];
        }
        BulkOrders.from_id = from_id;
        function list() {
            return orders_bulk;
        }
        BulkOrders.list = list;
        function from_char_id(id) {
            return char_id_to_orders_bulk[id];
        }
        BulkOrders.from_char_id = from_char_id;
    })(BulkOrders = Data.BulkOrders || (Data.BulkOrders = {}));
    let ItemOrders;
    (function (ItemOrders) {
        function save() {
            console.log('saving item market orders');
            let str = '';
            for (let item of Data.ItemOrders.list()) {
                if (item.finished)
                    continue;
                str = str + JSON.stringify(item) + '\n';
            }
            fs_1.default.writeFileSync(save_path_item, str);
            console.log('item market orders saved');
        }
        ItemOrders.save = save;
        function load() {
            console.log('loading item market orders');
            if (!fs_1.default.existsSync(save_path_item)) {
                fs_1.default.writeFileSync(save_path_item, '');
            }
            let data = fs_1.default.readFileSync(save_path_item).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const order_raw = JSON.parse(line);
                const item = (0, strings_management_1.item_from_string)(JSON.stringify(order_raw.item));
                const order = new classes_1.OrderItem(order_raw.id, item, order_raw.price, order_raw.owner_id, order_raw.finished);
                Data.ItemOrders.set(order.id, order.owner_id, order);
                const last_id = Data.ItemOrders.id();
                Data.ItemOrders.set_id(Math.max(order.id, last_id));
            }
            console.log('item market orders loaded');
        }
        ItemOrders.load = load;
        function increase_id() {
            last_id_item = last_id_item + 1;
        }
        ItemOrders.increase_id = increase_id;
        function id() {
            return last_id_item;
        }
        ItemOrders.id = id;
        function set_id(x) {
            last_id_item = x;
        }
        ItemOrders.set_id = set_id;
        function set(id, owner_id, data) {
            orders_item.push(data);
            item_dict[id] = data;
            const set = char_id_to_orders_item[owner_id];
            if (set == undefined)
                char_id_to_orders_item[owner_id] = new Set([id]);
            else
                set.add(id);
        }
        ItemOrders.set = set;
        function from_id(id) {
            return item_dict[id];
        }
        ItemOrders.from_id = from_id;
        function list() {
            return orders_item;
        }
        ItemOrders.list = list;
    })(ItemOrders = Data.ItemOrders || (Data.ItemOrders = {}));
    function CharacterBulkOrders(char_id) {
        const set = char_id_to_orders_bulk[char_id];
        if (set == undefined)
            return empty_set_orders_bulk;
        else
            return set;
    }
    Data.CharacterBulkOrders = CharacterBulkOrders;
    function CharacterItemOrders(char_id) {
        const set = char_id_to_orders_item[char_id];
        if (set == undefined)
            return empty_set_orders_item;
        else
            return set;
    }
    Data.CharacterItemOrders = CharacterItemOrders;
})(Data = exports.Data || (exports.Data = {}));
