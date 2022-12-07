"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_craft_item_action = exports.use_inputs = exports.check_inputs = void 0;
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
function generate_craft_item_action(inputs, item_template, durability, tier, skill) {
    return {
        duration(char) {
            return 0.5;
        },
        check: function (char, data) {
            if (char.in_battle())
                return 2 /* CharacterActionResponce.IN_BATTLE */;
            if (check_inputs(inputs, char.stash))
                return 1 /* CharacterActionResponce.OK */;
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        },
        result: function (char, data) {
            if (check_inputs(inputs, char.stash)) {
                use_inputs(inputs, char.stash);
                (0, craft_1.craft_item)(char, item_template, durability, skill, tier);
            }
        },
        start: function (char, data) {
        },
    };
}
exports.generate_craft_item_action = generate_craft_item_action;
