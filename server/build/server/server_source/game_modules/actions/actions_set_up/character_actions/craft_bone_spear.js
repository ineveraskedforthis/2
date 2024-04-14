"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_bone_dagger = exports.craft_wooden_mace = exports.craft_wood_bow = exports.craft_bone_arrow = exports.craft_bone_spear = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../items/items_set_up");
const user_manager_1 = require("../../../client_communication/user_manager");
const craft_1 = require("../../../calculations/craft");
const craft_2 = require("../../../craft/craft");
exports.craft_bone_spear = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
            if ((tmp > 2) && (tmp_2 > 3)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp > 2) && (tmp_2 > 3)) {
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.stash.inc(materials_manager_1.RAT_BONE, -4);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            (0, craft_2.craft_item)(char, items_set_up_1.BONE_SPEAR_ARGUMENT, craft_1.Craft.Durability.wood_item, 'woodwork', 2);
        }
    },
    start: function (char, data) {
    },
};
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
            (0, craft_2.craft_bulk)(char, materials_manager_1.ARROW_BONE, craft_1.Craft.Amount.arrow, 'woodwork', 1);
        }
    },
    start: function (char, data) {
    },
};
exports.craft_wood_bow = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            if ((tmp >= 3)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if ((tmp >= 3)) {
            char.stash.inc(materials_manager_1.WOOD, -3);
            (0, craft_2.craft_item)(char, items_set_up_1.BASIC_BOW_ARGUMENT, craft_1.Craft.Durability.wood_item, 'woodwork', 3);
        }
    },
    start: function (char, data) {
    },
};
exports.craft_wooden_mace = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            if ((tmp >= 8)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if ((tmp >= 8)) {
            char.stash.inc(materials_manager_1.WOOD, -8);
            (0, craft_2.craft_item)(char, items_set_up_1.WOODEN_MACE_ARGUMENT, craft_1.Craft.Durability.wood_item, 'woodwork', 1);
        }
    },
    start: function (char, data) {
    },
};
exports.craft_bone_dagger = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.RAT_BONE);
            if ((tmp >= 15)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp >= 15)) {
            char.stash.inc(materials_manager_1.RAT_BONE, -15);
            (0, craft_2.craft_item)(char, items_set_up_1.BONE_DAGGER_ARGUMENT, craft_1.Craft.Durability.bone_item, 'bone_carving', 5);
        }
    },
    start: function (char, data) {
    },
};













































