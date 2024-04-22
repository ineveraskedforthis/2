"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_crafts_item_list = exports.get_crafts_bulk_list = exports.craft_actions = exports.crafts_items = exports.crafts_bulk = void 0;
exports.crafts_bulk = {};
exports.crafts_items = {};
exports.craft_actions = {};
function get_crafts_bulk_list(character) {
    let list = [];
    for (let item of Object.values(exports.crafts_bulk)) {
        list.push(item);
    }
    return list;
}
exports.get_crafts_bulk_list = get_crafts_bulk_list;
function get_crafts_item_list(character) {
    let list = [];
    for (let item of Object.values(exports.crafts_items)) {
        list.push(item);
    }
    return list;
}
exports.get_crafts_item_list = get_crafts_item_list;
