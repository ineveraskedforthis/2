"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_bone_arrow = exports.ARROW_TIER = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const craft_1 = require("../../../calculations/craft");
const craft_2 = require("../../../craft/craft");
exports.ARROW_TIER = 10;
exports.craft_bone_arrow = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
            if ((tmp >= 1) && (tmp_2 >= 10)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp >= 1) && (tmp_2 >= 10)) {
            char.stash.inc(materials_manager_1.WOOD, -1);
            char.stash.inc(materials_manager_1.RAT_BONE, -10);
            (0, craft_2.craft_bulk)(char, materials_manager_1.ARROW_BONE, craft_1.Craft.Amount.arrow, 'woodwork', 10);
        }
    },
    start: function (char, data) {
    },
};
