"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.save_path = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SAVE_GAME_PATH_1 = require("../../SAVE_GAME_PATH");
const terrain_1 = require("../map/terrain");
const data_id_1 = require("./data_id");
const location_class_1 = require("../location/location_class");
const strings_management_1 = require("./strings_management");
const classes_1 = require("../market/classes");
var character_id_object = [];
var item_id_object = [];
var market_order_id_object = [];
var cell_id_object = [];
var location_id_object = [];
var battle_id_object = [];
var factions;
exports.save_path = {
    REPUTATION: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'characters.txt'),
    CELLS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'cells.txt'),
    TRADE_ORDERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'bulk_market.txt'),
    WORLD_DIMENSIONS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'description.txt'),
    TERRAIN: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_terrain.txt'),
    FORESTS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_forest.txt'),
    MARKETS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_markets.txt'),
    FACTIONS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'factions.txt'),
    SPAWN_POINTS: path_1.default.join(SAVE_GAME_PATH_1.DEFAULT_WORLD_PATH, 'map_spawn_points.txt'),
};
function read_lines(file) {
    if (!fs_1.default.existsSync(file)) {
        fs_1.default.writeFileSync(file, '');
    }
    let data = fs_1.default.readFileSync(file).toString();
    return data.split('\n');
}
var world_size = [0, 0];
var max_direction = 0;
var terrain = [];
var is_market = [];
const loaded_flag = {
    Characters: false
};
var Data;
(function (Data) {
    function load() {
        World.load_world_dimensions(exports.save_path.WORLD_DIMENSIONS);
        Cells.load(exports.save_path.CELLS);
        World.load();
        Characters.load(exports.save_path.CHARACTERS);
        MarketOrders.load();
        // ItemOrders.load()
        Reputation.load(exports.save_path.REPUTATION);
        Locations.load(exports.save_path.BUILDINGS);
        Locations.load_ownership(exports.save_path.BUILDINGS_OWNERSHIP);
    }
    Data.load = load;
    function save() {
        Characters.save();
        MarketOrders.save();
        // ItemOrders.save()
        Reputation.save(exports.save_path.REPUTATION);
        Locations.save(exports.save_path.BUILDINGS);
        Locations.save_ownership(exports.save_path.BUILDINGS_OWNERSHIP);
        Cells.save(exports.save_path.CELLS);
    }
    Data.save = save;
    let Battles;
    (function (Battles) {
        function from_id(battle) {
            return battle_id_object[battle];
        }
        Battles.from_id = from_id;
        function for_each(callback) {
            data_id_1.DataID.Character.for_each((battle_id) => {
                const battle = battle_id_object[battle_id];
                callback(battle);
            });
        }
        Battles.for_each = for_each;
    })(Battles = Data.Battles || (Data.Battles = {}));
    let MarketOrders;
    (function (MarketOrders) {
        function save() {
            console.log('saving bulk market orders');
            let str = '';
            data_id_1.DataID.MarketOrders.for_each((order) => {
                const object = market_order_id_object[order];
                if (object.amount == 0)
                    return;
                str += JSON.stringify(object) + '\n';
            });
            fs_1.default.writeFileSync(exports.save_path.TRADE_ORDERS, str);
            console.log('bulk market orders saved');
        }
        MarketOrders.save = save;
        function load() {
            console.log('loading bulk market orders');
            if (!fs_1.default.existsSync(exports.save_path.TRADE_ORDERS)) {
                fs_1.default.writeFileSync(exports.save_path.TRADE_ORDERS, '');
            }
            let data = fs_1.default.readFileSync(exports.save_path.TRADE_ORDERS).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const order = JSON.parse(line);
                market_order_id_object[order.id] = new classes_1.MarketOrder(order.id, order.amount, order.price, order.typ, order.material, order.owner_id);
            }
            console.log('bulk market orders loaded');
        }
        MarketOrders.load = load;
        function from_number(id) {
            return market_order_id_object[id];
        }
        MarketOrders.from_number = from_number;
        function from_id(id) {
            return market_order_id_object[id];
        }
        MarketOrders.from_id = from_id;
    })(MarketOrders = Data.MarketOrders || (Data.MarketOrders = {}));
    let Reputation;
    (function (Reputation) {
        function load(save_path) {
            console.log('loading reputation');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let reputation_line = JSON.parse(line);
                for (const item of reputation_line.item) {
                    data_id_1.DataID.Reputation.set(reputation_line.character, item.faction_id, item.reputation);
                }
            }
            console.log('reputation loaded');
        }
        Reputation.load = load;
        function save(save_path) {
            console.log('saving reputation');
            let str = '';
            data_id_1.DataID.Character.for_each((character) => {
                const reputation = data_id_1.DataID.Reputation.character(character);
                const line_data = { character: character, item: reputation };
                str = str + JSON.stringify(line_data) + '\n';
            });
            fs_1.default.writeFileSync(save_path, str);
            console.log('reputation saved');
        }
        Reputation.save = save;
    })(Reputation = Data.Reputation || (Data.Reputation = {}));
    let Characters;
    (function (Characters) {
        function for_each(callback) {
            data_id_1.DataID.Character.for_each((character_id) => {
                const character = character_id_object[character_id];
                callback(character);
            });
        }
        Characters.for_each = for_each;
        function from_id(id) {
            return character_id_object[id];
        }
        Characters.from_id = from_id;
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
                character_id_object[character.id] = character;
            }
            loaded_flag.Characters = true;
            console.log('characters loaded');
        }
        Characters.load = load;
        function save() {
            console.log('saving characters');
            let str = '';
            data_id_1.DataID.Character.for_each((character) => {
                const object = character_id_object[character];
                str = str + (0, strings_management_1.character_to_string)(object) + '\n';
            });
            fs_1.default.writeFileSync(exports.save_path.CHARACTERS, str);
            console.log('characters saved');
        }
        Characters.save = save;
    })(Characters = Data.Characters || (Data.Characters = {}));
    let Cells;
    (function (Cells) {
        function save(save_path) {
            let str = '';
            cell_id_object.forEach((value, key) => {
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
                data_id_1.DataID.Cells.register(id);
                cell_id_object[id] = cell;
            }
            const dims = World.get_world_dimensions();
            for (let i = 0; i < dims[0]; i++) {
                for (let j = 0; j < dims[1]; j++) {
                    const id = World.coordinate_to_id([i, j]);
                    let cell = cell_id_object[id];
                    if (cell == undefined) {
                        cell_id_object[id] = {
                            id: id,
                            x: i,
                            y: j,
                            rat_scent: 0,
                            loaded_forest: false,
                            loaded_spawn: false,
                        };
                        data_id_1.DataID.Cells.register(id);
                    }
                }
            }
        }
        Cells.load = load;
        function from_id(cell) {
            return cell_id_object[cell];
        }
        Cells.from_id = from_id;
        function for_each(callback) {
            data_id_1.DataID.Cells.for_each((cell_id) => {
                const cell = cell_id_object[cell_id];
                callback(cell);
            });
        }
        Cells.for_each = for_each;
    })(Cells = Data.Cells || (Data.Cells = {}));
    let Locations;
    (function (Locations) {
        function load(save_path) {
            console.log('loading locations');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { id, location } = JSON.parse(line);
                data_id_1.DataID.Location.update_last_id(id);
                location_id_object[id] = new location_class_1.Location(id, location.cell_id, location);
            }
        }
        Locations.load = load;
        function load_ownership(save_path) {
            console.log('loading locations ownership');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { character, location } = JSON.parse(line);
                data_id_1.DataID.Connection.set_location_owner(character, location);
            }
        }
        Locations.load_ownership = load_ownership;
        function save(save_path) {
            let str = '';
            for (let id in location_id_object) {
                const object = location_id_object[id];
                const data = {
                    id: object.id,
                    cell_id: object.cell_id,
                    fish: object.fish,
                    cotton: object.cotton,
                    forest: object.forest,
                    berries: object.berries,
                    small_game: object.small_game,
                    devastation: object.devastation,
                    has_house_level: object.has_house_level,
                    has_bed: object.has_bed,
                    has_bowmaking_tools: object.has_bowmaking_tools,
                    has_clothier_tools: object.has_clothier_tools,
                    has_cooking_tools: object.has_cooking_tools,
                    has_cordwainer_tools: object.has_cordwainer_tools,
                    has_tanning_tools: object.has_tanning_tools,
                    has_rat_lair: object.has_rat_lair
                };
                str += JSON.stringify({ id: id, location: data });
            }
            fs_1.default.writeFileSync(save_path, str);
        }
        Locations.save = save;
        function save_ownership(save_path) {
            let str = '';
            data_id_1.DataID.Location.for_each_ownership((location, owner) => {
                if (owner != undefined) {
                    str += JSON.stringify({ character: owner, location: location }) + '\n';
                }
            });
            fs_1.default.writeFileSync(save_path, str);
        }
        Locations.save_ownership = save_ownership;
        function from_id(id) {
            return location_id_object[id];
        }
        Locations.from_id = from_id;
        function for_each(callback) {
            data_id_1.DataID.Location.for_each((location_id) => {
                const location = location_id_object[location_id];
                callback(location);
            });
        }
        Locations.for_each = for_each;
    })(Locations = Data.Locations || (Data.Locations = {}));
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
            console.log('loading terrain');
            terrain = [];
            let lines = read_lines(path);
            let stats = {};
            for (let line of lines) {
                let terrains = line.trim().split(' ');
                let terrain_row = [];
                for (let item of terrains) {
                    stats[item] = stats[item] + 1 || 0;
                    terrain_row.push((0, terrain_1.string_to_terrain)(item));
                }
                terrain.push(terrain_row);
            }
        }
        World.load_terrain = load_terrain;
        function load_markets(path) {
            let lines = read_lines(path);
            for (let line of lines) {
                let row = line.trim().split(' ');
                let markets_row = [];
                for (let market of row) {
                    markets_row.push(Number(market) == 1);
                }
                is_market.push(markets_row);
            }
        }
        World.load_markets = load_markets;
        function load_forests(path) {
            // terrain = []
            let lines = read_lines(path);
            let x = 0;
            for (let line of lines) {
                let row = line.trim().split(' ');
                if (x >= world_size[0]) {
                    continue;
                }
                let y = 0;
                for (let forest_level_string of row) {
                    let cell_id = coordinate_to_id([x, y]);
                    const cell = cell_id_object[cell_id];
                    let forest_level = Number(forest_level_string);
                    if ((!cell.loaded_forest)) {
                        while (forest_level > 0) {
                            let forest = {
                                fish: 0,
                                small_game: 10,
                                berries: 10,
                                cotton: 2,
                                forest: 100,
                                devastation: 0,
                                has_house_level: 0,
                                has_bed: false,
                                has_bowmaking_tools: false,
                                has_clothier_tools: false,
                                has_cooking_tools: false,
                                has_cordwainer_tools: false,
                                has_tanning_tools: false,
                                has_rat_lair: false
                            };
                            forest_level -= 100;
                            let location = new location_class_1.Location(undefined, cell_id, forest);
                            location_id_object[location.id] = location;
                        }
                        cell.loaded_forest = true;
                    }
                    y++;
                }
                x++;
            }
        }
        World.load_forests = load_forests;
        function load_factions(path_factions, path_spawns) {
            const lines_factions = read_lines(path_factions);
            const lines_spawns = read_lines(path_spawns);
            for (let line of lines_factions) {
                let row = line.split(';');
                let faction = {
                    tag: row[0],
                    name: row[1],
                    spawn_point: 0,
                };
                factions.push(faction);
            }
            for (let line of lines_spawns) {
                let row = line.split(' ');
                let [tag, x, y] = [row[0], Number(row[1]), Number(row[2])];
                // console.log(tag, x, y)
                for (let item of factions) {
                    if (item.tag == tag) {
                        item.spawn_point = coordinate_to_id([x, y]);
                        // console.log(id_to_coordinate(item.spawn_point))
                    }
                }
            }
            console.log(factions);
        }
        World.load_factions = load_factions;
        function set_faction_leader(faction, character) {
            data_id_1.DataID.Reputation.set(character, faction, 'leader');
        }
        World.set_faction_leader = set_faction_leader;
        function get_faction(tag) {
            for (let item of factions) {
                if (item.tag == tag) {
                    return item;
                }
            }
        }
        World.get_faction = get_faction;
        function get_factions() {
            return factions;
        }
        World.get_factions = get_factions;
        function get_terrain() {
            return terrain;
        }
        World.get_terrain = get_terrain;
        function id_to_terrain(cell_id) {
            let [x, y] = id_to_coordinate(cell_id);
            // console.log(terrain)
            // console.log(x, y)
            return terrain[x][y];
        }
        World.id_to_terrain = id_to_terrain;
        function id_to_market(cell_id) {
            let [x, y] = id_to_coordinate(cell_id);
            return is_market[x][y];
        }
        World.id_to_market = id_to_market;
        function load() {
            load_terrain(exports.save_path.TERRAIN);
            load_forests(exports.save_path.FORESTS);
            load_markets(exports.save_path.MARKETS);
            load_factions(exports.save_path.FACTIONS, exports.save_path.SPAWN_POINTS);
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
})(Data = exports.Data || (exports.Data = {}));
