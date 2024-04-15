"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_bulk_craft_action = exports.generate_craft_item_action = exports.generate_check_funtion = void 0;
const CraftBulk_1 = require("./CraftBulk");
const CraftItem_1 = require("./CraftItem");
const helpers_1 = require("./helpers");
const generic_functions_1 = require("../actions/generic_functions");
function generate_check_funtion(inputs) {
    return (char, cell) => {
        if (char.in_battle())
            return { response: 'IN_BATTLE' };
        if ((0, helpers_1.check_inputs)(inputs, char.stash))
            return { response: 'OK' };
        return { response: 'NO_RESOURCE' };
    };
}
exports.generate_check_funtion = generate_check_funtion;
function generate_craft_item_action(craft) {
    return {
        duration: generic_functions_1.dummy_duration,
        check: generate_check_funtion(craft.input),
        result: function (char, cell) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                (0, CraftItem_1.event_craft_item)(char, craft);
            }
        },
        start: generic_functions_1.dummy_start
    };
}
exports.generate_craft_item_action = generate_craft_item_action;
function generate_bulk_craft_action(craft) {
    return {
        duration: generic_functions_1.dummy_duration,
        check: generate_check_funtion(craft.input),
        result(char, cell) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                (0, CraftBulk_1.event_craft_bulk)(char, craft);
            }
        },
        start: generic_functions_1.dummy_start
    };
}
exports.generate_bulk_craft_action = generate_bulk_craft_action;
