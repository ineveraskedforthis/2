"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
var battles_list = [];
var battles_dict = {};
var last_id = 0;
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
})(Data = exports.Data || (exports.Data = {}));
