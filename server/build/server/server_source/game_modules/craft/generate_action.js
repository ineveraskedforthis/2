"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_bulk_craft_action = exports.generate_craft_item_action = exports.generate_check_funtion = void 0;
const action_manager_1 = require("../actions/action_manager");
const CraftBulk_1 = require("./CraftBulk");
const CraftItem_1 = require("./CraftItem");
const helpers_1 = require("./helpers");
function generate_check_funtion(inputs) {
    return (char, data) => {
        if (char.in_battle())
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        if ((0, helpers_1.check_inputs)(inputs, char.stash))
            return 1 /* CharacterActionResponce.OK */;
        return 3 /* CharacterActionResponce.NO_RESOURCE */;
    };
}
exports.generate_check_funtion = generate_check_funtion;
function generate_craft_item_action(craft) {
    return {
        duration: action_manager_1.dummy_duration,
        check: generate_check_funtion(craft.input),
        result: function (char, data) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                (0, CraftItem_1.event_craft_item)(char, craft);
            }
        },
        start: action_manager_1.dummy_start
    };
}
exports.generate_craft_item_action = generate_craft_item_action;
function generate_bulk_craft_action(craft) {
    return {
        duration: action_manager_1.dummy_duration,
        check: generate_check_funtion(craft.input),
        result(char, data) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                (0, CraftBulk_1.event_craft_bulk)(char, craft);
            }
        },
        start: action_manager_1.dummy_start
    };
}
exports.generate_bulk_craft_action = generate_bulk_craft_action;
