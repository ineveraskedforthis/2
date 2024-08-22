"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.save_path = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const content_1 = require("../../.././../game_content/src/content");
const SAVE_GAME_PATH_1 = require("../../SAVE_GAME_PATH");
const battle_1 = require("../battle/classes/battle");
const location_class_1 = require("../location/location_class");
const terrain_1 = require("../map/terrain");
const classes_1 = require("../market/classes");
const data_id_1 = require("./data_id");
const character_1 = require("./entities/character");
const equip_1 = require("./entities/equip");
const item_1 = require("./entities/item");
const strings_management_1 = require("./strings_management");
class FatEquip extends equip_1.Equip {
}
var character_id_object = [];
var item_id_object = [];
var market_order_id_object = [];
var cell_id_object = [];
var location_id_object = [];
var battle_id_object = [];
var faction_id_object = {};
var faction_leader = {};
exports.save_path = {
    REPUTATION: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'characters.txt'),
    CELLS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'cells.txt'),
    TRADE_ORDERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'bulk_market.txt'),
    BATTLES: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'battles.txt'),
    ITEMS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, "items.txt"),
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
        World.load_terrain(exports.save_path.TERRAIN);
        Cells.load(exports.save_path.CELLS);
        Factions.load(exports.save_path.FACTIONS, exports.save_path.SPAWN_POINTS);
        World.load();
        Locations.load(exports.save_path.BUILDINGS);
        Items.load();
        Characters.load(exports.save_path.CHARACTERS);
        MarketOrders.load();
        // ItemOrders.load()
        Reputation.load(exports.save_path.REPUTATION);
        Locations.load_ownership(exports.save_path.BUILDINGS_OWNERSHIP);
        Battles.load();
    }
    Data.load = load;
    function save() {
        Characters.save();
        Items.save();
        MarketOrders.save();
        // ItemOrders.save()
        Reputation.save(exports.save_path.REPUTATION);
        Locations.save(exports.save_path.BUILDINGS);
        Locations.save_ownership(exports.save_path.BUILDINGS_OWNERSHIP);
        Cells.save(exports.save_path.CELLS);
        Battles.save();
    }
    Data.save = save;
    let Items;
    (function (Items) {
        function load() {
            console.log('loading items');
            if (!fs_1.default.existsSync(exports.save_path.ITEMS)) {
                fs_1.default.writeFileSync(exports.save_path.ITEMS, '');
            }
            let data = fs_1.default.readFileSync(exports.save_path.ITEMS).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const item = string_to_item(line);
                if (item == undefined)
                    continue;
                item_id_object[item.id] = item;
            }
            console.log('items loaded');
        }
        Items.load = load;
        function save() {
            console.log('saving items');
            let str = '';
            for_each(item => {
                str = str + item_to_string(item) + '\n';
            });
            fs_1.default.writeFileSync(exports.save_path.ITEMS, str);
            console.log('items saved');
        }
        Items.save = save;
        function item_to_string(item) {
            return JSON.stringify(item);
        }
        function create_weapon(durability, affixes, prototype) {
            const item = new item_1.Weapon(undefined, durability, affixes, prototype);
            //console.log("new weapon: ", item.id)
            item_id_object[item.id] = item;
            return item;
        }
        Items.create_weapon = create_weapon;
        function create_weapon_simple(prototype) {
            const item = create_weapon(100, [], prototype);
            return item;
        }
        Items.create_weapon_simple = create_weapon_simple;
        function create_armour(durability, affixes, prototype) {
            const item = new item_1.Armour(undefined, durability, affixes, prototype);
            //console.log("new armour: ", item.id)
            item_id_object[item.id] = item;
            return item;
        }
        Items.create_armour = create_armour;
        function create_armour_simple(prototype) {
            const item = create_armour(100, [], prototype);
            return item;
        }
        Items.create_armour_simple = create_armour_simple;
        function string_to_item(s) {
            const item_data = JSON.parse(s);
            if ("prototype_weapon" in item_data) {
                const weapon = new item_1.Weapon(item_data.id, item_data.durability, item_data.affixes, content_1.WeaponStorage.from_string(item_data["prototype_weapon"]).id);
                if (weapon.durability == null) {
                    weapon.durability = 5;
                }
                return weapon;
            }
            if ("prototype_armour" in item_data) {
                const armour = new item_1.Armour(item_data.id, item_data.durability, item_data.affixes, content_1.ArmourStorage.from_string(item_data["prototype_armour"]).id);
                if (armour.durability == null) {
                    armour.durability = 5;
                }
                return armour;
            }
            return undefined;
        }
        function from_id(item) {
            if (item == undefined)
                return undefined;
            return item_id_object[item];
        }
        Items.from_id = from_id;
        function for_each(callback) {
            data_id_1.DataID.Items.for_each((item_id) => {
                const item = item_id_object[item_id];
                callback(item);
            });
        }
        Items.for_each = for_each;
    })(Items = Data.Items || (Data.Items = {}));
    let Factions;
    (function (Factions) {
        function register(id, spawn, faction) {
            faction_id_object[id] = faction;
            data_id_1.DataID.Faction.register(id, spawn);
        }
        Factions.register = register;
        function from_id(id) {
            return faction_id_object[id];
        }
        Factions.from_id = from_id;
        function load(path_factions, path_spawns) {
            const lines_factions = read_lines(path_factions);
            const lines_spawns = read_lines(path_spawns);
            const array_faction_data = [];
            const array_faction_spawn = [];
            for (let line of lines_factions) {
                let row = line.split(';');
                let faction = {
                    tag: row[0],
                    name: row[1],
                };
                array_faction_data.push(faction);
            }
            for (let line of lines_spawns) {
                let row = line.split(' ');
                let [tag, x, y] = [row[0], Number(row[1]), Number(row[2])];
                // console.log(tag, x, y)
                for (let faction of array_faction_data) {
                    if (faction.tag == tag) {
                        const spawn_point = World.coordinate_to_id([x, y]);
                        register(faction.tag, data_id_1.DataID.Cells.main_location(spawn_point), faction);
                    }
                }
            }
            console.log(faction_id_object);
        }
        Factions.load = load;
        function set_faction_leader(faction, character) {
            data_id_1.DataID.Reputation.set(character, faction, 'leader');
            faction_leader[faction] = character;
        }
        Factions.set_faction_leader = set_faction_leader;
        function get_faction_leader(faction) {
            return faction_leader[faction];
        }
        Factions.get_faction_leader = get_faction_leader;
        function get_faction(tag) {
            return faction_id_object[tag];
        }
        Factions.get_faction = get_faction;
        function get_factions() {
            return data_id_1.DataID.Faction.list_of_id().map(get_faction);
        }
        Factions.get_factions = get_factions;
    })(Factions = Data.Factions || (Data.Factions = {}));
    let Battles;
    (function (Battles) {
        function load() {
            console.log('loading battles');
            if (!fs_1.default.existsSync(exports.save_path.BATTLES)) {
                fs_1.default.writeFileSync(exports.save_path.BATTLES, '');
            }
            let data = fs_1.default.readFileSync(exports.save_path.BATTLES).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                const battle = string_to_battle(line);
                if (battle.date_of_last_turn == '%') {
                    battle.date_of_last_turn = Date.now();
                }
                battle_id_object[battle.id] = battle;
            }
            console.log('battles loaded');
        }
        Battles.load = load;
        function save() {
            console.log('saving battles');
            let str = '';
            for_each(battle => {
                if (!battle.stopped)
                    str = str + battle_to_string(battle) + '\n';
            });
            fs_1.default.writeFileSync(exports.save_path.BATTLES, str);
            console.log('battles saved');
        }
        Battles.save = save;
        function battle_to_string(battle) {
            return JSON.stringify(battle);
        }
        function create() {
            const battle = new battle_1.Battle(undefined);
            battle_id_object[battle.id] = battle;
            return battle;
        }
        Battles.create = create;
        function string_to_battle(s) {
            const json = JSON.parse(s);
            const battle = new battle_1.Battle(json.id);
            battle.heap = json.heap;
            const unit = battle.heap[0];
            if (unit != undefined) {
                const character = Characters.from_id(unit);
                if (character.is_player()) {
                    battle.waiting_for_input = true;
                }
                else {
                    battle.waiting_for_input = false;
                }
            }
            else {
                battle.waiting_for_input = false;
            }
            battle.last_event_index = json.last_event_index;
            battle.grace_period = json.grace_period || 0;
            return battle;
        }
        function from_id(battle) {
            return battle_id_object[battle];
        }
        Battles.from_id = from_id;
        function for_each(callback) {
            data_id_1.DataID.Battle.for_each((battle_id) => {
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
        function create(amount, price, typ, tag, owner) {
            const order = new classes_1.MarketOrder(undefined, amount, price, typ, tag, owner);
            market_order_id_object[order.id] = order;
            return order;
        }
        MarketOrders.create = create;
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
        function create(location, name, template) {
            const character = new character_1.Character(undefined, undefined, undefined, location, name, template);
            character_id_object[character.id] = character;
            return character;
        }
        Characters.create = create;
        function for_each(callback) {
            data_id_1.DataID.Character.for_each((character_id) => {
                const character = character_id_object[character_id];
                callback(character);
            });
        }
        Characters.for_each = for_each;
        function from_number(id) {
            return character_id_object[id];
        }
        Characters.from_number = from_number;
        function from_id(id) {
            if (id == undefined)
                return undefined;
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
                // validation:
                const to_remove = [];
                var index = 0;
                for (const item of character.equip.data.backpack.items) {
                    if (Data.Items.from_id(item) == undefined) {
                        console.log("DETECTED INVALID ITEM");
                        to_remove.push(index);
                    }
                    index++;
                }
                for (const index of to_remove) {
                    character.equip.data.backpack.items.splice(index);
                }
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
        function for_each_guest(cell, callback) {
            data_id_1.DataID.Cells.for_each_guest(cell, (character_id) => {
                const character = character_id_object[character_id];
                callback(character);
            });
        }
        Cells.for_each_guest = for_each_guest;
        function save(save_path) {
            let str = '';
            cell_id_object.forEach((value, key) => {
                const data = {
                    id: value.id,
                    main_location: data_id_1.DataID.Cells.main_location(value.id),
                    cell: value
                };
                str += JSON.stringify(data) + '\n';
            });
            fs_1.default.writeFileSync(save_path, str);
        }
        Cells.save = save;
        function load(save_path) {
            console.log('loading map...');
            for (let line of read_lines(save_path)) {
                if (line == '')
                    continue;
                let data = JSON.parse(line);
                data_id_1.DataID.Cells.register(data.id);
                data_id_1.DataID.Connection.set_main_location(data.id, data.main_location);
                cell_id_object[data.id] = data.cell;
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
                        const main_location = Locations.create(id, {
                            fish: 0,
                            small_game: 0,
                            berries: 0,
                            cotton: 0,
                            forest: 0,
                            devastation: 0,
                            terrain: terrain[i][j],
                            has_house_level: 0,
                            has_bed: false,
                            has_bowmaking_tools: false,
                            has_clothier_tools: false,
                            has_cooking_tools: false,
                            has_cordwainer_tools: false,
                            has_rat_lair: false,
                            has_tanning_tools: false
                        });
                        data_id_1.DataID.Connection.set_main_location(id, main_location.id);
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
        function create(cell, data) {
            const location = new location_class_1.Location(undefined, cell, data);
            location_id_object[location.id] = location;
            return location;
        }
        Locations.create = create;
        function load(save_path) {
            console.log('loading locations');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { id, location } = JSON.parse(line);
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
                    has_rat_lair: object.has_rat_lair,
                    terrain: object.terrain
                };
                str += JSON.stringify({ id: id, location: data }) + '\n';
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
        function from_number(id) {
            return location_id_object[id];
        }
        Locations.from_number = from_number;
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
                    // TODO: separate world generation from terrain loading
                    let coast_probability = 0;
                    for (let neigh of World.neighbours(cell_id)) {
                        const neighbour_data = Cells.from_id(neigh);
                        if (terrain[neighbour_data.x][neighbour_data.y] == 2 /* Terrain.sea */)
                            coast_probability += 0.2;
                    }
                    let available_space = (0, terrain_1.terrain_available_space)(terrain[x][y]);
                    if ((!cell.loaded_forest)) {
                        let counter = 0;
                        let forest_density = Math.max(1, forest_level / available_space);
                        while ((forest_level > 0) && (counter < available_space)) {
                            let current_terrain = terrain[x][y];
                            if (Math.random() < coast_probability) {
                                current_terrain = 3 /* Terrain.coast */;
                                coast_probability -= 0.11;
                            }
                            let forest = {
                                fish: 0,
                                small_game: 10,
                                berries: 10,
                                cotton: 2,
                                forest: Math.floor(100 * forest_density),
                                devastation: 0,
                                has_house_level: 0,
                                has_bed: false,
                                has_bowmaking_tools: false,
                                has_clothier_tools: false,
                                has_cooking_tools: false,
                                has_cordwainer_tools: false,
                                has_tanning_tools: false,
                                has_rat_lair: false,
                                terrain: current_terrain
                            };
                            forest_level -= forest_density - 1;
                            counter++;
                            Locations.create(cell_id, forest);
                        }
                        while (counter < available_space) {
                            let current_terrain = terrain[x][y];
                            if (Math.random() < coast_probability) {
                                current_terrain = 3 /* Terrain.coast */;
                                coast_probability -= 0.11;
                            }
                            let steppe = {
                                fish: 0,
                                small_game: 2,
                                berries: 10,
                                cotton: 2,
                                forest: 0,
                                devastation: 0,
                                has_house_level: 0,
                                has_bed: false,
                                has_bowmaking_tools: false,
                                has_clothier_tools: false,
                                has_cooking_tools: false,
                                has_cordwainer_tools: false,
                                has_tanning_tools: false,
                                has_rat_lair: false,
                                terrain: current_terrain
                            };
                            counter++;
                            Locations.create(cell_id, steppe);
                        }
                        cell.loaded_forest = true;
                    }
                    y++;
                }
                x++;
            }
        }
        World.load_forests = load_forests;
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
            load_forests(exports.save_path.FORESTS);
            load_markets(exports.save_path.MARKETS);
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
})(Data || (exports.Data = Data = {}));

