"use strict";
// THIS MODULE MUST BE IMPORTED FIRST
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.character_list = void 0;
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
// class EntityData<type, id_type extends number & {__brand: string}> {
//     list: type[]
//     dict: {[_ in id_type]: type}
//     constructor() {
//         this.list = []
//         this.dict = {}
//     }
// }
// const X = EntityData<Character, char_id>
var Data;
(function (Data) {
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
