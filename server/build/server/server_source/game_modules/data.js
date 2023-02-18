"use strict";
// THIS MODULE MUST BE IMPORTED FIRST
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.item_from_string = exports.item_to_string = exports.character_list = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SAVE_GAME_PATH_1 = require("../SAVE_GAME_PATH");
const character_1 = require("./character/character");
const factions_1 = require("./factions");
const classes_1 = require("./market/classes");
const Skills_1 = require("./character/Skills");
const item_1 = require("./items/item");
const damage_types_1 = require("./damage_types");
var battles_list = [];
var battles_dict = {};
var last_id = 0;
var last_character_id = 0;
exports.character_list = [];
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
var character_to_buildings = new Map();
var building_to_character = new Map();
var building_to_cell = new Map();
var cell_to_buildings = new Map();
// class EntityData<type, id_type extends number & {__brand: string}> {
//     list: type[]
//     dict: {[_ in id_type]: type}
//     constructor() {
//         this.list = []
//         this.dict = {}
//     }
// }
// const X = EntityData<Character, char_id>
const save_path = {
    REPUTATION: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'characters.txt')
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
function item_to_string(item) {
    return (JSON.stringify(item));
}
exports.item_to_string = item_to_string;
function item_from_string(s) {
    const item_data = JSON.parse(s);
    let damage = damage_types_1.DmgOps.copy(item_data.damage);
    let resistance = damage_types_1.DmgOps.copy(item_data.resists);
    return new item_1.Item(item_data.durability, item_data.affixes, item_data.slot, item_data.range, item_data.material, item_data.weapon_tag, item_data.model_tag, resistance, damage);
}
exports.item_from_string = item_from_string;
var Data;
(function (Data) {
    function load() {
        CharacterDB.load(save_path.CHARACTERS);
        BulkOrders.save();
        ItemOrders.save();
        Reputation.load(save_path.REPUTATION);
        Buildings.load_ownership(save_path.BUILDINGS_OWNERSHIP);
    }
    Data.load = load;
    function save() {
        CharacterDB.save();
        BulkOrders.save();
        ItemOrders.save();
        Reputation.save(save_path.REPUTATION);
        Buildings.save(save_path.BUILDINGS);
    }
    Data.save = save;
    let Buildings;
    (function (Buildings) {
        function load(save_path) {
            console.log('loading buildings');
        }
        Buildings.load = load;
        function load_ownership(save_path) {
            console.log('loading buildings ownership');
            for (let line of read_lines(save_path)) {
                if (line == '') {
                    continue;
                }
                let { character, buildings } = JSON.parse(line);
                set_character_buildings(character, buildings);
            }
        }
        Buildings.load_ownership = load_ownership;
        function save(save_path) {
        }
        Buildings.save = save;
        function set_character_buildings(character, buildings) {
            character_to_buildings.set(character, new Set(buildings));
            for (let building of buildings) {
                building_to_character.set(building, character);
            }
        }
        // function add_one_one
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
                const character = string_to_character(line);
                Data.CharacterDB.set(character.id, character);
                Data.CharacterDB.set_id(Math.max(character.id, Data.CharacterDB.id()));
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
                str = str + character_to_string(item) + '\n';
            }
            fs_1.default.writeFileSync(save_path.CHARACTERS, str);
            console.log('characters saved');
        }
        CharacterDB.save = save;
        function character_to_string(c) {
            let ids = [c.id, c.battle_id, c.battle_unit_id, c.user_id, c.cell_id].join('&');
            let name = c.name;
            let archetype = JSON.stringify(c.archetype);
            let equip = c.equip.to_string();
            let stash = JSON.stringify(c.stash.get_json());
            let trade_stash = JSON.stringify(c.trade_stash.get_json());
            let savings = c.savings.get();
            let trade_savings = c.trade_savings.get();
            let status = JSON.stringify(c.status);
            let skills = JSON.stringify(c.skills);
            let perks = JSON.stringify(c.perks);
            let innate_stats = JSON.stringify(c.stats);
            let explored = JSON.stringify({ data: c.explored });
            return [ids, name, archetype, equip, stash, trade_stash, savings, trade_savings, status, skills, perks, innate_stats, explored].join(';');
        }
        CharacterDB.character_to_string = character_to_string;
        function string_to_character(s) {
            const [ids, name, raw_archetype, raw_equip, raw_stash, raw_trade_stash, raw_savings, raw_trade_savings, raw_status, raw_skills, raw_perks, raw_innate_stats, raw_explored] = s.split(';');
            let [raw_id, raw_battle_id, raw_battle_unit_id, raw_user_id, raw_cell_id] = ids.split('&');
            if (raw_user_id != '#') {
                var user_id = Number(raw_user_id);
            }
            else {
                var user_id = '#';
            }
            const innate_stats = JSON.parse(raw_innate_stats);
            const stats = innate_stats.stats;
            const character = new character_1.Character(Number(raw_id), Number(raw_battle_id), Number(raw_battle_unit_id), user_id, Number(raw_cell_id), name, JSON.parse(raw_archetype), stats, innate_stats.max.hp);
            character.stats = innate_stats;
            character.explored = JSON.parse(raw_explored).data;
            character.equip.from_string(raw_equip);
            character.stash.load_from_json(JSON.parse(raw_stash));
            character.trade_stash.load_from_json(JSON.parse(raw_trade_stash));
            character.savings.inc(Number(raw_savings));
            character.trade_savings.inc(Number(raw_trade_savings));
            character.set_status(JSON.parse(raw_status));
            character.skills = new Skills_1.SkillList();
            for (let [_, item] of Object.entries(JSON.parse(raw_skills))) {
                character.skills[_] = item;
            }
            character.perks = JSON.parse(raw_perks);
            return character;
        }
        CharacterDB.string_to_character = string_to_character;
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
            exports.character_list.push(data);
            characters_dict[id] = data;
        }
        CharacterDB.set = set;
        function from_id(id) {
            return characters_dict[id];
        }
        CharacterDB.from_id = from_id;
        function list() {
            return exports.character_list;
        }
        CharacterDB.list = list;
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
                const item = item_from_string(JSON.stringify(order_raw.item));
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
