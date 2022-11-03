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
})(Data = exports.Data || (exports.Data = {}));
