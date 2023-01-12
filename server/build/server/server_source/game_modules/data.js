"use strict";
// THIS MODULE MUST BE IMPORTED FIRST
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.character_list = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SAVE_GAME_PATH_1 = require("../SAVE_GAME_PATH");
const factions_1 = require("./factions");
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
// class EntityData<type, id_type extends number & {__brand: string}> {
//     list: type[]
//     dict: {[_ in id_type]: type}
//     constructor() {
//         this.list = []
//         this.dict = {}
//     }
// }
// const X = EntityData<Character, char_id>
const save_path = path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'reputation.txt');
var Data;
(function (Data) {
    function load() {
        Reputation.load();
    }
    Data.load = load;
    function save() {
        Reputation.save();
    }
    Data.save = save;
    let Reputation;
    (function (Reputation) {
        function load() {
            console.log('loading reputation');
            if (!fs_1.default.existsSync(save_path)) {
                fs_1.default.writeFileSync(save_path, '');
            }
            let data = fs_1.default.readFileSync(save_path).toString();
            let lines = data.split('\n');
            for (let line of lines) {
                if (line == '') {
                    continue;
                }
                let reputation_line = JSON.parse(line);
                reputation[reputation_line.char] = reputation_line.item;
            }
            console.log('reputation loaded');
        }
        Reputation.load = load;
        function save() {
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
    let Character;
    (function (Character) {
        function increase_id() {
            last_character_id = last_character_id + 1;
        }
        Character.increase_id = increase_id;
        function id() {
            return last_character_id;
        }
        Character.id = id;
        function set_id(x) {
            last_character_id = x;
        }
        Character.set_id = set_id;
        function set(id, data) {
            exports.character_list.push(data);
            characters_dict[id] = data;
        }
        Character.set = set;
        function from_id(id) {
            return characters_dict[id];
        }
        Character.from_id = from_id;
        function list() {
            return exports.character_list;
        }
        Character.list = list;
    })(Character = Data.Character || (Data.Character = {}));
    let BulkOrders;
    (function (BulkOrders) {
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
