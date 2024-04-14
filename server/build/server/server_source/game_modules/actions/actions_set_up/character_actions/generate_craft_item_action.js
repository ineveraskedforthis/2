"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_bulk_craft = exports.generate_craft_item_action = exports.generate_check_funtion = exports.dummy_start = exports.dummy_duration = exports.use_inputs = exports.check_inputs = void 0;
const craft_1 = require("../../../craft/craft");
function check_inputs(inputs, stash) {
    let flag = true;
    for (let item of inputs) {
        let tmp = stash.get(item.material);
        if ((tmp < item.amount)) {
            flag = false;
        }
    }
    return flag;
}
exports.check_inputs = check_inputs;
function use_inputs(inputs, stash) {
    for (let item of inputs) {
        stash.inc(item.material, -item.amount);
    }
}
exports.use_inputs = use_inputs;
function dummy_duration(char) {
    return 0.5;
}
exports.dummy_duration = dummy_duration;
function dummy_start(char) { }
exports.dummy_start = dummy_start;
function generate_check_funtion(inputs) {
    return (char, data) => {
        if (char.in_battle())
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        if (check_inputs(inputs, char.stash))
            return 1 /* CharacterActionResponce.OK */;
        return 3 /* CharacterActionResponce.NO_RESOURCE */;
    };
}
exports.generate_check_funtion = generate_check_funtion;
function generate_craft_item_action(inputs, item_template, durability, tier, skill) {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(inputs),
        result: function (char, data) {
            if (check_inputs(inputs, char.stash)) {
                use_inputs(inputs, char.stash);
                (0, craft_1.craft_item)(char, item_template, durability, skill, tier);
            }
        },
        start: dummy_start
    };
}
exports.generate_craft_item_action = generate_craft_item_action;
function generate_bulk_craft(inputs, material, amount, skill, tier) {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(inputs),
        result(char, data) {
            if (check_inputs(inputs, char.stash)) {
                use_inputs(inputs, char.stash);
                (0, craft_1.craft_bulk)(char, material, amount, skill, tier);
            }
        },
        start: dummy_start
    };
}
exports.generate_bulk_craft = generate_bulk_craft;













































